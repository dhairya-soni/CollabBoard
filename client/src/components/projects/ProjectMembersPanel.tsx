import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Trash2, Loader2, Lock, Globe, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  useUpdateProject,
  useAddProjectMember,
  useRemoveProjectMember,
  useChangeProjectMemberRole,
} from '@/hooks/useProjects';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { useAuthStore } from '@/stores/auth';
import type { Project, ProjectMember } from '@/types/api';

interface ProjectMembersPanelProps {
  project: Project;
  onClose: () => void;
}

const ROLES = ['ADMIN', 'MEMBER', 'VIEWER'] as const;
type Role = (typeof ROLES)[number];

const roleColors: Record<Role, string> = {
  ADMIN: 'text-amber-400 bg-amber-500/10',
  MEMBER: 'text-primary bg-primary/10',
  VIEWER: 'text-text-muted bg-surface-hover',
};

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: Role;
  onChange: (r: Role) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Role)}
        disabled={disabled}
        className="h-6 appearance-none bg-surface-hover border border-border rounded pl-2 pr-6 text-[11px] font-medium text-text-secondary outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-border-strong transition-colors"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted pointer-events-none" />
    </div>
  );
}

export function ProjectMembersPanel({ project, onClose }: ProjectMembersPanelProps) {
  const user = useAuthStore((s) => s.user);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('MEMBER');

  const updateProject = useUpdateProject(project.id);
  const addMember = useAddProjectMember(project.id);
  const removeMember = useRemoveProjectMember(project.id);
  const changeRole = useChangeProjectMemberRole(project.id);

  // Fetch all workspace members so we can show who isn't yet a project member
  const { data: workspace } = useWorkspace(project.workspaceId);

  const projectMemberUserIds = new Set((project.projectMembers ?? []).map((m) => m.userId));

  // Workspace members NOT yet in the project
  const nonProjectMembers = (workspace?.members ?? []).filter(
    (m) => !projectMemberUserIds.has(m.userId),
  );

  const isProjectAdmin = project.projectMembers?.some(
    (m) => m.userId === user?.id && m.role === 'ADMIN',
  );
  const isWorkspaceAdmin = workspace?.members?.some(
    (m) => m.userId === user?.id && m.role === 'ADMIN',
  );
  const canManage = isProjectAdmin || isWorkspaceAdmin;

  async function handleTogglePrivacy() {
    try {
      await updateProject.mutateAsync({ isPrivate: !project.isPrivate });
      toast.success(
        project.isPrivate
          ? 'Project is now visible to all workspace members'
          : 'Project is now private',
      );
    } catch {
      toast.error('Failed to update project visibility');
    }
  }

  async function handleInvite(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await addMember.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
      toast.success(`${inviteEmail} added to project`);
      setInviteEmail('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to add member';
      toast.error(msg);
    }
  }

  async function handleQuickAdd(_wsUserId: string, email: string) {
    try {
      await addMember.mutateAsync({ email, role: 'MEMBER' });
      toast.success(`${email} added to project`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to add member';
      toast.error(msg);
    }
  }

  async function handleRoleChange(member: ProjectMember, role: Role) {
    try {
      await changeRole.mutateAsync({ userId: member.userId, role });
      toast.success(`${member.user.name}'s role updated to ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  }

  async function handleRemove(userId: string, name: string) {
    try {
      await removeMember.mutateAsync(userId);
      toast.success(`${name} removed from project`);
    } catch {
      toast.error('Failed to remove member');
    }
  }

  const projectMembers = project.projectMembers ?? [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[500px] bg-surface border border-border-strong rounded-lg shadow-xl mx-4 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div>
              <h2 className="text-[14px] font-semibold text-text-primary">{project.name}</h2>
              <p className="text-[11px] text-text-muted">Access & Members</p>
            </div>
            <button
              onClick={onClose}
              className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* ── Visibility ── */}
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-2">
                Visibility
              </p>
              <button
                onClick={handleTogglePrivacy}
                disabled={updateProject.isPending || !canManage}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong hover:bg-surface-hover/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div
                  className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                    project.isPrivate ? 'bg-amber-500/15' : 'bg-green-500/15'
                  }`}
                >
                  {project.isPrivate ? (
                    <Lock className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary">
                    {project.isPrivate ? 'Private project' : 'Workspace-visible'}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {project.isPrivate
                      ? 'Only invited members can see and access this project'
                      : 'All workspace members can see this project'}
                  </p>
                </div>
                {canManage && (
                  <span className="text-[11px] text-primary shrink-0">
                    {project.isPrivate ? 'Make public' : 'Make private'}
                  </span>
                )}
              </button>
            </div>

            {/* ── Project Members ── */}
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-2">
                Project Members
                {projectMembers.length > 0 && (
                  <span className="ml-1 normal-case">({projectMembers.length})</span>
                )}
              </p>

              {!project.isPrivate && (
                <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
                  All workspace members can access this project. Members listed below have
                  project-specific roles assigned.
                </p>
              )}

              {/* Invite form */}
              {canManage && (
                <form onSubmit={handleInvite} className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <UserPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Add by email…"
                      className="w-full h-8 bg-input border border-border-strong rounded pl-8 pr-2 text-[12px] text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="h-8 bg-input border border-border-strong rounded px-2 text-[12px] text-text-secondary outline-none cursor-pointer"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addMember.isPending || !inviteEmail.trim()}
                    className="h-8 px-2.5 bg-primary hover:bg-primary-hover text-white rounded text-[12px] font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    {addMember.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
                  </button>
                </form>
              )}

              {/* Explicit project members */}
              {projectMembers.length > 0 ? (
                <div className="bg-surface border border-border rounded-lg divide-y divide-border mb-3">
                  {projectMembers.map((m) => (
                    <div key={m.id} className="flex items-center gap-2.5 px-3 py-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-primary">
                          {m.user.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-text-primary truncate">
                          {m.user.name}
                          {m.userId === user?.id && (
                            <span className="ml-1 text-[10px] text-text-muted">(you)</span>
                          )}
                        </p>
                        <p className="text-[10px] text-text-muted truncate">{m.user.email}</p>
                      </div>

                      {/* Role selector or badge */}
                      {canManage && m.userId !== user?.id ? (
                        <RoleSelect
                          value={m.role as Role}
                          onChange={(role) => handleRoleChange(m, role)}
                          disabled={changeRole.isPending}
                        />
                      ) : (
                        <span
                          className={`text-[10px] font-medium rounded px-1.5 py-0.5 shrink-0 ${roleColors[m.role as Role] ?? roleColors.MEMBER}`}
                        >
                          {m.role}
                        </span>
                      )}

                      {canManage && m.userId !== user?.id && (
                        <button
                          onClick={() => handleRemove(m.userId, m.user.name)}
                          disabled={removeMember.isPending}
                          className="h-5 w-5 rounded flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                          title="Remove from project"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-text-muted italic mb-3">
                  No project-specific members yet.
                </p>
              )}

              {/* ── Workspace members not in project ── */}
              {canManage && nonProjectMembers.length > 0 && (
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-2">
                    Workspace Members
                  </p>
                  <div className="bg-surface border border-border rounded-lg divide-y divide-border">
                    {nonProjectMembers.map((wm) => (
                      <div key={wm.userId} className="flex items-center gap-2.5 px-3 py-2">
                        <div className="h-6 w-6 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                          <span className="text-[8px] font-bold text-text-muted">
                            {wm.user.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-text-secondary truncate">
                            {wm.user.name}
                          </p>
                          <p className="text-[10px] text-text-muted truncate">{wm.user.email}</p>
                        </div>
                        <span className="text-[10px] text-text-muted bg-surface-hover rounded px-1.5 py-0.5 shrink-0">
                          {wm.role}
                        </span>
                        <button
                          onClick={() => handleQuickAdd(wm.userId, wm.user.email)}
                          disabled={addMember.isPending}
                          className="h-6 px-2 rounded text-[11px] font-medium text-primary hover:bg-primary/10 border border-primary/30 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                          title="Add to project"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
