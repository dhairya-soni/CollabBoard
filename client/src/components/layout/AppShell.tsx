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
          'transition-all duration-200',
          'md:ml-60',
          sidebarCollapsed && 'md:ml-14',
        )}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="px-4 py-3 md:px-6 md:py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { AppShell };
