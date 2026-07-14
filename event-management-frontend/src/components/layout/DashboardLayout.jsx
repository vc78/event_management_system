import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';

/**
 * D07: DashboardLayout
 * - Lifts mobileOpen state here
 * - Closes drawer automatically on every route change
 * - Renders consistent Footer at the bottom of the dashboard main content
 */
export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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

      {/* Main Content Area */}
      <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1, paddingBottom: '40px' }}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
