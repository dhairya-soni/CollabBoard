/* ══════════════════════════════════════════════════════════
 * Shared API types — mirrors Prisma models as returned by
 * the Express API (camelCase, nested selects, _count).
 * ══════════════════════════════════════════════════════════ */

/* ── User (public profile fields) ── */
export interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
}

export interface UserFull extends UserProfile {
  email: string;
  createdAt: string;
}

/* ── Workspace ── */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: UserProfile;
  _count: { projects: number; members: number };
}

export interface WorkspaceDetail extends Workspace {
  members: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: UserProfile & { email: string };
}

/* ── Project ── */
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: UserProfile & { email: string };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  workspaceId: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
  projectMembers?: ProjectMember[];
}

/* ── Task ── */
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  assignee: UserProfile | null;
  creator: UserProfile;
  _count: { comments: number; attachments: number };
}

export interface TaskDetail extends Task {
  project: { id: string; name: string; workspaceId: string };
  comments: Comment[];
  attachments: Attachment[];
}

/* ── Comment ── */
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: UserProfile;
}

/* ── Attachment ── */
export interface Attachment {
  id: string;
  url: string;
  filename: string;
  mimeType: string | null;
  size: number | null;
  taskId: string;
  uploadedBy: string;
  createdAt: string;
}

/* ── API envelope ── */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
