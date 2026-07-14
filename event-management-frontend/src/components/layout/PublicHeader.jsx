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
 *  - Mobile responsive hamburger menu drawer for screens under 768px
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Ticket, Menu, X } from 'lucide-react';
import AppLogo from '../common/AppLogo.jsx';
import useAuth from '../../hooks/useAuth.js';

export default function PublicHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isStaff = ['ADMIN', 'ORGANIZER'].includes(user?.role);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu automatically on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/register', { replace: true });
  };

  return (
    <header className="pub-header">
      {/* Brand */}
      <Link to="/" className="pub-header-brand">
        <AppLogo linked={false} />
      </Link>

      {/* Centre nav — hidden on mobile, visible on desktop */}
      <nav className="pub-header-nav">
        <Link to="/browse" className="pub-header-navlink">Browse Events</Link>
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

      {/* Right controls — Desktop version */}
      <div className="pub-header-actions pub-header-desktop-only">
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

            {/* Logout */}
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

      {/* Hamburger button — visible under 768px */}
      <button
        className="pub-header-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="pub-header-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div className={`pub-header-drawer${mobileOpen ? ' pub-header-drawer--open' : ''}`}>
        <div className="pub-header-drawer-header">
          <AppLogo />
          <button
            className="pub-header-drawer-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="pub-header-drawer-nav">
          <Link to="/browse" className="pub-header-drawer-link">
            Browse Events
          </Link>
          {isAuthenticated && !isStaff && (
            <Link to="/my-bookings" className="pub-header-drawer-link">
              <Ticket size={16} />
              <span>My Bookings</span>
            </Link>
          )}
          {isAuthenticated && isStaff && (
            <Link to="/dashboard" className="pub-header-drawer-link pub-header-drawer-link--staff">
              <LayoutDashboard size={16} />
              <span>Dashboard Console</span>
            </Link>
          )}
        </nav>

        <div className="pub-header-drawer-footer">
          {isAuthenticated ? (
            <div className="stack" style={{ gap: '16px' }}>
              <div className="pub-header-user-pill" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <span className="pub-header-avatar">
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                </span>
                <span className="pub-header-username">{user?.fullName}</span>
                {user?.role && (
                  <span className="pub-header-role-badge">{user.role}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="pub-header-logout-btn"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <div className="stack" style={{ gap: '12px' }}>
              <Link to="/login" className="pub-header-drawer-btn-login">
                Log in
              </Link>
              <Link to="/register" className="pub-header-drawer-btn-signup">
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
