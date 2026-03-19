import { useState, useMemo, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  MoreHorizontal,
  Plus,
  Loader2,
  Users,
  LayoutGrid,
} from 'lucide-react';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';
import type { Project } from '@/types/api';
import { useTasks, useCreateTask } from '@/hooks/useTasks';
import { useProjects, useProject } from '@/hooks/useProjects';
import { usePresence } from '@/hooks/usePresence';
import { useWorkspaceStore } from '@/stores/workspace';
import { useViewStore } from '@/stores/view';
import { useFilterStore } from '@/stores/filter';
import {
  statusMap,
  priorityMap,
  statusConfig,
  priorityConfig,
  type DisplayStatus,
} from '@/lib/taskConfig';
import { KanbanBoard, TaskDetailPanel } from '@/components/kanban';
import { PresenceBar } from '@/components/realtime/PresenceBar';
import type { Task } from '@/types/api';
import { toast } from 'sonner';

/* ── Derive a short identifier from task title position ── */
function taskIdentifier(_task: Task, index: number): string {
  return `CB-${index + 1}`;
}

/* ── Issue Row ── */
function IssueRow({ task, index, onClick }: { task: Task; index: number; onClick?: (task: Task) => void }) {
  const displayStatus = statusMap[task.status];
  const displayPriority = priorityMap[task.priority];
  const status = statusConfig[displayStatus];
  const priority = priorityConfig[displayPriority];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.02 }}
      className="group flex items-center gap-3 h-[36px] px-3 border-b border-border/60 hover:bg-surface-hover/40 transition-colors cursor-pointer"
      onClick={() => onClick?.(task)}
    >
      {/* Priority */}
      <PriorityIcon className={cn('h-3.5 w-3.5 shrink-0', priority.color)} />

      {/* Issue ID */}
      <span className="text-[12px] text-text-muted font-mono w-[44px] shrink-0 tabular-nums">
        {taskIdentifier(task, index)}
      </span>

      {/* Status icon */}
      <StatusIcon className={cn('h-[14px] w-[14px] shrink-0', status.color)} />

      {/* Title */}
      <span className="text-[13px] text-text-primary truncate flex-1 font-normal">
        {task.title}
      </span>

      {/* Assignee avatar */}
      {task.assignee && (
        <div
          className="h-[18px] w-[18px] rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary shrink-0"
          title={task.assignee.name}
        >
          {task.assignee.name.substring(0, 2).toUpperCase()}
        </div>
      )}

      {/* Comment count */}
      {task._count.comments > 0 && (
        <span className="text-[11px] text-text-muted tabular-nums">
          💬 {task._count.comments}
        </span>
      )}

      {/* More actions (visible on hover) */}
      <button className="h-5 w-5 rounded flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-tertiary hover:bg-surface-hover transition-all cursor-pointer">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

