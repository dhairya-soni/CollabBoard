import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import DashboardPage from '@/pages/Dashboard';
import ProjectsPage from '@/pages/Projects';
import SettingsPage from '@/pages/Settings';
import WhiteboardPage from '@/pages/WhiteboardPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import { useAuthStore } from '@/stores/auth';

/* ── 404 ── */
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

/* ── Redirect authenticated users away from auth pages ── */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/* ── Placeholder pages (replaced later) ── */
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-[15px] font-semibold text-text-primary mb-1">{title}</h1>
      <p className="text-[13px] text-text-tertiary max-w-sm">{description}</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<DashboardPage />} />
          <Route path="/projects/:projectId/whiteboard" element={<WhiteboardPage />} />
          <Route path="/inbox" element={<PlaceholderPage title="Inbox" description="Your notifications and updates will appear here." />} />
          <Route path="/views" element={<PlaceholderPage title="Views" description="Create filtered views to save and share with others." />} />
          <Route path="/roadmaps" element={<PlaceholderPage title="Roadmaps" description="Plan and track your product roadmap." />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
