import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import DashboardPage from '@/pages/Dashboard';
import DesignSystemPage from '@/pages/DesignSystem';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-6xl font-semibold text-text-primary mb-2">404</h1>
      <p className="text-[13px] text-text-tertiary mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/"
        className="text-[13px] text-primary hover:text-primary-hover transition-colors underline"
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
        <Route path="/inbox" element={<PlaceholderPage title="Inbox" description="Your notifications and updates will appear here." />} />
        <Route path="/views" element={<PlaceholderPage title="Views" description="Create filtered views to save and share with others." />} />
        <Route path="/roadmaps" element={<PlaceholderPage title="Roadmaps" description="Plan and track your product roadmap." />} />
        <Route path="/active" element={<DashboardPage />} />
        <Route path="/backlog" element={<DashboardPage />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" description="Manage your workspace settings." />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

/* Placeholder pages — will be replaced in Phase 2 */
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-[15px] font-semibold text-text-primary mb-1">{title}</h1>
      <p className="text-[13px] text-text-tertiary max-w-sm">
        {description}
      </p>
    </div>
  );
}

export default App;
