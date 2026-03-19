import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env.js';
import { prisma } from './prisma.js';
import { verifyToken } from '../middleware/auth.js';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  PresenceUser,
} from '../types/socket.js';

// Module-level io reference so routes can broadcast without circular deps
let _io: SocketServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData> | null = null;

/** Broadcast a typed event to all sockets in a project room. */
export function broadcastToProject<E extends keyof ServerToClientEvents>(
  projectId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
) {
  _io?.to(projectId).emit(event, ...args);
}

// Cursor colors assigned round-robin per room
const CURSOR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#10b981', '#06b6d4',
];

// room → Set of userIds currently online
const roomPresence = new Map<string, Map<string, PresenceUser>>();

function getColorForRoom(roomId: string, userId: string): string {
  const room = roomPresence.get(roomId);
  if (!room) return CURSOR_COLORS[0];
  const idx = Array.from(room.keys()).indexOf(userId);
  return CURSOR_COLORS[Math.abs(idx) % CURSOR_COLORS.length];
}

function getRoomPresenceList(roomId: string): PresenceUser[] {
  return Array.from(roomPresence.get(roomId)?.values() ?? []);
}

export function createSocketServer(httpServer: HttpServer) {
  _io = new SocketServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
    httpServer,
    {
      cors: {
        origin:
          env.NODE_ENV === 'development'
            ? (origin, cb) => {
                if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
                  cb(null, true);
                } else {
                  cb(new Error('CORS: origin not allowed'));
                }
              }
            : env.CLIENT_URL,
        credentials: true,
      },
    },
  );

  // ─── Auth middleware ─────────────────────────────────────────────────────────
  _io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token as string | undefined ??
        (socket.handshake.headers.authorization?.split(' ')[1]);

      if (!token) return next(new Error('Authentication required'));

      const payload = verifyToken(token);
      if (!payload) return next(new Error('Invalid token'));

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, avatar: true },
      });
      if (!user) return next(new Error('User not found'));

      socket.data.userId = user.id;
      socket.data.name = user.name;
      socket.data.avatar = user.avatar;
      socket.data.color = CURSOR_COLORS[0]; // updated per room on join
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  // ─── Connection handler ──────────────────────────────────────────────────────
  _io.on('connection', (socket) => {
    const { userId, name, avatar } = socket.data;
    console.log(`[socket] connected: ${name} (${userId})`);

    // ── Room: join ──────────────────────────────────────────────────────────────
    socket.on('room:join', (projectId) => {
      socket.join(projectId);

      if (!roomPresence.has(projectId)) {
        roomPresence.set(projectId, new Map());
      }

      const color = getColorForRoom(projectId, userId);
      socket.data.color = color;

      const presenceUser: PresenceUser = { userId, name, avatar, color };
      roomPresence.get(projectId)!.set(userId, presenceUser);

      // Broadcast updated presence list to everyone in the room
      _io!.to(projectId).emit('presence:update', getRoomPresenceList(projectId));

      console.log(`[socket] ${name} joined room ${projectId}`);
    });

    // ── Room: leave ─────────────────────────────────────────────────────────────
    socket.on('room:leave', (projectId) => {
      socket.leave(projectId);
      roomPresence.get(projectId)?.delete(userId);
      _io!.to(projectId).emit('presence:update', getRoomPresenceList(projectId));
      console.log(`[socket] ${name} left room ${projectId}`);
    });

    // ── Cursor movement (throttled on client, just broadcast here) ─────────────
    socket.on('cursor:move', ({ x, y }) => {
      // Find which rooms this socket is in (excluding the socket's own room)
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('cursor:update', {
          userId,
          name,
          color: socket.data.color,
          x,
          y,
        });
      }
    });

    // ── Task events ─────────────────────────────────────────────────────────────
    socket.on('task:move', (payload) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('task:moved', { ...payload, movedBy: userId });
      }
    });

    socket.on('task:update', (payload) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('task:updated', { ...payload, updatedBy: userId });
      }
    });

    socket.on('task:create', (payload) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('task:created', { ...payload, createdBy: userId });
      }
    });

    socket.on('task:delete', (payload) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('task:deleted', { ...payload, deletedBy: userId });
      }
    });

    // ── Comment events ──────────────────────────────────────────────────────────
    socket.on('comment:add', (payload) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('comment:added', { ...payload, addedBy: userId });
      }
    });

    // ── Typing indicators ───────────────────────────────────────────────────────
    socket.on('typing:start', (taskId) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('typing:start', { userId, name, taskId });
      }
    });

    socket.on('typing:stop', (taskId) => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('typing:stop', { userId, name, taskId });
      }
    });

    // ── Whiteboard ──────────────────────────────────────────────────────────────
    socket.on('whiteboard:update', ({ projectId, elements }) => {
      socket.to(projectId).emit('whiteboard:update', { projectId, elements, updatedBy: userId });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Remove from all rooms presence maps
      for (const [roomId, users] of roomPresence.entries()) {
        if (users.has(userId)) {
          users.delete(userId);
          _io!.to(roomId).emit('presence:update', getRoomPresenceList(roomId));
        }
      }
      console.log(`[socket] disconnected: ${name} (${userId})`);
    });
  });

  return _io;
}
