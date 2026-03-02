import {
  Circle,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  XCircle,
  SignalLow,
  SignalMedium,
  SignalHigh,
  AlertTriangle,
} from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@/types/api';

/* ── Display keys (lowercase/hyphenated) ── */
export type DisplayStatus = 'backlog' | 'todo' | 'in-progress' | 'done' | 'cancelled';
export type DisplayPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

/* ── API → display mappings ── */
export const statusMap: Record<TaskStatus, DisplayStatus> = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

export const reverseStatusMap: Record<DisplayStatus, TaskStatus> = {
  backlog: 'BACKLOG',
  todo: 'TODO',
  'in-progress': 'IN_PROGRESS',
  done: 'DONE',
  cancelled: 'CANCELLED',
};

export const priorityMap: Record<TaskPriority, DisplayPriority> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none',
};

/* ── Status config ── */
export const statusConfig: Record<
  DisplayStatus,
  { icon: React.ElementType; color: string; label: string; boardColor: string }
> = {
  backlog: { icon: CircleDashed, color: 'text-text-muted', label: 'Backlog', boardColor: '#4C4F6B' },
  todo: { icon: Circle, color: 'text-text-tertiary', label: 'Todo', boardColor: '#858699' },
  'in-progress': { icon: CircleDot, color: 'text-[#F5A623]', label: 'In Progress', boardColor: '#F5A623' },
  done: { icon: CheckCircle2, color: 'text-[#5E6AD2]', label: 'Done', boardColor: '#5E6AD2' },
  cancelled: { icon: XCircle, color: 'text-text-muted', label: 'Cancelled', boardColor: '#4C4F6B' },
};

/* ── Priority config ── */
export const priorityConfig: Record<
  DisplayPriority,
  { icon: React.ElementType; color: string; label: string; order: number }
> = {
  urgent: { icon: AlertTriangle, color: 'text-[#F44336]', label: 'Urgent', order: 0 },
  high: { icon: SignalHigh, color: 'text-[#FB923C]', label: 'High', order: 1 },
  medium: { icon: SignalMedium, color: 'text-[#F5A623]', label: 'Medium', order: 2 },
  low: { icon: SignalLow, color: 'text-text-tertiary', label: 'Low', order: 3 },
  none: { icon: SignalLow, color: 'text-text-muted', label: 'No priority', order: 4 },
};

/* ── Column ordering for board view ── */
export const statusOrder: DisplayStatus[] = ['backlog', 'todo', 'in-progress', 'done', 'cancelled'];
