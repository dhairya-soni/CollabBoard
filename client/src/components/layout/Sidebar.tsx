import { useState, useCallback, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from '@/components/ui';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';

/* ── Navigation Items ── */
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Projects', icon: FolderKanban, to: '/projects' },
  { label: 'Members', icon: Users, to: '/members' },
  { label: 'Settings', icon: Settings, to: '/settings' },
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
  const location = useLocation();

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-border shrink-0',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-semibold text-xs">CB</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-text-primary truncate">
            CollabBoard
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className={cn(
          'text-xs font-medium text-text-secondary uppercase tracking-wider mb-2',
          collapsed ? 'text-center' : 'px-3',
        )}>
          {collapsed ? '·' : 'Navigation'}
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 h-9 rounded-md px-3 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0 w-9 mx-auto',
                isActive
                  ? 'bg-surface-hover text-text-primary border-l-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-2 py-3 space-y-1 shrink-0">
        <ThemeToggle collapsed={collapsed} />

        {/* User info */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2',
            collapsed && 'justify-center px-0',
          )}
        >
          <Avatar name="John Doe" size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                John Doe
              </p>
              <p className="text-xs text-text-tertiary truncate">
                john@example.com
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center gap-2 h-9 rounded-md w-full text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer justify-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
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
          'hidden md:flex flex-col fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-200 z-30',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'md:hidden fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border z-50 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Close button */}
        <button
          onClick={onMobileClose}
          className="absolute top-3 right-3 p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
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
