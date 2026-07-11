/**
 * PublicHeader — D01 (Global logout visibility)
 *
 * Shared persistent header used on EVERY public-facing screen:
 * HomePage, EventDetailsPage, MyBookingsPage.
 *
 * Provides:
 *  - Consistent branding (AppLogo)
 *  - Nav links scoped by auth state / role
 *  - VISIBLE logout button for ALL logged-in users regardless of role
 *    (the only other logout lives inside Sidebar which requires /dashboard access)
 */
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import AppLogo from '../common/AppLogo.jsx';
import useAuth from '../../hooks/useAuth.js';

export default function PublicHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = ['ADMIN', 'ORGANIZER'].includes(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/register', { replace: true });
  };

  return (
    <header className="pub-header">
      {/* Brand — AppLogo renders its own Link internally, so pass linked=false to avoid nested <a> */}
      <Link to="/" className="pub-header-brand">
        <AppLogo linked={false} />
      </Link>

      {/* Centre nav — hidden on mobile */}
      <nav className="pub-header-nav">
        <Link to="/" className="pub-header-navlink">Browse Events</Link>
        {isAuthenticated && !isStaff && (
          <Link to="/my-bookings" className="pub-header-navlink">
            <Ticket size={14} />
            My Bookings
          </Link>
        )}
        {isAuthenticated && isStaff && (
          <Link to="/dashboard" className="pub-header-navlink pub-header-navlink--staff">
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        )}
      </nav>

      {/* Right controls */}
      <div className="pub-header-actions">
        {isAuthenticated ? (
          <>
            {/* User pill */}
            <div className="pub-header-user-pill">
              <span className="pub-header-avatar">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
              <span className="pub-header-username">{user?.fullName}</span>
              {user?.role && (
                <span className="pub-header-role-badge">{user.role}</span>
              )}
            </div>

            {/* Logout — visible on EVERY public screen for every role */}
            <button
              onClick={handleLogout}
              className="pub-header-logout-btn"
              aria-label="Log out"
              id="pub-header-logout"
            >
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="pub-header-login-link">Log in</Link>
            <Link to="/register" className="pub-header-signup-btn">
              <span className="pub-header-signup-shine" />
              Sign up free
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
