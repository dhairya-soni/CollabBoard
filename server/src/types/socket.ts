// ─── Shared Socket.io event types ─────────────────────────────────────────────
// Keep client and server in sync: import these on the client too via a shared
// types package, or copy to client/src/types/socket.ts.

export interface PresenceUser {
  userId: string;
  name: string;
  avatar: string | null;
  color: string; // assigned cursor/avatar color
}

export interface CursorPosition {
  userId: string;
  name: string;
  color: string;
  x: number; // relative 0-1 within the board container
  y: number;
}

export interface TypingPayload {
  userId: string;
  name: string;
  taskId: string;
}

// Task update event shapes
export interface TaskMovedPayload {
  taskId: string;
  newStatus: string;
  newPosition: number;
  movedBy: string; // userId
}

export interface TaskUpdatedPayload {
  taskId: string;
  changes: Record<string, unknown>;
  updatedBy: string;
}

export interface TaskCreatedPayload {
  task: Record<string, unknown>;
  createdBy: string;
}

export interface TaskDeletedPayload {
  taskId: string;
  deletedBy: string;
}

export interface CommentAddedPayload {
  taskId: string;
  comment: Record<string, unknown>;
  addedBy: string;
}

export interface WhiteboardUpdatePayload {
  projectId: string;
  elements: Record<string, unknown>[];
  updatedBy: string;
}

// ─── Server → Client events ────────────────────────────────────────────────────
export interface ServerToClientEvents {
  // Presence
  'presence:update': (users: PresenceUser[]) => void;

  // Cursors
  'cursor:update': (payload: CursorPosition) => void;

  // Tasks
  'task:moved': (payload: TaskMovedPayload) => void;
  'task:updated': (payload: TaskUpdatedPayload) => void;
  'task:created': (payload: TaskCreatedPayload) => void;
  'task:deleted': (payload: TaskDeletedPayload) => void;

  // Comments
  'comment:added': (payload: CommentAddedPayload) => void;

  // Typing
  'typing:start': (payload: TypingPayload) => void;
  'typing:stop': (payload: TypingPayload) => void;

  // Whiteboard
  'whiteboard:update': (payload: WhiteboardUpdatePayload) => void;
}

// ─── Client → Server events ────────────────────────────────────────────────────
export interface ClientToServerEvents {
  // Room
  'room:join': (projectId: string) => void;
  'room:leave': (projectId: string) => void;

  // Cursor (client sends raw, server broadcasts to room)
  'cursor:move': (payload: Omit<CursorPosition, 'userId' | 'name' | 'color'>) => void;

  // Tasks
  'task:move': (payload: TaskMovedPayload) => void;
  'task:update': (payload: TaskUpdatedPayload) => void;
  'task:create': (payload: TaskCreatedPayload) => void;
  'task:delete': (payload: TaskDeletedPayload) => void;

  // Comments
  'comment:add': (payload: CommentAddedPayload) => void;

  // Typing
  'typing:start': (taskId: string) => void;
  'typing:stop': (taskId: string) => void;

  // Whiteboard (client → server → room, server relays)
  'whiteboard:update': (payload: { projectId: string; elements: Record<string, unknown>[] }) => void;
}

// ─── Per-socket data (attached at handshake) ───────────────────────────────────
export interface SocketData {
  userId: string;
  name: string;
  avatar: string | null;
  color: string;
}
