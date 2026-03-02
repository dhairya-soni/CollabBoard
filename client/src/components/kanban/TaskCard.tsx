import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { priorityMap, priorityConfig, statusConfig, statusMap } from '@/lib/taskConfig';
import { MessageSquare, Calendar, GripVertical } from 'lucide-react';
import type { Task } from '@/types/api';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  overlay?: boolean;
}

export function TaskCard({ task, onClick, overlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dp = priorityMap[task.priority];
  const prio = priorityConfig[dp];
  const PrioIcon = prio.icon;
  const ds = statusMap[task.status];
  const stat = statusConfig[ds];
  const StatIcon = stat.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-surface border border-border rounded-lg p-3 cursor-pointer',
        'hover:border-border-strong transition-all duration-150',
        isDragging && 'opacity-40 ring-2 ring-primary/30',
        overlay && 'shadow-xl shadow-black/30 rotate-[2deg] border-primary/40',
      )}
      onClick={() => onClick(task)}
    >
      {/* Drag handle + priority */}
      <div className="flex items-center gap-1.5 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="h-5 w-5 rounded flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-tertiary hover:bg-surface-hover transition-all cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3" />
        </button>
        <PrioIcon className={cn('h-3 w-3 shrink-0', prio.color)} />
        <StatIcon className={cn('h-3 w-3 shrink-0', stat.color)} />
        <span className="text-[11px] text-text-muted font-mono ml-auto">
          {task.id.slice(-4).toUpperCase()}
        </span>
      </div>

      {/* Title */}
      <p className="text-[13px] text-text-primary font-normal leading-snug line-clamp-2 mb-2">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto">
        {/* Assignee */}
        {task.assignee && (
          <div
            className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
            title={task.assignee.name}
          >
            <span className="text-[8px] font-bold text-primary">
              {task.assignee.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Comments count */}
        {task._count.comments > 0 && (
          <div className="flex items-center gap-0.5 text-text-muted">
            <MessageSquare className="h-3 w-3" />
            <span className="text-[10px] tabular-nums">{task._count.comments}</span>
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className="flex items-center gap-0.5 text-text-muted ml-auto">
            <Calendar className="h-3 w-3" />
            <span className="text-[10px]">
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Drag overlay version (no sortable hooks) ── */
export function TaskCardOverlay({ task }: { task: Task }) {
  const dp = priorityMap[task.priority];
  const prio = priorityConfig[dp];
  const PrioIcon = prio.icon;

  return (
    <div className="bg-surface border border-primary/40 rounded-lg p-3 shadow-xl shadow-black/30 rotate-[2deg] w-[260px]">
      <div className="flex items-center gap-1.5 mb-2">
        <PrioIcon className={cn('h-3 w-3 shrink-0', prio.color)} />
        <span className="text-[11px] text-text-muted font-mono ml-auto">
          {task.id.slice(-4).toUpperCase()}
        </span>
      </div>
      <p className="text-[13px] text-text-primary font-normal leading-snug line-clamp-2">
        {task.title}
      </p>
    </div>
  );
}
