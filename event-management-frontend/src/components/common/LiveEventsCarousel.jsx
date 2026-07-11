import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    id: 1,
    image: '/carousel_concert.png',
    category: '🎤 Concert',
    title: 'Neon Horizon Music Festival',
    date: 'Aug 15, 2026',
    venue: 'Jawaharlal Nehru Stadium',
    price: '₹1,499',
    color: '#4F46E5',
    link: '/dashboard/events',
  },
  {
    id: 2,
    image: '/carousel_dj_night.png',
    category: '🪩 DJ Night',
    title: 'Bass Drop: Underground Edition',
    date: 'Jul 22, 2026',
    venue: 'Sky Lounge, Mumbai',
    price: '₹999',
    color: '#06B6D4',
    link: '/dashboard/events',
  },
  {
    id: 3,
    image: '/carousel_dance.png',
    category: '💃 Dance Show',
    title: 'Rhythm & Soul — Latin Spectacular',
    date: 'Sep 3, 2026',
    venue: 'Kala Mandir, Kolkata',
    price: '₹799',
    color: '#EC4899',
    link: '/dashboard/events',
  },
  {
    id: 4,
    image: '/carousel_rockfest.png',
    category: '🎸 Rock Fest',
    title: 'Thunderstruck: The Rock Rebellion',
    date: 'Oct 10, 2026',
    venue: 'Palace Grounds, Bangalore',
    price: '₹1,999',
    color: '#F59E0B',
    link: '/dashboard/events',
  },
  {
    id: 5,
    image: '/carousel_cultural.png',
    category: '🎭 Cultural Event',
    title: 'Rang Mahotsav — Heritage Festival',
    date: 'Nov 5, 2026',
    venue: 'Siri Fort Auditorium, Delhi',
    price: '₹599',
    color: '#10B981',
    link: '/dashboard/events',
  },
];

export default function LiveEventsCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const autoPlayRef = useRef(null);
  const total = SLIDES.length;

  const goTo = useCallback((index) => {
    setCurrent((index + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play every 5 seconds
  useEffect(() => {
    autoPlayRef.current = setInterval(next, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  // Drag / Swipe support
  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart(e.clientX);
    clearInterval(autoPlayRef.current);
  };

  const handleMouseUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    const delta = dragStart - e.clientX;
    if (delta > 50) next();
    else if (delta < -50) prev();
  };

  const handleTouchStart = (e) => {
    setDragStart(e.touches[0].clientX);
    clearInterval(autoPlayRef.current);
  };

  const handleTouchEnd = (e) => {
    const delta = dragStart - e.changedTouches[0].clientX;
    if (delta > 40) next();
    else if (delta < -40) prev();
  };

  const slide = SLIDES[current];

  return (
    <section className="live-carousel-section">
      {/* Header */}
      <div className="live-carousel-header">
        <h2 className="live-carousel-title">
          <span className="text-gradient">Live Events</span>
          <span className="live-badge-pulse">
            <span className="live-dot"></span>
            LIVE
          </span>
        </h2>
        <div className="carousel-nav-btns">
          <button
            className="carousel-nav-btn"
            onClick={prev}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="carousel-nav-btn"
            onClick={next}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      </div>

      {/* Carousel viewport */}
      <div
        className="carousel-viewport"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ userSelect: 'none' }}
      >
        {/* Counter badge */}
        <div className="carousel-counter">
          {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>

        {/* Track */}
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((s, i) => (
            <div key={s.id} className="carousel-slide" aria-hidden={i !== current}>
              <img src={s.image} alt={s.title} draggable={false} />
              <div className="carousel-slide-overlay">
                <div className="carousel-slide-category">{s.category}</div>
                <h3 className="carousel-slide-title">{s.title}</h3>
                <div className="carousel-slide-meta">
                  <span>📅 {s.date}</span>
                  <span>📍 {s.venue}</span>
                  <span style={{ color: '#FFD700', fontWeight: 700 }}>
                    🎟️ From {s.price}
                  </span>
                </div>
                <Link to={s.link}>
                  <button className="carousel-slide-cta">
                    Book Tickets →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot navigation */}
      <div className="carousel-dots" role="tablist" aria-label="Carousel slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`carousel-dot${i === current ? ' active' : ''}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}: ${s.title}`}
          />
        ))}
      </div>
    </section>
  );
}
