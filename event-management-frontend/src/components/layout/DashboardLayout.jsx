import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

/**
 * D07: DashboardLayout
 * - Lifts mobileOpen state here (was local to Topbar, but Topbar didn't exist)
 * - Closes drawer automatically on every route change via useEffect on location.pathname
 * - Hamburger button lives in this layout's topbar strip at [BP: base/sm/md]
 */
export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // D07 FIX: Close drawer on every route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-shell">
      {/* ── Mobile topbar strip (hamburger) — visible below lg ── */}
      <div className="dash-mobile-topbar">
        <button
          className="dash-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <span className="dash-mobile-brand">EVENTzaa</span>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="dash-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar: always visible on lg+; drawer on mobile ── */}
      <div className={`dash-sidebar-wrap${mobileOpen ? ' dash-sidebar-wrap--open' : ''}`}>
        {/* Close button inside drawer */}
        <button
          className="dash-drawer-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <Sidebar onNavClick={() => setMobileOpen(false)} />
      </div>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
