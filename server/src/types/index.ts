import { Request } from 'express';

/** Extends Express Request with authenticated userId */
export interface AuthRequest extends Request {
  userId?: string;
}

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/* ── Enum value unions (mirrors Prisma schema TEXT fields) ── */

export type MemberRole = 'ADMIN' | 'MEMBER';

export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type ActivityAction =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'COMMENT_ADDED'
  | 'COMMENT_UPDATED'
  | 'COMMENT_DELETED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED';
