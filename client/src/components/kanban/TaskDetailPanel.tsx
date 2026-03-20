import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  X,
  Loader2,
  Send,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';
import {
  statusConfig,
  priorityConfig,
  statusMap,
  priorityMap,
  reverseStatusMap,
  statusOrder,
  type DisplayStatus,
  type DisplayPriority,
} from '@/lib/taskConfig';
import { useTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useCreateComment } from '@/hooks/useComments';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useWorkspace } from '@/hooks/useWorkspaces';
import type { TaskStatus, TaskPriority } from '@/types/api';
import { toast } from 'sonner';

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const { data: task, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Fetch workspace members for assignee dropdown
  const workspaceId = (task as { project?: { workspaceId?: string } } | undefined)?.project?.workspaceId ?? null;
  const { data: workspace } = useWorkspace(workspaceId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  const createComment = useCreateComment();
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(taskId ?? '');

  // Sync local state when task loads
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
    }
  }, [task]);

  const handleTitleBlur = () => {
    if (task && title.trim() && title !== task.title) {
      updateTask.mutate({ id: task.id, title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (task && description !== (task.description ?? '')) {
      updateTask.mutate({ id: task.id, description: description || undefined });
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (task) {
      updateTask.mutate({ id: task.id, status });
    }
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (task) {
      updateTask.mutate({ id: task.id, priority });
    }
  };

  const handleDelete = () => {
    if (task) {
      deleteTask.mutate(task.id, {
        onSuccess: () => {
          toast.success('Task deleted');
          onClose();
        },
        onError: () => toast.error('Failed to delete task'),
      });
    }
  };

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !task) return;
    stopTyping();
    createComment.mutate(
      { content: comment.trim(), taskId: task.id },
      {
        onSuccess: () => {
          setComment('');
          toast.success('Comment added');
        },
        onError: () => toast.error('Failed to add comment'),
      },
    );
  };

  return (
    <AnimatePresence>
      {taskId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-background border-l border-border z-50 flex flex-col shadow-2xl shadow-black/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-[44px] px-4 border-b border-border shrink-0">
              <span className="text-[11px] text-text-muted font-mono">
                {task ? task.id.slice(-6).toUpperCase() : '...'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-surface-hover transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isLoading || !task ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Title */}
                <div className="px-5 pt-5 pb-2">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="w-full text-[18px] font-semibold text-text-primary bg-transparent border-none outline-none placeholder:text-text-muted"
                    placeholder="Task title…"
                  />
                </div>

                {/* Properties */}
                <div className="px-5 py-3 space-y-2.5 border-b border-border/60">
                  {/* Status */}
                  <PropertyRow label="Status">
                    <select
                      value={statusMap[task.status]}
                      onChange={(e) =>
                        handleStatusChange(reverseStatusMap[e.target.value as DisplayStatus])
                      }
                      className="bg-surface border border-border-strong/50 rounded px-2 h-7 text-[12px] text-text-secondary outline-none cursor-pointer hover:border-border-strong transition-colors"
                    >
                      {statusOrder.map((s) => {
                        const cfg = statusConfig[s];
                        return (
                          <option key={s} value={s}>
                            {cfg.label}
                          </option>
                        );
                      })}
                    </select>
                  </PropertyRow>

                  {/* Priority */}
                  <PropertyRow label="Priority">
                    <select
                      value={priorityMap[task.priority]}
                      onChange={(e) => {
                        const reversePriorityMap: Record<DisplayPriority, TaskPriority> = {
                          urgent: 'URGENT',
                          high: 'HIGH',
                          medium: 'MEDIUM',
                          low: 'LOW',
                          none: 'NONE',
                        };
                        handlePriorityChange(reversePriorityMap[e.target.value as DisplayPriority]);
                      }}
                      className="bg-surface border border-border-strong/50 rounded px-2 h-7 text-[12px] text-text-secondary outline-none cursor-pointer hover:border-border-strong transition-colors"
                    >
                      {(['urgent', 'high', 'medium', 'low', 'none'] as const).map((p) => {
                        const cfg = priorityConfig[p];
                        return (
                          <option key={p} value={p}>
                            {cfg.label}
                          </option>
                        );
                      })}
                    </select>
                  </PropertyRow>

                  {/* Assignee */}
                  <PropertyRow label="Assignee">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-text-muted shrink-0" />
                      <select
                        value={task.assignee?.id ?? ''}
                        onChange={(e) =>
                          updateTask.mutate({ id: task.id, assigneeId: e.target.value || undefined })
                        }
                        className="bg-surface border border-border-strong/50 rounded px-2 h-7 text-[12px] text-text-secondary outline-none cursor-pointer hover:border-border-strong transition-colors"
                      >
                        <option value="">Unassigned</option>
                        {(workspace?.members ?? []).map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </PropertyRow>

                  {/* Due date */}
                  <PropertyRow label="Due date">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-text-muted shrink-0" />
                      <input
                        type="date"
                        value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''}
                        onChange={(e) =>
                          updateTask.mutate({ id: task.id, dueDate: e.target.value || undefined })
                        }
                        className="bg-surface border border-border-strong/50 rounded px-2 h-7 text-[12px] text-text-secondary outline-none cursor-pointer hover:border-border-strong transition-colors"
                      />
                    </div>
                  </PropertyRow>

                  {/* Project */}
                  {'project' in task && task.project && (
                    <PropertyRow label="Project">
                      <span className="text-[12px] text-text-secondary px-2">
                        {task.project.name}
                      </span>
                    </PropertyRow>
                  )}
                </div>

                {/* Description */}
                <div className="px-5 py-4 border-b border-border/60">
                  <label className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    rows={4}
                    placeholder="Add a description…"
                    className="w-full bg-surface border border-border-strong/50 rounded-lg p-3 text-[13px] text-text-primary placeholder:text-text-muted outline-none resize-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Comments */}
                <div className="px-5 py-4">
                  <label className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-3 block">
                    Comments ({task.comments?.length ?? task._count.comments})
                  </label>

                  {/* Comment list */}
                  <div className="space-y-3 mb-4">
                    {task.comments?.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-primary">
                            {c.user.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[12px] font-medium text-text-secondary">
                              {c.user.name}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(c.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-[13px] text-text-primary/80 leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {(!task.comments || task.comments.length === 0) && (
                      <p className="text-[12px] text-text-muted italic py-2">No comments yet</p>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleCommentSubmit} className="flex gap-2">
                    <input
                      value={comment}
                      onChange={(e) => { setComment(e.target.value); startTyping(); }}
                      onBlur={stopTyping}
                      placeholder="Write a comment…"
                      className="flex-1 h-8 bg-surface border border-border-strong/50 rounded px-3 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!comment.trim() || createComment.isPending}
                      className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white disabled:opacity-50 cursor-pointer hover:bg-primary-hover transition-colors"
                    >
                      {createComment.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </form>

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <p className="text-[11px] text-text-muted mt-1.5 italic">
                      {typingUsers.map((u) => u.name).join(', ')}{' '}
                      {typingUsers.length === 1 ? 'is' : 'are'} typing…
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="px-5 py-3 border-t border-border/60">
                  <div className="flex items-center gap-4 text-[10px] text-text-muted">
                    <span>
                      Created{' '}
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      Updated{' '}
                      {new Date(task.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {task.creator && <span>by {task.creator.name}</span>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Helper: property row ── */
function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('text-[12px] text-text-muted w-[80px] shrink-0')}>{label}</span>
      {children}
    </div>
  );
}
