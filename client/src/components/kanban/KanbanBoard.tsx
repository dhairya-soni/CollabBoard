import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
  statusOrder,
  statusMap,
  reverseStatusMap,
  type DisplayStatus,
} from '@/lib/taskConfig';
import { BoardColumn } from './BoardColumn';
import { TaskCardOverlay } from './TaskCard';
import { useUpdateTask } from '@/hooks/useTasks';
import type { Task } from '@/types/api';

interface KanbanBoardProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskClick: (task: Task) => void;
}

export function KanbanBoard({ tasks, isLoading, onTaskClick }: KanbanBoardProps) {
  const updateTask = useUpdateTask();

  /* ── Group tasks by status ── */
  const columns = useMemo(() => {
    const grouped: Record<DisplayStatus, Task[]> = {
      backlog: [],
      todo: [],
      'in-progress': [],
      done: [],
      cancelled: [],
    };
    for (const task of tasks) {
      const key = statusMap[task.status];
      grouped[key].push(task);
    }
    // Sort by position within each column
    for (const key of statusOrder) {
      grouped[key].sort((a, b) => a.position - b.position);
    }
    return grouped;
  }, [tasks]);

  /* ── Local state for optimistic reordering during drag ── */
  const [localColumns, setLocalColumns] = useState<Record<DisplayStatus, Task[]> | null>(null);
  const displayColumns = localColumns ?? columns;

  /* When tasks change from server, reset local state */
  useMemo(() => {
    setLocalColumns(null);
  }, [tasks]);

  /* ── DnD state ── */
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const findColumn = useCallback(
    (taskId: string): DisplayStatus | null => {
      const cols = localColumns ?? columns;
      for (const status of statusOrder) {
        if (cols[status].some((t) => t.id === taskId)) return status;
      }
      return null;
    },
    [columns, localColumns],
  );

  /* ── Drag handlers ── */
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
      // Initialize local columns for optimistic updates
      setLocalColumns({ ...columns });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !localColumns) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumn(activeId);
    // Determine target column
    let overCol: DisplayStatus | null = null;
    if (overId.startsWith('column-')) {
      overCol = overId.replace('column-', '') as DisplayStatus;
    } else {
      overCol = findColumn(overId);
    }

    if (!activeCol || !overCol || activeCol === overCol) return;

    setLocalColumns((prev) => {
      if (!prev) return prev;
      const sourceItems = [...prev[activeCol]];
      const destItems = [...prev[overCol]];

      const activeIndex = sourceItems.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;

      const movedTask = sourceItems.splice(activeIndex, 1)[0];
      if (!movedTask) return prev;

      // Find index to insert at
      const overIndex = overId.startsWith('column-')
        ? destItems.length
        : destItems.findIndex((t) => t.id === overId);

      destItems.splice(overIndex >= 0 ? overIndex : destItems.length, 0, movedTask);

      return {
        ...prev,
        [activeCol]: sourceItems,
        [overCol]: destItems,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !localColumns) {
      setLocalColumns(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumn(activeId);
    let overCol: DisplayStatus | null = null;
    if (overId.startsWith('column-')) {
      overCol = overId.replace('column-', '') as DisplayStatus;
    } else {
      overCol = findColumn(overId);
    }

    if (!activeCol || !overCol) {
      setLocalColumns(null);
      return;
    }

    // Handle reorder within same column
    if (activeCol === overCol && !overId.startsWith('column-')) {
      const items = localColumns[activeCol];
      const oldIndex = items.findIndex((t) => t.id === activeId);
      const newIndex = items.findIndex((t) => t.id === overId);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        setLocalColumns((prev) => (prev ? { ...prev, [activeCol]: reordered } : prev));
      }
    }

    // Persist to API
    const newStatus = reverseStatusMap[overCol];
    const theTask = tasks.find((t) => t.id === activeId);
    if (!theTask) {
      setLocalColumns(null);
      return;
    }

    // Only call API if something changed
    if (theTask.status !== newStatus) {
      updateTask.mutate(
        { id: activeId, status: newStatus },
        {
          onError: () => {
            // Revert on failure
            setLocalColumns(null);
          },
        },
      );
    }

    // Don't clear local columns immediately – let the query invalidation handle it
    // setLocalColumns(null) will happen when tasks change via useMemo above
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex gap-2 p-3 overflow-x-auto h-[calc(100vh-80px)]"
      >
        {statusOrder.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={displayColumns[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </motion.div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
