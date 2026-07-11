/**
 * PublicLayout — D02 (Shared layout wrapper for all public pages)
 *
 * Wraps: HomePage, EventDetailsPage, MyBookingsPage
 *
 * Provides:
 *  - PublicHeader at the top (logo + nav + logout)
 *  - Outlet renders each page's specific content below
 *
 * NOTE: Individual pages that previously had their own full-page
 * `min-h-screen` wrappers should keep them — they sit INSIDE the Outlet
 * so they don't double-wrap the header.
 */
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader.jsx';

export default function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--stage)' }}>
      <PublicHeader />
      <Outlet />
    </div>
  );
}
