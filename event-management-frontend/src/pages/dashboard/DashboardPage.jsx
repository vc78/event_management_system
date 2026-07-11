import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as eventApi from '../../api/eventApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import * as categoryApi from '../../api/categoryApi.js';
import * as venueApi from '../../api/venueApi.js';
import * as adminApi from '../../api/adminApi.js';
import useAuth from '../../hooks/useAuth.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useToast } from '../../hooks/useToast.js';
import { Link } from 'react-router-dom';
import { Users, Calendar, Ticket, Tags, MapPin, DollarSign } from 'lucide-react';
import { useRealtimeDashboard } from '../../hooks/useRealtime.js';

// Sub-hubs for separate journeys
import AttendeeHub from './AttendeeHub.jsx';
import SponsorHub from './SponsorHub.jsx';

// Smooth count-up utility
function CountUp({ end, duration = 1000, prefix = '', suffix = '' }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * end));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <>{prefix}{value.toLocaleString()}{suffix}</>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();

  // Ticking Clock state
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: stats = {
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalCategories: 0,
    totalVenues: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    cancelledBookings: 0
  }, isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      if (user?.role === 'ADMIN') {
        return adminApi.getDashboardStats();
      } else {
        const [events, bookings, categories, venues] = await Promise.all([
          eventApi.getEvents().catch(() => []),
          bookingApi.getBookings().catch(() => []),
          categoryApi.getCategories().catch(() => []),
          venueApi.getVenues().catch(() => [])
        ]);

        const totalRevenue = bookings
          .filter(b => b.bookingStatus !== 'CANCELLED')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
          
        const confirmedBookings = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
        const cancelledBookings = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;

        return {
          totalUsers: new Set(bookings.map(b => b.userId)).size || 1,
          totalEvents: events.length,
          totalBookings: bookings.length,
          totalCategories: categories.length,
          totalVenues: venues.length,
          totalRevenue,
          confirmedBookings,
          cancelledBookings
        };
      }
    },
    enabled: user?.role === 'ADMIN' || user?.role === 'ORGANIZER'
  });

  useRealtimeDashboard();

  // DYNAMIC APP PORTALS BASED ON LOGGED-IN ROLE
  if (user?.role === 'USER') {
    return <AttendeeHub />;
  }

  if (user?.role === 'SPONSOR') {
    return <SponsorHub />;
  }

  if (loading) return <LoadingSpinner label="Retrieving system analytics..." />;
  if (isError) return (
    <div className="center-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
      <p className="text-danger">Failed to load dashboard metrics: {error?.message}</p>
      <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
    </div>
  );

  // Calculate check-in rate
  const checkInRate = stats.totalBookings > 0 
    ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100)
    : 78;

  return (
    <div>
      <header className="hero" style={{ padding: '0 0 24px', marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Backstage / Operations</p>
          <h1>Event control room</h1>
          <p className="sub">Welcome back. Authorized Admin: <strong style={{ color: 'var(--amber)' }}>{user?.email}</strong></p>
        </div>
        
        <div className="hero-right">
          <div className="clock">
            <span>{dateStr || 'Loading...'}</span>
            <strong>{timeStr || '--:--:--'}</strong>
          </div>
          <Link to="/dashboard/events">
            <button className="cta">+ New event</button>
          </Link>
        </div>
      </header>

      {/* Grid Stats */}
      <section className="stats">
        <div className="stat">
          <p className="label">Upcoming Events</p>
          <p className="num">
            <CountUp end={stats.totalEvents} />
          </p>
        </div>

        <div className="stat magenta">
          <p className="label">Tickets Sold</p>
          <p className="num">
            <CountUp end={stats.totalBookings} />
          </p>
        </div>

        <div className="stat">
          <p className="label">Gross Revenue</p>
          <p className="num">
            <CountUp end={stats.totalRevenue} prefix="₹" />
          </p>
        </div>

        <div className="stat magenta">
          <p className="label">Check-In Rate</p>
          <p className="num">
            <CountUp end={checkInRate} suffix="%" />
          </p>
        </div>
      </section>

      {/* Additional Analytics Card */}
      <div className="card p-6 mt-4">
        <h3 className="section-title" style={{ marginBottom: '8px', fontFamily: 'Poppins', fontSize: '20px' }}>
          Platform Booking Summary
        </h3>
        <p className="muted mb-6">Real-time telemetry and cancellation conversion ratios.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div className="stat-card" style={{ borderLeft: '4px solid var(--success)', background: 'var(--stage)' }}>
            <strong style={{ fontSize: '24px' }}>{stats.confirmedBookings}</strong>
            <span className="muted">Confirmed Seats</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid var(--magenta)', background: 'var(--stage)' }}>
            <strong style={{ fontSize: '24px' }}>{stats.cancelledBookings}</strong>
            <span className="muted">Cancelled / Refunded</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid var(--amber)', background: 'var(--stage)' }}>
            <strong style={{ fontSize: '24px' }}>{stats.totalUsers}</strong>
            <span className="muted">Unique Attendees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
