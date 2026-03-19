import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { useWorkspaceStore } from '@/stores/workspace';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';
import type { Project } from '@/types/api';
import {
  FolderKanban,
  Plus,
  Loader2,
  X,
  Settings,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/25',
  PAUSED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  COMPLETED: 'bg-primary/15 text-primary border-primary/25',
  ARCHIVED: 'bg-text-muted/15 text-text-muted border-text-muted/25',
};

export default function ProjectsPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data: projects, isLoading } = useProjects(workspaceId);
  const createProject = useCreateProject();
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managingProject, setManagingProject] = useState<Project | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!workspaceId) return;
    try {
      await createProject.mutateAsync({ name, description: description || undefined, workspaceId });
      toast.success(`Project "${name}" created`);
      setName('');
      setDescription('');
      setShowDialog(false);
    } catch {
      toast.error('Failed to create project');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="px-6 py-5 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">Projects</h1>
          <p className="text-[12px] text-text-tertiary mt-0.5">
            {projects?.length ?? 0} project{projects?.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-1.5 h-8 px-3 bg-primary hover:bg-primary-hover text-white rounded text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </button>
      </div>

      {/* Project grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: i * 0.05 }}
              className="relative group/card"
            >
              <Link
                to={`/projects/${project.id}`}
                className="block p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FolderKanban className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[14px] font-medium text-text-primary group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      {project.isPrivate && (
                        <span title="Private project"><Lock className="h-3 w-3 text-amber-400 shrink-0" /></span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-[12px] text-text-tertiary mt-0.5 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={cn(
                          'inline-flex items-center h-[18px] rounded-full px-2 text-[10px] font-medium border',
                          statusColors[project.status] ?? statusColors.ACTIVE,
                        )}
                      >
                        {project.status}
                      </span>
                      <span className="text-[11px] text-text-muted tabular-nums">
                        {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
                      </span>
                      {project.isPrivate && project.projectMembers && (
                        <span className="text-[11px] text-text-muted tabular-nums">
                          {project.projectMembers.length} member{project.projectMembers.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Settings gear — stops link navigation */}
              <button
                onClick={(e) => { e.preventDefault(); setManagingProject(project); }}
                className="absolute top-2 right-2 h-6 w-6 rounded flex items-center justify-center text-text-muted opacity-0 group-hover/card:opacity-100 hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer"
                title="Manage access"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderKanban className="h-8 w-8 text-text-muted mb-3" />
          <p className="text-[13px] text-text-tertiary mb-1">No projects yet</p>
          <p className="text-[12px] text-text-muted mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-1.5 h-8 px-3 bg-primary hover:bg-primary-hover text-white rounded text-[13px] font-medium transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </button>
        </div>
      )}

      {/* Create project dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-surface border border-border-strong rounded-lg shadow-xl mx-4"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-[14px] font-semibold text-text-primary">New Project</h2>
                <button
                  onClick={() => setShowDialog(false)}
                  className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-4 space-y-3">
                <div>
                  <label htmlFor="proj-name" className="block text-[12px] font-medium text-text-secondary mb-1">
                    Name
                  </label>
                  <input
                    id="proj-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mobile App"
                    required
                    autoFocus
                    className="w-full h-9 bg-input border border-border-strong rounded px-3 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="proj-desc" className="block text-[12px] font-medium text-text-secondary mb-1">
                    Description <span className="text-text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="proj-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this project about?"
                    rows={3}
                    className="w-full bg-input border border-border-strong rounded px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="h-8 px-3 rounded text-[13px] text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProject.isPending}
                    className="flex items-center gap-1.5 h-8 px-3 bg-primary hover:bg-primary-hover text-white rounded text-[13px] font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {createProject.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project members panel */}
      {managingProject && (
        <ProjectMembersPanel
          project={managingProject}
          onClose={() => setManagingProject(null)}
        />
      )}
    </motion.div>
  );
}
