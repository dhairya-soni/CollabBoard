import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import DashboardPage from '@/pages/Dashboard';
import DesignSystemPage from '@/pages/DesignSystem';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-6xl font-semibold text-text-primary mb-2">404</h1>
      <p className="text-sm text-text-secondary mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/"
        className="text-sm text-primary hover:text-primary-hover transition-colors underline"
      >
        Go to Dashboard
      </a>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/projects" element={<PlaceholderPage title="Projects" />} />
        <Route path="/members" element={<PlaceholderPage title="Members" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

/* Temporary placeholder for future Phase 2 pages */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
      <p className="text-sm text-text-secondary">
        This page will be built in Phase 2.
      </p>
    </div>
  );
}

export default App;
