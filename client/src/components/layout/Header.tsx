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
        'sticky top-0 z-20 h-14 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6',
      )}
    >
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-text-secondary">/</span>}
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

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>
      </div>
    </header>
  );
}

export { Header };
