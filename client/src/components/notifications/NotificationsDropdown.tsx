import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  metadata: string | null;
  user: { id: string; name: string; avatar: string | null };
}

function actionLabel(action: string, meta: Record<string, unknown>): string {
  switch (action) {
    case 'TASK_CREATED': return `created task "${meta.title ?? ''}"`;
    case 'TASK_UPDATED': return `updated task "${meta.title ?? ''}"`;
    case 'TASK_DELETED': return `deleted task "${meta.title ?? ''}"`;
    case 'COMMENT_ADDED': return `commented on "${meta.taskTitle ?? 'a task'}"`;
    default: return action.toLowerCase().replace('_', ' ');
  }
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/activity/mine?limit=20');
      return res.data.data as ActivityLog[];
    },
    refetchInterval: 30_000,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const hasUnread = !read && (data?.length ?? 0) > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) setRead(false); }}
        className="w-7 h-7 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors relative cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-3.5 w-3.5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute right-0 top-full mt-2 w-[340px] bg-surface border border-border-strong rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="text-[13px] font-semibold text-text-primary">Notifications</span>
              <button
                onClick={() => setRead(true)}
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                </div>
              ) : !data || data.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-text-muted">
                  <Bell className="h-5 w-5 mb-2 opacity-30" />
                  <p className="text-[12px]">No notifications yet</p>
                </div>
              ) : (
                data.map((log, i) => {
                  const meta = log.metadata ? JSON.parse(log.metadata) as Record<string, unknown> : {};
                  return (
                    <div
                      key={log.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0',
                        !read && i < 3 ? 'bg-primary/5' : '',
                      )}
                    >
                      {/* Avatar */}
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold text-primary">
                        {log.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-text-secondary leading-relaxed">
                          <span className="font-medium text-text-primary">{log.user.name}</span>
                          {' '}{actionLabel(log.action, meta)}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!read && i < 3 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
