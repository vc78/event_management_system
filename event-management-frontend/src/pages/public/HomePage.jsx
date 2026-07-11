import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import EventCard from '../../components/event/EventCard.jsx';
import Marquee from '../../components/common/Marquee.jsx';
import LiveEventsCarousel from '../../components/common/LiveEventsCarousel.jsx';
import * as eventApi from '../../api/eventApi.js';
import { useRealtimeEventsList } from '../../hooks/useRealtime.js';
import useAuth from '../../hooks/useAuth.js';

/* ── Flip Clock digit ───────────────────────────────────────────── */
function FlipDigit({ value, label }) {
  const [displayed, setDisplayed] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplayed(value);
        setFlipping(false);
        prev.current = value;
      }, 260);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flip-unit">
      <div className={`flip-card${flipping ? ' flipping' : ''}`}>
        <div className="flip-top">{displayed}</div>
        <div className="flip-bottom">{displayed}</div>
        {flipping && <div className="flip-top flip-front">{prev.current}</div>}
        {flipping && <div className="flip-bottom flip-back">{value}</div>}
      </div>
      <span className="flip-label">{label}</span>
    </div>
  );
}

/* ── Floating orb for aurora effect ─────────────────────────────── */
function AuroraOrb({ style }) {
  return <div className="aurora-orb" style={style} />;
}

/* ══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [dateParts, setDateParts] = useState({ day: '--', month: '---', weekday: '---' });
  const [scrolled, setScrolled] = useState(false);

  // Ticking clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setHours(String(n.getHours()).padStart(2, '0'));
      setMinutes(String(n.getMinutes()).padStart(2, '0'));
      setSeconds(String(n.getSeconds()).padStart(2, '0'));
      setDateParts({
        day: String(n.getDate()).padStart(2, '0'),
        month: n.toLocaleDateString('en', { month: 'short' }).toUpperCase(),
        weekday: n.toLocaleDateString('en', { weekday: 'short' }).toUpperCase(),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: events = [], isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: eventApi.getEvents,
  });

  useRealtimeEventsList();

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (activeFilter === 'all') return true;
      const avail = e.availableSeats ?? 0;
      const total = e.totalSeats ?? 0;
      if (activeFilter === 'soldout') return avail <= 0;
      if (activeFilter === 'live') return e.eventStatus === 'LIVE';
      if (activeFilter === 'selling') return avail > 0 && avail <= total * 0.2;
      if (activeFilter === 'upcoming') return e.eventStatus !== 'LIVE' && avail > total * 0.2;
      return true;
    });
  }, [events, activeFilter]);

  const FILTERS = [
    { id: 'all',      emoji: '✦',  label: 'All Events' },
    { id: 'live',     emoji: '🔴', label: 'Live Now'    },
    { id: 'selling',  emoji: '🔥', label: 'Selling Fast' },
    { id: 'upcoming', emoji: '🗓️', label: 'Upcoming'   },
    { id: 'soldout',  emoji: '🎟️', label: 'Sold Out'   },
  ];

  return (
    <div className="hp-root">
      {/* ── Aurora background ───────────────────────────────────── */}
      <div className="hp-aurora" aria-hidden>
        <AuroraOrb style={{ width: 600, height: 600, top: '-120px', left: '-180px', background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%)' }} />
        <AuroraOrb style={{ width: 500, height: 500, top: '60px', right: '-140px', background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)' }} />
        <AuroraOrb style={{ width: 400, height: 400, top: '350px', left: '35%', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Themed scroller */}
      <Marquee />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="hp-hero">
        {/* Eyebrow */}
        <div className="hp-eyebrow">
          <span className="hp-eyebrow-dot" />
          <span>India's Premier Event Platform</span>
          <span className="hp-eyebrow-dot" />
        </div>

        {/* Headline */}
        <h1 className="hp-headline">
          <span className="hp-headline-plain">From </span>
          <span className="hp-headline-gradient">Ideas</span>
          <span className="hp-headline-plain"> to </span>
          <span className="hp-headline-gradient hp-headline-gradient--cyan">Reality</span>
          <br />
          <span className="hp-headline-sub-line">Book Everything You Need</span>
        </h1>

        {/* Sub */}
        <p className="hp-sub">
          Discover and book the perfect venues, concerts, and experiences.<br />
          Make your event planning effortless and extraordinary.
        </p>

        {/* CTA Row */}
        <div className="hp-cta-row">
          <Link to={isAuthenticated ? '/dashboard/events' : '/login'} className="hp-btn-primary">
            <span className="hp-btn-shine" />
            🎟️ Book Your Event
          </Link>
          <button
            className="hp-btn-ghost"
            onClick={() => document.getElementById('carousel-anchor')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Live Events ↓
          </button>
        </div>

        {/* ── Flip Clock ─────────────────────────────────────────── */}
        <div className="flip-clock-wrap">
          <div className="flip-clock-label-top">LIVE TIME</div>
          <div className="flip-clock">
            {/* Date block */}
            <div className="flip-date-block">
              <div className="flip-date-day">{dateParts.day}</div>
              <div className="flip-date-month">{dateParts.month}</div>
              <div className="flip-date-wd">{dateParts.weekday}</div>
            </div>

            <div className="flip-separator">:</div>

            {/* H : M : S */}
            <FlipDigit value={hours}   label="HRS" />
            <div className="flip-colon">:</div>
            <FlipDigit value={minutes} label="MIN" />
            <div className="flip-colon">:</div>
            <FlipDigit value={seconds} label="SEC" />
          </div>

          {/* Stat pills */}
          <div className="flip-stats">
            <div className="flip-stat-pill">
              <span className="flip-stat-dot" style={{ background: '#10B981' }} />
              {events.filter(e => e.eventStatus === 'LIVE' || e.eventStatus === 'PUBLISHED').length} Live Events
            </div>
            <div className="flip-stat-pill">
              <span className="flip-stat-dot" style={{ background: '#4F46E5' }} />
              {events.length} Total Events
            </div>
            <div className="flip-stat-pill">
              <span className="flip-stat-dot" style={{ background: '#F59E0B' }} />
              Tickets Available
            </div>
          </div>
        </div>
      </section>

      {/* ── Carousel & events ───────────────────────────────────── */}
      <div className="wrap" id="carousel-anchor">
        <LiveEventsCarousel />

        {/* Divider */}
        <div className="hp-divider">
          <div className="hp-divider-line" />
          <span className="hp-divider-label">✦ All Events ✦</span>
          <div className="hp-divider-line" />
        </div>

        {/* ── Filter chips ──────────────────────────────────────── */}
        <section className="hp-filters">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`hp-chip${activeFilter === f.id ? ' hp-chip--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              <span className="hp-chip-emoji">{f.emoji}</span>
              {f.label}
              {activeFilter === f.id && <span className="hp-chip-bar" />}
            </button>
          ))}
        </section>

        {/* ── Event Grid ────────────────────────────────────────── */}
        <section style={{ paddingBottom: '100px' }}>
          {loading ? (
            <LoadingSpinner label="Loading events..." />
          ) : isError ? (
            <div className="center-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
              <p className="text-danger">Failed to load events: {error?.message}</p>
              <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState title="No events found" description="No events match the selected filter." />
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
