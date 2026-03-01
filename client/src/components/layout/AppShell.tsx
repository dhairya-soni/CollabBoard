import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar, getPersistedCollapsed } from './Sidebar';
import { Header } from './Header';

/**
 * AppShell — Main layout wrapper.
 * Renders Sidebar + Header + content area (<Outlet />).
 */
function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarCollapsed = getPersistedCollapsed();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-[margin] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          sidebarCollapsed ? 'md:ml-[52px]' : 'md:ml-[240px]',
        )}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { AppShell };