/* ── Status Group ── */
function StatusGroup({
  status,
  tasks,
  globalOffset,
  onTaskClick,
}: {
  status: DisplayStatus;
  tasks: Task[];
  globalOffset: number;
  onTaskClick?: (task: Task) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (tasks.length === 0) return null;

  return (
    <div>
      {/* Group header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full h-[30px] px-3 hover:bg-surface-hover/30 transition-colors cursor-pointer"
      >
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight className="h-3 w-3 text-text-muted" />
        </motion.div>
        <StatusIcon className={cn('h-3.5 w-3.5', config.color)} />
        <span className="text-[12px] font-medium text-text-secondary">{config.label}</span>
        <span className="text-[11px] text-text-muted tabular-nums">{tasks.length}</span>
      </button>

      {/* Task rows */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {tasks.map((task, i) => (
              <IssueRow key={task.id} task={task} index={globalOffset + i} onClick={onTaskClick} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Quick-add inline form ── */
function QuickAddTask({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const createTask = useCreateTask();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask.mutateAsync({ title: title.trim(), projectId });
      toast.success('Task created');
      setTitle('');
      setOpen(false);
    } catch {
      toast.error('Failed to create task');
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full h-[32px] px-3 text-text-muted hover:text-text-tertiary hover:bg-surface-hover/30 transition-colors cursor-pointer border-t border-border/40"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="text-[12px]">New issue</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 h-[36px] border-t border-border/40 bg-surface-hover/20">
      <Plus className="h-3.5 w-3.5 text-text-muted shrink-0" />
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Issue title…"
        className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none"
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      />
      <button
        type="submit"
        disabled={createTask.isPending || !title.trim()}
        className="h-6 px-2 bg-primary text-white rounded text-[11px] font-medium disabled:opacity-50 cursor-pointer"
      >
        {createTask.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
      </button>
    </form>
  );
}

/* ── Dashboard Page ── */
function DashboardPage() {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const viewMode = useViewStore((s) => s.viewMode);
  const { status: filterStatus, priority: filterPriority, search: filterSearch } = useFilterStore();

  // If we're on /projects/:projectId use that; otherwise get first project
  const { data: projects } = useProjects(workspaceId);
  const firstProjectId = projects?.[0]?.id ?? null;
  const activeProjectId = routeProjectId ?? firstProjectId;

  const { data: project } = useProject(activeProjectId);
  const { data: tasks, isLoading } = useTasks(activeProjectId);
  const onlineUsers = usePresence(activeProjectId ?? undefined);

  // Apply client-side filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    let result = tasks;
    if (filterStatus) {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterPriority) {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, filterStatus, filterPriority, filterSearch]);

  // Task detail panel state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [managingProject, setManagingProject] = useState<Project | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  if (isLoading || !tasks) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    );
  }

  // Group by status (for list view)
  const statusOrder: DisplayStatus[] = ['in-progress', 'todo', 'backlog', 'done', 'cancelled'];
  const grouped: Record<DisplayStatus, Task[]> = {
    'backlog': [],
    'todo': [],
    'in-progress': [],
    'done': [],
    'cancelled': [],
  };
  for (const task of filteredTasks) {
    const key = statusMap[task.status];
    grouped[key].push(task);
  }

  // Calculate global offsets for continuous numbering
  let offset = 0;
  const offsets: Record<DisplayStatus, number> = {} as Record<DisplayStatus, number>;
  for (const s of statusOrder) {
    offsets[s] = offset;
    offset += grouped[s].length;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        {/* Project header */}
        {project && (
          <div className="flex items-center justify-between px-3 h-[32px] border-b border-border/60 bg-surface/30">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-secondary">{project.name}</span>
              <span className="text-[11px] text-text-muted">·</span>
              <span className="text-[11px] text-text-muted tabular-nums">{filteredTasks.length} issues</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setManagingProject(project)}
                className="flex items-center gap-1 h-6 px-2 rounded text-[11px] text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
                title="Manage project members"
              >
                <Users className="h-3 w-3" />
                <span>Members</span>
              </button>
              <Link
                to={`/projects/${activeProjectId}/whiteboard`}
                className="flex items-center gap-1 h-6 px-2 rounded text-[12px] text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                title="Open whiteboard"
              >
                <LayoutGrid className="h-3 w-3" />
                <span>Whiteboard</span>
              </Link>
              <PresenceBar users={onlineUsers} />
            </div>
          </div>
        )}

        {viewMode === 'board' ? (
          /* ── Board View ── */
          <KanbanBoard
            projectId={activeProjectId ?? undefined}
            tasks={filteredTasks}
            isLoading={isLoading}
            onTaskClick={handleTaskClick}
          />
        ) : (
          /* ── List View ── */
          <>
            <div className="divide-y divide-border/40">
              {statusOrder.map((status) => (
                <StatusGroup
                  key={status}
                  status={status}
                  tasks={grouped[status]}
                  globalOffset={offsets[status]}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>
            {activeProjectId && <QuickAddTask projectId={activeProjectId} />}
          </>
        )}

        {/* Empty state */}
        {filteredTasks.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-8 w-8 text-text-muted mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
              </svg>
            </div>
            <p className="text-[13px] text-text-tertiary">No issues yet</p>
            <p className="text-[12px] text-text-muted mt-1">Use the button below to create your first issue</p>
          </div>
        )}
      </motion.div>

      {/* Task Detail Panel */}
      <TaskDetailPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />

      {/* Project Members Panel */}
      {managingProject && (
        <ProjectMembersPanel
          project={managingProject}
          onClose={() => setManagingProject(null)}
        />
      )}
    </>
  );
}

export default DashboardPage;
