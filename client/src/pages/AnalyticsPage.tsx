import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useProjects } from '@/hooks/useProjects';
import { useWorkspaceStore } from '@/stores/workspace';

interface AnalyticsData {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  createdByDay: { date: string; count: number }[];
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG:     '#6b7280',
  TODO:        '#6366f1',
  IN_PROGRESS: '#f59e0b',
  DONE:        '#10b981',
  CANCELLED:   '#f43f5e',
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#f43f5e',
  HIGH:   '#f97316',
  MEDIUM: '#eab308',
  LOW:    '#6366f1',
  NONE:   '#6b7280',
};

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[26px] font-semibold text-text-primary tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data: projects } = useProjects(workspaceId);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const projectId = selectedProjectId || projects?.[0]?.id || '';

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/analytics`);
      return res.data.data as AnalyticsData;
    },
    enabled: !!projectId,
  });

  const statusData = Object.entries(data?.byStatus ?? {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    fill: STATUS_COLORS[name] ?? '#6366f1',
  }));

  const priorityData = Object.entries(data?.byPriority ?? {}).map(([name, value]) => ({
    name,
    value,
    fill: PRIORITY_COLORS[name] ?? '#6366f1',
  }));

  const doneCount = data?.byStatus?.DONE ?? 0;
  const completionRate = data?.total ? Math.round((doneCount / data.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="px-6 py-5 max-w-5xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            Analytics
          </h1>
          <p className="text-[12px] text-text-tertiary mt-0.5">Task metrics and project health</p>
        </div>

        {/* Project selector */}
        {projects && projects.length > 0 && (
          <select
            value={selectedProjectId || projects[0]?.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8 bg-surface border border-border-strong rounded px-2.5 text-[12px] text-text-primary outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
        </div>
      ) : !data ? null : (
        <div className="space-y-6">
          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Tasks" value={data.total} />
            <StatCard label="Completed" value={doneCount} sub={`${completionRate}% done`} />
            <StatCard label="In Progress" value={data.byStatus.IN_PROGRESS ?? 0} />
            <StatCard label="Backlog" value={data.byStatus.BACKLOG ?? 0} />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tasks by status — donut */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-[12px] font-medium text-text-secondary mb-4">By Status</p>
              {statusData.length === 0 ? (
                <div className="flex items-center justify-center h-[180px] text-[12px] text-text-muted">No tasks yet</div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={180}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1D1E2B', border: '1px solid #2C2D3C', borderRadius: 6, fontSize: 12 }}
                        labelStyle={{ color: '#EEEFFC' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5">
                    {statusData.map((s) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.fill }} />
                        <span className="text-[11px] text-text-secondary capitalize">{s.name.toLowerCase()}</span>
                        <span className="text-[11px] text-text-muted tabular-nums ml-auto pl-2">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tasks by priority — bar */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-[12px] font-medium text-text-secondary mb-4">By Priority</p>
              {priorityData.length === 0 ? (
                <div className="flex items-center justify-center h-[180px] text-[12px] text-text-muted">No tasks yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={priorityData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C2D3C" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7B7D8D' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#7B7D8D' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#1D1E2B', border: '1px solid #2C2D3C', borderRadius: 6, fontSize: 12 }}
                      cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {priorityData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tasks created per day — line */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-[12px] font-medium text-text-secondary mb-4">Task Creation — Last 14 Days</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.createdByDay} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2D3C" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#7B7D8D' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: string) => v.slice(5)} // MM-DD
                  interval={2}
                />
                <YAxis tick={{ fontSize: 10, fill: '#7B7D8D' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1D1E2B', border: '1px solid #2C2D3C', borderRadius: 6, fontSize: 12 }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 2' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#7B7D8D' }} />
                <Line
                  type="monotone" dataKey="count" name="Tasks created"
                  stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
}
