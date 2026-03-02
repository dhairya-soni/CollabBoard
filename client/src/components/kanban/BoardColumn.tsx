import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { statusConfig, type DisplayStatus } from '@/lib/taskConfig';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import type { Task } from '@/types/api';

interface BoardColumnProps {
  status: DisplayStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddClick?: () => void;
}

export function BoardColumn({ status, tasks, onTaskClick, onAddClick }: BoardColumnProps) {
  const config = statusConfig[status];
  const taskIds = tasks.map((t) => t.id);

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  });

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 h-[36px] px-3 mb-1">
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: config.boardColor }}
        />
        <span className="text-[12px] font-medium text-text-secondary truncate">
          {config.label}
        </span>
        <span className="text-[11px] text-text-muted tabular-nums">{tasks.length}</span>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="ml-auto h-5 w-5 rounded flex items-center justify-center text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-1.5 flex-1 px-1.5 pb-2 rounded-lg transition-colors min-h-[60px]',
            isOver && 'bg-primary/5 ring-1 ring-primary/20',
          )}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}

          {/* Empty column hint */}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center py-8 text-[11px] text-text-muted/50 italic">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
