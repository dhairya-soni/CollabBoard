import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Activity, X, CheckCircle2, PlusCircle, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  createdAt: string;
  metadata: string | null;
  user: { id: string; name: string; avatar: string | null };
}

const actionIcon: Record<string, React.ReactNode> = {
  TASK_CREATED:   <PlusCircle  className="h-3.5 w-3.5 text-green-400" />,
  TASK_UPDATED:   <Edit2       className="h-3.5 w-3.5 text-blue-400" />,
  TASK_DELETED:   <Trash2      className="h-3.5 w-3.5 text-red-400" />,
  COMMENT_ADDED:  <MessageSquare className="h-3.5 w-3.5 text-violet-400" />,
};

function ActionLine({ action, meta }: { action: string; meta: Record<string, unknown> }) {
  switch (action) {
    case 'TASK_CREATED':
      return <><span className="text-green-400">created</span> {String(meta.title ?? '')}</>;
    case 'TASK_UPDATED': {
      const changes = meta.changes as Record<string, { from: unknown; to: unknown }> | undefined;
      const key = changes ? Object.keys(changes)[0] : null;
      if (key === 'status') {
        const to = String((changes![key]?.to ?? '')).replace('_', ' ').toLowerCase();
        return <><span className="text-blue-400">moved</span> {String(meta.title ?? '')} → <span className="text-text-primary font-medium">{to}</span></>;
      }
      return <><span className="text-blue-400">updated</span> {String(meta.title ?? '')}</>;
    }
    case 'TASK_DELETED':
      return <><span className="text-red-400">deleted</span> {String(meta.title ?? '')}</>;
    case 'COMMENT_ADDED':
      return <><span className="text-violet-400">commented</span> on {String(meta.taskTitle ?? 'a task')}</>;
    default:
      return <span>{action.toLowerCase()}</span>;
  }
}

interface Props {
  projectId: string;
  onClose: () => void;
}

export function ActivityFeed({ projectId, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/activity?limit=50`);
      return res.data.data as ActivityLog[];
    },
    refetchInterval: 15_000,
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed right-0 top-0 bottom-0 w-[300px] bg-surface border-l border-border shadow-2xl shadow-black/30 z-40 flex flex-col"
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-[13px] font-semibold text-text-primary">Activity</span>
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-text-muted px-4 text-center">
              <CheckCircle2 className="h-6 w-6 mb-2 opacity-30" />
              <p className="text-[12px]">No activity yet. Create tasks and add comments to see updates here.</p>
            </div>
          ) : (
            <div className="py-2">
              {data.map((log) => {
                const meta = log.metadata ? JSON.parse(log.metadata) as Record<string, unknown> : {};
                return (
                  <div key={log.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface-hover/40 transition-colors">
                    {/* Icon */}
                    <div className="h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                      {actionIcon[log.action] ?? <Activity className="h-3.5 w-3.5 text-text-muted" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Avatar + name */}
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        <span className="font-medium text-text-primary">{log.user.name}</span>
                        {' '}
                        <ActionLine action={log.action} meta={meta} />
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
