import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';

/**
 * Wrap any route that requires authentication.
 * Redirects to /login if token is missing.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
