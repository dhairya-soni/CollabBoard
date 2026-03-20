import { useState, useCallback, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  CircleUser,
  Eye,
  Map,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Hash,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  X,
  LogOut,
  FolderKanban,
  BarChart2,
} from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import { useWorkspaceStore } from '@/stores/workspace';
import { useAuthStore } from '@/stores/auth';

/* ── Navigation Items (Linear-style) ── */
const mainNavItems = [
  { label: 'Inbox',     icon: Inbox,       to: '/inbox',      count: undefined },
  { label: 'My Issues', icon: CircleUser,  to: '/',           count: undefined },
  { label: 'Projects',  icon: FolderKanban,to: '/projects',   count: undefined },
  { label: 'Analytics', icon: BarChart2,   to: '/analytics',  count: undefined },
  { label: 'Views',     icon: Eye,         to: '/views',      count: undefined },
  { label: 'Roadmaps',  icon: Map,         to: '/roadmaps',   count: undefined },
];

/* ── Sidebar State Persistence ── */
const STORAGE_KEY = 'collabboard-sidebar-collapsed';

function getPersistedCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/* ── Sidebar Component ── */
export interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(getPersistedCollapsed);
  const [teamExpanded, setTeamExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  // Fetch workspaces & auto-select first one
  const { data: workspaces } = useWorkspaces();
  const firstWs = workspaces?.[0];
  useEffect(() => {
    if (firstWs && !currentWorkspaceId) {
      setCurrentWorkspace(firstWs.id);
    }
  }, [firstWs, currentWorkspaceId, setCurrentWorkspace]);

  const activeWorkspace = workspaces?.find((w) => w.id === currentWorkspaceId) ?? workspaces?.[0];

  // Fetch projects for the active workspace
  const { data: projects } = useProjects(activeWorkspace?.id ?? null);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Workspace Header ── */}
      <div
        className={cn(
          'flex items-center h-[40px] px-3 border-b border-border shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <div className={cn('flex items-center', collapsed ? '' : 'gap-2.5')}>
          <div className="h-6 w-6 rounded-[5px] bg-gradient-to-b from-[#5C6BF1] to-[#283188] flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            <span className="text-white font-bold text-[10px] leading-none">CB</span>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[13px] font-semibold text-text-primary truncate"
            >
              {activeWorkspace?.name ?? 'CollabBoard'}
            </motion.span>
          )}
        </div>
        {!collapsed && (
          <button className="h-6 w-6 rounded flex items-center justify-center text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer">
            <Search className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── New Issue Button ── */}
      <div className={cn('px-2 pt-2.5 pb-1', collapsed && 'px-1.5')}>
        <button
          className={cn(
            'group flex items-center gap-2 w-full h-[28px] rounded bg-surface hover:bg-surface-hover border border-border-strong/50 text-text-secondary hover:text-text-primary transition-all duration-150 cursor-pointer',
            collapsed ? 'justify-center px-0' : 'px-2.5',
          )}
        >
          <Plus className="h-3.5 w-3.5 shrink-0 text-text-muted group-hover:text-text-tertiary transition-colors" />
          {!collapsed && <span className="text-[13px] font-medium">New Issue</span>}
        </button>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="flex-1 px-1.5 pt-1 pb-2 space-y-px overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 h-[28px] rounded px-2 text-[13px] font-medium transition-all duration-150',
                collapsed && 'justify-center px-0 w-8 mx-auto',
                isActive
                  ? 'bg-surface-hover text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-hover/50',
              )
            }
          >
            <item.icon className="h-[15px] w-[15px] shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate flex-1">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[11px] text-text-muted tabular-nums min-w-[16px] text-right">
                    {item.count}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Your Teams Section ── */}
        {!collapsed && (
          <div className="pt-5">
            <button
              onClick={() => setTeamExpanded(!teamExpanded)}
              className="group flex items-center gap-1 w-full px-2 py-0.5 text-[11px] font-medium text-text-muted uppercase tracking-[0.05em] hover:text-text-tertiary transition-colors cursor-pointer"
            >
              <motion.span
                animate={{ rotate: teamExpanded ? 0 : -90 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                <ChevronDown className="h-3 w-3" />
              </motion.span>
              Your Teams
            </button>

            <AnimatePresence initial={false}>
              {teamExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  {/* Team row */}
                  <div className="flex items-center gap-2 px-2 py-1.5 mt-1 rounded hover:bg-surface-hover/50 transition-colors cursor-pointer group">
                    <div className="h-[18px] w-[18px] rounded-[3px] bg-primary/15 flex items-center justify-center border border-primary/20">
                      <span className="text-[8px] font-bold text-primary leading-none">
                        {(activeWorkspace?.name ?? 'CB').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[13px] font-medium text-text-secondary flex-1">
                      {activeWorkspace?.name ?? 'Workspace'}
                    </span>
                    <ChevronRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Project links — dynamic from API */}
                  <div className="ml-2 space-y-px mt-0.5">
                    {(projects ?? []).map((proj) => (
                      <NavLink
                        key={proj.id}
                        to={`/projects/${proj.id}`}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 h-[28px] rounded px-2 text-[13px] transition-all duration-150',
                            isActive
                              ? 'text-text-primary bg-surface-hover'
                              : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-hover/50',
                          )
                        }
                      >
                        <Hash className="h-3.5 w-3.5" />
                        <span className="truncate flex-1">{proj.name}</span>
                        <span className="text-[11px] text-text-muted tabular-nums">
                          {proj._count.tasks}
                        </span>
                      </NavLink>
                    ))}
                    {projects && projects.length === 0 && (
                      <p className="px-2 py-1 text-[12px] text-text-muted">No projects yet</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="border-t border-border px-1.5 py-1.5 space-y-px shrink-0">
        <ThemeToggle collapsed={collapsed} />

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 h-[28px] rounded px-2 text-[13px] font-medium transition-all duration-150',
              collapsed && 'justify-center px-0 w-8 mx-auto',
              isActive
                ? 'bg-surface-hover text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-hover/50',
            )
          }
        >
          <Settings className="h-[15px] w-[15px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2.5 h-[28px] rounded w-full text-text-muted hover:text-red-400 hover:bg-surface-hover/50 transition-all duration-150 cursor-pointer',
            collapsed ? 'justify-center px-0' : 'px-2',
          )}
        >
          <LogOut className="h-[15px] w-[15px] shrink-0" />
          {!collapsed && <span className="text-[13px]">Logout</span>}
        </button>

        {/* User info */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-1.5 mt-0.5">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">
                {user.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] text-text-muted truncate">{user.email}</span>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className={cn(
            'hidden md:flex items-center gap-2.5 h-[28px] rounded w-full text-text-muted hover:text-text-tertiary hover:bg-surface-hover/50 transition-all duration-150 cursor-pointer',
            collapsed ? 'justify-center px-0' : 'px-2',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-[15px] w-[15px]" />
          ) : (
            <>
              <ChevronsLeft className="h-[15px] w-[15px]" />
              <span className="text-[13px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-0 h-screen bg-background border-r border-border z-30',
          'transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'w-[52px]' : 'w-[240px]',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'md:hidden fixed left-0 top-0 h-screen w-[240px] bg-background border-r border-border z-50',
          'transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={onMobileClose}
          className="absolute top-2 right-2 p-1 rounded text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer z-10"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}

export { Sidebar };
export { getPersistedCollapsed };
