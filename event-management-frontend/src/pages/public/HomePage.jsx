import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../../components/common/AppLogo.jsx';
import GradientButton from '../../components/common/GradientButton.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import EventCard from '../../components/event/EventCard.jsx';
import Marquee from '../../components/common/Marquee.jsx';
import * as eventApi from '../../api/eventApi.js';
import useAuth from '../../hooks/useAuth.js';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Clock state
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    // Ticking Clock
    const tick = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    eventApi.getEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (activeFilter === 'all') return true;
      
      const availableSeats = e.availableSeats ?? 0;
      const totalSeats = e.totalSeats ?? 0;

      if (activeFilter === 'soldout') return availableSeats <= 0;
      if (activeFilter === 'live') return e.eventStatus === 'LIVE';
      if (activeFilter === 'selling') return availableSeats > 0 && availableSeats <= totalSeats * 0.2;
      if (activeFilter === 'upcoming') return e.eventStatus !== 'LIVE' && availableSeats > totalSeats * 0.2;
      return true;
    });
  }, [events, activeFilter]);

  return (
    <div>
      {/* Marquee Banner */}
      <Marquee />

      <header className="topbar">
        <AppLogo />
        <div className="flex gap-3" style={{ alignItems: 'center' }}>
          <Link to="/my-bookings" className="top-link">My bookings</Link>
          <Link to={isAuthenticated ? '/dashboard' : '/login'}>
            <GradientButton>
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
            </GradientButton>
          </Link>
        </div>
      </header>

      <div className="wrap">
        <section className="hero">
          <div>
            <p className="eyebrow">Backstage / Ticket Space</p>
            <h1>Event control room</h1>
            <p className="sub">Every show, sold-out or selling — live in one place.</p>
          </div>
          
          <div className="hero-right">
            <div className="clock">
              <span>{dateStr || 'Loading...'}</span>
              <strong>{timeStr || '--:--:--'}</strong>
            </div>
            {user?.role === 'ADMIN' || user?.role === 'ORGANIZER' ? (
              <Link to="/dashboard/events">
                <button className="cta">+ New Event</button>
              </Link>
            ) : null}
          </div>
        </section>

        {/* Dynamic Filters */}
        <section className="filters" style={{ marginTop: '30px' }}>
          <button 
            className={`chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All events
          </button>
          <button 
            className={`chip ${activeFilter === 'live' ? 'active' : ''}`}
            onClick={() => setActiveFilter('live')}
          >
            Live now
          </button>
          <button 
            className={`chip ${activeFilter === 'selling' ? 'active' : ''}`}
            onClick={() => setActiveFilter('selling')}
          >
            Selling fast
          </button>
          <button 
            className={`chip ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`chip ${activeFilter === 'soldout' ? 'active' : ''}`}
            onClick={() => setActiveFilter('soldout')}
          >
            Sold out
          </button>
        </section>

        {/* Ticket List grid */}
        <section style={{ paddingBottom: '80px' }}>
          {loading ? (
            <LoadingSpinner label="Querying event control room..." />
          ) : filteredEvents.length === 0 ? (
            <EmptyState 
              title="No events found" 
              description="There are no events matching the selected filter state."
            />
          ) : (
            <div className="tickets">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
