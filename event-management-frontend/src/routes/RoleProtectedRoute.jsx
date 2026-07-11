/**
 * RoleProtectedRoute — D05 (RBAC frontend-routing)
 *
 * Wraps dashboard routes so ONLY users with an explicitly allowed role
 * can access them. Falls back to:
 *   - /login  if the visitor is not authenticated at all
 *   - /       if the visitor IS authenticated but has the wrong role
 *             (e.g. a plain USER trying to navigate to /dashboard)
 *
 * Usage in App.jsx:
 *   <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']} />}>
 *     <Route path="/dashboard" .../>
 *   </Route>
 *
 * Do NOT replace ProtectedRoute — routes that only need "logged in"
 * (e.g. /my-bookings) still use ProtectedRoute directly.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While the auth context is still hydrating (e.g. reading token from storage),
  // show a neutral loading screen — never flash content then redirect.
  if (isLoading) {
    return <LoadingSpinner fullScreen label="Checking your session…" />;
  }

  // Not logged in at all → send to login, preserve the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to public home (silent, not an error)
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Correct role — render the child routes
  return <Outlet />;
}
