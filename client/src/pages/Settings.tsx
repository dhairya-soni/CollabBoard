import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import { useWorkspaces, useWorkspace, useAddMember, useRemoveMember } from '@/hooks/useWorkspaces';
import { useWorkspaceStore } from '@/stores/workspace';
import { User, Building2, Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data: workspace } = useWorkspace(currentWorkspaceId);
  const { data: workspaces } = useWorkspaces();

  const addMember = useAddMember(currentWorkspaceId);
  const removeMember = useRemoveMember(currentWorkspaceId);

  const [inviteEmail, setInviteEmail] = useState('');

  const isAdmin = workspace?.members?.some(
    (m) => m.userId === user?.id && m.role === 'ADMIN',
  );

  async function handleInvite(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await addMember.mutateAsync({ email: inviteEmail.trim() });
      toast.success(`${inviteEmail} added to workspace`);
      setInviteEmail('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to add member';
      toast.error(msg);
    }
  }

  async function handleRemove(userId: string, name: string) {
    try {
      await removeMember.mutateAsync(userId);
      toast.success(`${name} removed from workspace`);
    } catch {
      toast.error('Failed to remove member');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="px-6 py-5 max-w-2xl"
    >
      <h1 className="text-[15px] font-semibold text-text-primary mb-6">Settings</h1>

      {/* Profile Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-text-tertiary" />
          <h2 className="text-[13px] font-medium text-text-secondary">Profile</h2>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {user?.name.substring(0, 2).toUpperCase() ?? '??'}
              </span>
            </div>
            <div>
              <p className="text-[14px] font-medium text-text-primary">{user?.name ?? 'Unknown'}</p>
              <p className="text-[12px] text-text-muted">{user?.email ?? ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] text-text-muted mb-1">Name</label>
              <input
                readOnly
                value={user?.name ?? ''}
                className="w-full h-8 bg-input border border-border-strong rounded px-2.5 text-[13px] text-text-primary cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1">Email</label>
              <input
                readOnly
                value={user?.email ?? ''}
                className="w-full h-8 bg-input border border-border-strong rounded px-2.5 text-[13px] text-text-primary cursor-not-allowed opacity-70"
              />
            </div>
          </div>
          <p className="text-[11px] text-text-muted pt-1">
            Account created {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
      </section>

      {/* Workspace Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-text-tertiary" />
          <h2 className="text-[13px] font-medium text-text-secondary">Workspace</h2>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
          {workspace ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">
                    {workspace.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-text-primary">{workspace.name}</p>
                  <p className="text-[12px] text-text-muted">/{workspace.slug}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-surface-hover/50 rounded p-2.5 text-center">
                  <p className="text-[16px] font-semibold text-text-primary tabular-nums">
                    {workspace._count.projects}
                  </p>
                  <p className="text-[11px] text-text-muted">Projects</p>
                </div>
                <div className="bg-surface-hover/50 rounded p-2.5 text-center">
                  <p className="text-[16px] font-semibold text-text-primary tabular-nums">
                    {workspace._count.members}
                  </p>
                  <p className="text-[11px] text-text-muted">Members</p>
                </div>
                <div className="bg-surface-hover/50 rounded p-2.5 text-center">
                  <p className="text-[16px] font-semibold text-text-primary tabular-nums">
                    {workspaces?.length ?? 0}
                  </p>
                  <p className="text-[11px] text-text-muted">Workspaces</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-text-muted">No workspace selected</p>
          )}
        </div>
      </section>

      {/* Members Section */}
      {workspace && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-text-tertiary" />
            <h2 className="text-[13px] font-medium text-text-secondary">
              Members ({workspace.members?.length ?? 0})
            </h2>
          </div>

          {/* Invite form — admins only */}
          {isAdmin && (
            <form onSubmit={handleInvite} className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <UserPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Invite by email address…"
                  className="w-full h-9 bg-input border border-border-strong rounded pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={addMember.isPending || !inviteEmail.trim()}
                className="flex items-center gap-1.5 h-9 px-3 bg-primary hover:bg-primary-hover text-white rounded text-[13px] font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {addMember.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                Invite
              </button>
            </form>
          )}

          {/* Member list */}
          <div className="bg-surface border border-border rounded-lg divide-y divide-border">
            {workspace.members?.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-primary">
                    {m.user.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary truncate">{m.user.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{m.user.email}</p>
                </div>
                <span className="text-[10px] font-medium text-text-muted bg-surface-hover rounded px-1.5 py-0.5 shrink-0">
                  {m.role}
                </span>
                {/* Remove button — admin only, can't remove owner */}
                {isAdmin && m.userId !== workspace.ownerId && m.userId !== user?.id && (
                  <button
                    onClick={() => handleRemove(m.userId, m.user.name)}
                    disabled={removeMember.isPending}
                    className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isAdmin && (
            <p className="text-[11px] text-text-muted mt-2">
              Only workspace admins can invite or remove members.
            </p>
          )}
        </section>
      )}
    </motion.div>
  );
}
