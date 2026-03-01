import { Menu, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ── Breadcrumb helper ── */
function getBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return ['Dashboard'];
  return segments.map(
    (seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
  );
}

export interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

function Header({ sidebarCollapsed: _sidebarCollapsed, onMobileMenuToggle }: HeaderProps) {
  // sidebarCollapsed will be used in Phase 2 for layout adjustments
  void _sidebarCollapsed;
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6',
      )}
    >
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-text-tertiary">/</span>}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? 'text-text-primary font-medium'
                    : 'text-text-secondary'
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Search bar trigger + Actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger — looks like an input */}
        <button
          className="hidden md:flex items-center gap-2 w-56 h-8 bg-surface border border-border rounded-md px-3 text-sm text-text-tertiary hover:border-border/80 transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] font-mono text-text-tertiary bg-surface-hover rounded px-1.5 py-0.5">
            /
          </kbd>
        </button>
        {/* Mobile search icon */}
        <button
          className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}

export { Header };
