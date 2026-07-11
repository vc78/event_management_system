/**
 * ProtectedRoute — "must be logged in" gate (any role).
 *
 * Use this for routes that require authentication but don't need a
 * specific role check (e.g. /my-bookings).
 *
 * For role-restricted routes (e.g. /dashboard/*), use RoleProtectedRoute
 * instead — it checks both authentication AND the user's role.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="center-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles.length && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  // Supports both children prop (legacy) and Outlet (nested <Route element> pattern)
  return <Outlet />;
}
