import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  ChevronRight,
  MoreHorizontal,
  Plus,
} from 'lucide-react';

/* ── Types ── */
type IssueStatus = 'backlog' | 'todo' | 'in-progress' | 'done' | 'cancelled';
type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

interface Issue {
  id: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: { name: string; color: string };
  label?: { text: string; color: string };
}

/* ── Status config ── */
const statusConfig: Record<IssueStatus, { icon: React.ElementType; color: string; label: string }> = {
  backlog: { icon: CircleDashed, color: 'text-text-muted', label: 'Backlog' },
  todo: { icon: Circle, color: 'text-text-tertiary', label: 'Todo' },
  'in-progress': { icon: CircleDot, color: 'text-[#F5A623]', label: 'In Progress' },
  done: { icon: CheckCircle2, color: 'text-[#5E6AD2]', label: 'Done' },
  cancelled: { icon: XCircle, color: 'text-text-muted', label: 'Cancelled' },
};

/* ── Priority config ── */
const priorityConfig: Record<IssuePriority, { icon: React.ElementType; color: string }> = {
  urgent: { icon: AlertTriangle, color: 'text-[#F44336]' },
  high: { icon: SignalHigh, color: 'text-[#FB923C]' },
  medium: { icon: SignalMedium, color: 'text-[#F5A623]' },
  low: { icon: SignalLow, color: 'text-text-tertiary' },
  none: { icon: SignalLow, color: 'text-text-muted' },
};

/* ── Mock data ── */
const mockIssues: Issue[] = [
  { id: 'CB-1', title: 'Welcome to CollabBoard 👋', status: 'todo', priority: 'medium', label: { text: 'Onboarding', color: '#5E6AD2' } },
  { id: 'CB-4', title: 'Connect GitHub or GitLab', status: 'todo', priority: 'high', assignee: { name: 'DS', color: '#8B5CF6' } },
  { id: 'CB-2', title: 'Try 3 ways to navigate: Command line, keyboard or mouse', status: 'todo', priority: 'low', label: { text: 'Guide', color: '#22C55E' } },
  { id: 'CB-5', title: 'Customize settings', status: 'todo', priority: 'medium', assignee: { name: 'JD', color: '#3B82F6' } },
  { id: 'CB-3', title: 'Connect to Slack', status: 'in-progress', priority: 'medium', label: { text: 'Integration', color: '#F59E0B' } },
  { id: 'CB-8', title: 'ProTip: Mouse over this issue & press [Space]', status: 'in-progress', priority: 'low' },
  { id: 'CB-6', title: 'Set up infinite canvas board', status: 'in-progress', priority: 'high', assignee: { name: 'AK', color: '#EC4899' }, label: { text: 'Feature', color: '#8B5CF6' } },
  { id: 'CB-7', title: 'Implement real-time collaboration via WebSocket', status: 'backlog', priority: 'urgent', label: { text: 'Core', color: '#EF4444' } },
  { id: 'CB-9', title: 'Add drag-and-drop task reordering', status: 'backlog', priority: 'high' },
  { id: 'CB-10', title: 'Design system component audit', status: 'done', priority: 'medium', assignee: { name: 'DS', color: '#8B5CF6' }, label: { text: 'Design', color: '#5E6AD2' } },
];

/* ── Group issues by status ── */
function groupByStatus(issues: Issue[]): Record<IssueStatus, Issue[]> {
  const groups: Record<IssueStatus, Issue[]> = {
    'backlog': [],
    'todo': [],
    'in-progress': [],
    'done': [],
    'cancelled': [],
  };
  for (const issue of issues) {
    groups[issue.status].push(issue);
  }
  return groups;
}

/* ── Issue Row ── */
function IssueRow({ issue, index }: { issue: Issue; index: number }) {
  const status = statusConfig[issue.status];
  const priority = priorityConfig[issue.priority];
  const StatusIcon = status.icon;
  const PriorityIcon = priority.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03 }}
      className="group flex items-center gap-3 h-[36px] px-3 border-b border-border/60 hover:bg-surface-hover/40 transition-colors cursor-pointer"
    >
      {/* Priority */}
      <PriorityIcon className={cn('h-3.5 w-3.5 shrink-0', priority.color)} />

      {/* Issue ID */}
      <span className="text-[12px] text-text-muted font-mono w-[44px] shrink-0 tabular-nums">
        {issue.id}
      </span>

      {/* Status icon */}
      <StatusIcon className={cn('h-[14px] w-[14px] shrink-0', status.color)} />

      {/* Title */}
      <span className="text-[13px] text-text-primary truncate flex-1 font-normal">
        {issue.title}
      </span>

      {/* Label */}
      {issue.label && (
        <span
          className="hidden sm:inline-flex items-center h-[18px] rounded-full px-2 text-[10px] font-medium border shrink-0"
          style={{
            color: issue.label.color,
            borderColor: `${issue.label.color}25`,
            backgroundColor: `${issue.label.color}10`,
          }}
        >
          {issue.label.text}
        </span>
      )}

      {/* Assignee avatar */}
      {issue.assignee && (
        <div
          className="h-[18px] w-[18px] rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
          style={{ backgroundColor: issue.assignee.color }}
          title={issue.assignee.name}
        >
          {issue.assignee.name}
        </div>
      )}

      {/* More actions (visible on hover) */}
      <button className="h-5 w-5 rounded flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-tertiary hover:bg-surface-hover transition-all cursor-pointer">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

/* ── Status Group ── */
function StatusGroup({ status, issues }: { status: IssueStatus; issues: Issue[] }) {
  const [expanded, setExpanded] = useState(true);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (issues.length === 0) return null;

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
        <span className="text-[11px] text-text-muted tabular-nums">{issues.length}</span>

        {/* Add issue to group */}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Plus className="h-3 w-3 text-text-muted" />
        </div>
      </button>

      {/* Issue rows */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {issues.map((issue, i) => (
              <IssueRow key={issue.id} issue={issue} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Dashboard Page ── */
function DashboardPage() {
  const grouped = groupByStatus(mockIssues);
  const statusOrder: IssueStatus[] = ['in-progress', 'todo', 'backlog', 'done', 'cancelled'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      {/* Issue list */}
      <div className="divide-y divide-border/40">
        {statusOrder.map((status) => (
          <StatusGroup key={status} status={status} issues={grouped[status]} />
        ))}
      </div>

      {/* Bottom: quick add */}
      <button className="flex items-center gap-2 w-full h-[32px] px-3 text-text-muted hover:text-text-tertiary hover:bg-surface-hover/30 transition-colors cursor-pointer border-t border-border/40">
        <Plus className="h-3.5 w-3.5" />
        <span className="text-[12px]">New issue</span>
      </button>
    </motion.div>
  );
}

export default DashboardPage;
