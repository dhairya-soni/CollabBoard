# Real-time Collaboration (Phase 4)

## Overview

CollabBoard uses **Socket.io** to provide live collaboration within project boards. Multiple users in the same project room see each other's changes instantly — no manual refresh needed.

---

## Architecture

```
Client (React)                     Server (Node.js)
─────────────────────────────────────────────────────
SocketProvider (context)  ←──→  socket.io attached to
  usePresence()                  HTTP server
  useCursors()                   JWT auth middleware
  useTypingIndicator()           Room manager (in-memory)
  useRealtimeTasks()             Event handlers
```

**Adapter:** In-memory (dev). The Redis adapter slot is wired and ready — swap in Phase 7 deployment by installing `@socket.io/redis-adapter` and passing it to `io.adapter(...)`.

---

## Socket Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `room:join` | `projectId` | Join a project collaboration room |
| `room:leave` | `projectId` | Leave a project room |
| `cursor:move` | `{ x, y }` | Local cursor position (0–1 relative coords) |
| `task:move` | `TaskMovedPayload` | Broadcast drag-drop result |
| `task:update` | `TaskUpdatedPayload` | Broadcast field edits |
| `task:create` | `TaskCreatedPayload` | Broadcast new task |
| `task:delete` | `TaskDeletedPayload` | Broadcast task deletion |
| `comment:add` | `CommentAddedPayload` | Broadcast new comment |
| `typing:start` | `taskId` | User started typing in comments |
| `typing:stop` | `taskId` | User stopped typing in comments |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `presence:update` | `PresenceUser[]` | Full list of online users in room |
| `cursor:update` | `CursorPosition` | Another user's cursor position |
| `task:moved` | `TaskMovedPayload` | Someone moved a task |
| `task:updated` | `TaskUpdatedPayload` | Someone edited a task |
| `task:created` | `TaskCreatedPayload` | Someone created a task |
| `task:deleted` | `TaskDeletedPayload` | Someone deleted a task |
| `comment:added` | `CommentAddedPayload` | Someone added a comment |
| `typing:start` | `TypingPayload` | Someone is typing |
| `typing:stop` | `TypingPayload` | Someone stopped typing |

---

## Key Files

### Server
- `server/src/lib/socketServer.ts` — Socket.io server setup, auth middleware, all event handlers
- `server/src/types/socket.ts` — Shared event type definitions
- `server/src/middleware/auth.ts` — `verifyToken()` helper used by socket auth
- `server/src/index.ts` — HTTP server creation + socket attachment

### Client
- `client/src/lib/socket.ts` — Socket singleton (connect/disconnect)
- `client/src/context/SocketContext.tsx` — React context + `useSocket()` hook
- `client/src/hooks/usePresence.ts` — Join room, track online users
- `client/src/hooks/useCursors.ts` — Emit local cursor, receive remote cursors
- `client/src/hooks/useTypingIndicator.ts` — Typing events + auto-clear timeout
- `client/src/hooks/useRealtimeTasks.ts` — Invalidate TanStack Query on remote task changes
- `client/src/components/realtime/CursorOverlay.tsx` — Animated remote cursor pointers
- `client/src/components/realtime/PresenceBar.tsx` — Stacked avatar row in board header

---

## Authentication

Socket connections require a valid JWT (same token used for REST API):

```ts
// Client sends token at connection time
const socket = io(SOCKET_URL, { auth: { token } });

// Server verifies on handshake middleware
io.use(async (socket, next) => {
  const payload = verifyToken(socket.handshake.auth.token);
  if (!payload) return next(new Error('Invalid token'));
  // Attach user data to socket.data
  next();
});
```

---

## Cursor Tracking

Cursor positions are sent as **normalized 0–1 coordinates** relative to the board container, so they work regardless of window size:

```ts
const x = (e.clientX - rect.left) / rect.width;
const y = (e.clientY - rect.top) / rect.height;
socket.emit('cursor:move', { x, y });
```

Throttled to **50ms** (~20fps) on the client to avoid flooding the server.

---

## Conflict Resolution Strategy

- **Own-user events filtered:** When you receive a `task:moved` event with `movedBy === yourUserId`, it's ignored — your optimistic update already applied it.
- **Remote changes:** `useRealtimeTasks` calls `invalidateQueries` which re-fetches the authoritative server state. This ensures eventual consistency without complex CRDT logic.

---

## Upgrading to Redis (Phase 7)

To support horizontal scaling with multiple server instances:

```bash
npm install @socket.io/redis-adapter ioredis
```

```ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'ioredis';

const pubClient = createClient({ url: env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```
