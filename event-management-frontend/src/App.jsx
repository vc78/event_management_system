import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/public/HomePage.jsx';
import EventDetailsPage from './pages/public/EventDetailsPage.jsx';
import MyBookingsPage from './pages/public/MyBookingsPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import EventsPage from './pages/dashboard/EventsPage.jsx';
import CategoriesPage from './pages/dashboard/CategoriesPage.jsx';
import VenuesPage from './pages/dashboard/VenuesPage.jsx';
import BookingsPage from './pages/dashboard/BookingsPage.jsx';

import EngagementRoom from './pages/dashboard/EngagementRoom.jsx';
import VenueMap from './pages/dashboard/VenueMap.jsx';
import SponsorMarket from './pages/dashboard/SponsorMarket.jsx';
import CheckInConsole from './pages/dashboard/CheckInConsole.jsx';

import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="venues" element={<VenuesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="engagement" element={<EngagementRoom />} />
        <Route path="venue-map" element={<VenueMap />} />
        <Route path="marketplace" element={<SponsorMarket />} />
        <Route path="check-in" element={<CheckInConsole />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
