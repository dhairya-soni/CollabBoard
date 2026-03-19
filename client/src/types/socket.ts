// ─── Shared Socket.io event types (mirrors server/src/types/socket.ts) ─────────

// ─── Whiteboard element ────────────────────────────────────────────────────────
export type WBTool = 'select' | 'sticky' | 'text' | 'rect' | 'circle' | 'arrow';

export interface WBElement {
  id: string;
  type: 'sticky' | 'text' | 'rect' | 'circle' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;         // fill color
  strokeColor: string;   // stroke / text color
  fontSize: number;
  // Arrow only: absolute canvas points [x1,y1,x2,y2]
  points?: number[];
  rotation?: number;
}

export interface PresenceUser {
  userId: string;
  name: string;
  avatar: string | null;
  color: string;
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

export interface TaskMovedPayload {
  taskId: string;
  newStatus: string;
  newPosition: number;
  movedBy: string;
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
  elements: WBElement[];
  updatedBy: string;
}

// ─── Server → Client ───────────────────────────────────────────────────────────
export interface ServerToClientEvents {
  'presence:update': (users: PresenceUser[]) => void;
  'cursor:update': (payload: CursorPosition) => void;
  'task:moved': (payload: TaskMovedPayload) => void;
  'task:updated': (payload: TaskUpdatedPayload) => void;
  'task:created': (payload: TaskCreatedPayload) => void;
  'task:deleted': (payload: TaskDeletedPayload) => void;
  'comment:added': (payload: CommentAddedPayload) => void;
  'typing:start': (payload: TypingPayload) => void;
  'typing:stop': (payload: TypingPayload) => void;
  'whiteboard:update': (payload: WhiteboardUpdatePayload) => void;
}

// ─── Client → Server ───────────────────────────────────────────────────────────
export interface ClientToServerEvents {
  'room:join': (projectId: string) => void;
  'room:leave': (projectId: string) => void;
  'cursor:move': (payload: { x: number; y: number }) => void;
  'task:move': (payload: TaskMovedPayload) => void;
  'task:update': (payload: TaskUpdatedPayload) => void;
  'task:create': (payload: TaskCreatedPayload) => void;
  'task:delete': (payload: TaskDeletedPayload) => void;
  'comment:add': (payload: CommentAddedPayload) => void;
  'typing:start': (taskId: string) => void;
  'typing:stop': (taskId: string) => void;
  'whiteboard:update': (payload: { projectId: string; elements: WBElement[] }) => void;
}
