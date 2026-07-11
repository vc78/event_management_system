import { Navigate, Routes, Route } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';

// ── Layouts ────────────────────────────────────────────────────────
import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// ── Route guards ───────────────────────────────────────────────────
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleProtectedRoute from './routes/RoleProtectedRoute.jsx';

// ── Public pages ───────────────────────────────────────────────────
import HomePage from './pages/public/HomePage.jsx';
import EventDetailsPage from './pages/public/EventDetailsPage.jsx';
import MyBookingsPage from './pages/public/MyBookingsPage.jsx';

// ── Auth pages ─────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// ── Dashboard pages ────────────────────────────────────────────────
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import EventsPage from './pages/dashboard/EventsPage.jsx';
import CategoriesPage from './pages/dashboard/CategoriesPage.jsx';
import VenuesPage from './pages/dashboard/VenuesPage.jsx';
import BookingsPage from './pages/dashboard/BookingsPage.jsx';
import EngagementRoom from './pages/dashboard/EngagementRoom.jsx';
import VenueMap from './pages/dashboard/VenueMap.jsx';
import SponsorMarket from './pages/dashboard/SponsorMarket.jsx';
import CheckInConsole from './pages/dashboard/CheckInConsole.jsx';

import LoadingSpinner from './components/common/LoadingSpinner.jsx';

/* ──────────────────────────────────────────────────────────────────
   RootLanding — decides the "/" experience based on auth + role.

   WHY localStorage fallback?
   When navigate('/') fires inside RegisterPage/LoginPage right after
   calling setToken()/setUser() in AuthContext, React 18 batches those
   state updates. There is a narrow render window where RootLanding sees
   isAuthenticated=false even though the user IS authenticated, causing
   an immediate redirect back to /register (loop).
   AuthContext writes to localStorage synchronously BEFORE the navigate()
   call, so localStorage is always the ground truth at this moment.
   ────────────────────────────────────────────────────────────────── */
function RootLanding() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // During an active login/register API call, show neutral loading screen.
  if (isLoading) return <LoadingSpinner fullScreen label="Loading…" />;

  // Read localStorage as a race-condition safety net.
  const storedToken = localStorage.getItem('ems_token');
  const storedUser = storedToken
    ? JSON.parse(localStorage.getItem('ems_user') || 'null')
    : null;

  // Effective auth = React state OR localStorage (whichever is ahead).
  const effectivelyAuthed = isAuthenticated || !!storedToken;
  const effectiveRole = (user ?? storedUser)?.role;

  if (!effectivelyAuthed) return <Navigate to="/register" replace />;
  return <Navigate to="/dashboard" replace />;
}

/* ──────────────────────────────────────────────────────────────────
   App — Route tree
   ────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/*
       * ── Public storefront ────────────────────────────────────────
       * PublicLayout renders PublicHeader above every page in this group,
       * giving all users (any role, any auth state) a visible logout button.
       */}
      <Route element={<PublicLayout />}>
        {/* D03: RootLanding decides the "/" experience per role */}
        <Route path="/" element={<RootLanding />} />
        <Route path="/browse" element={<HomePage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />

        {/*
         * D03 (b): /my-bookings now requires auth — unauthenticated visitors
         * are redirected to /login instead of seeing a broken page.
         */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
      </Route>

      {/* ── Auth pages (no shared layout — they have their own split-panel) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/*
      {/* ── Dashboard: any authenticated user may view the main hub. ──
       * Admin/Organizer only may access sub-pages under /dashboard/*.
       */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']} />}>
            <Route path="events" element={<EventsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="venues" element={<VenuesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="engagement" element={<EngagementRoom />} />
            <Route path="venue-map" element={<VenueMap />} />
            <Route path="marketplace" element={<SponsorMarket />} />
            <Route path="check-in" element={<CheckInConsole />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
