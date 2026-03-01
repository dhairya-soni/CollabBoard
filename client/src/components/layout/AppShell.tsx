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
          'md:ml-64',
          sidebarCollapsed && 'md:ml-16',
        )}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { AppShell };
