/**
 * PublicLayout — D02 (Shared layout wrapper for all public pages)
 *
 * Wraps: HomePage, EventDetailsPage, MyBookingsPage
 *
 * Provides:
 *  - PublicHeader at the top (logo + nav + logout)
 *  - Outlet renders each page's specific content below
 *  - Beautiful, consistent Footer component at the bottom
 */
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader.jsx';
import Footer from './Footer.jsx';

export default function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--stage)' }}>
      <PublicHeader />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
