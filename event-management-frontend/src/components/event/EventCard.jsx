import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function EventCard({ event }) {
  const cardRef = useRef(null);

  // Determine Seating Status
  const availableSeats = event.availableSeats ?? 0;
  const totalSeats = event.totalSeats ?? 0;
  const bookedSeats = totalSeats - availableSeats;
  const fillPct = totalSeats > 0 ? Math.min(100, Math.round((bookedSeats / totalSeats) * 100)) : 0;
  
  let badgeClass = 'upcoming';
  let badgeLabel = 'Just opened';
  let showPulse = false;

  if (event.eventStatus === 'CANCELLED') {
    badgeClass = 'soldout'; // reuse grey styles or create a new one, let's just use grey text style
    badgeLabel = 'Cancelled';
  } else if (availableSeats <= 0) {
    badgeClass = 'soldout';
    badgeLabel = 'Sold out';
  } else if (event.eventStatus === 'LIVE') {
    badgeClass = 'live';
    badgeLabel = 'Live now';
    showPulse = true;
  } else if (availableSeats <= totalSeats * 0.2) {
    badgeClass = 'selling';
    badgeLabel = 'Selling fast';
  }

  const isCancelled = event.eventStatus === 'CANCELLED';

  // Category-based creative thumbnails using Unsplash (always reliable, always relevant)
  const CATEGORY_IMAGES = {
    'music':       'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format',
    'technology':  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&auto=format',
    'tech':        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&auto=format',
    'sports':      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop&auto=format',
    'art':         'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop&auto=format',
    'food':        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&auto=format',
    'business':    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop&auto=format',
    'education':   'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop&auto=format',
    'health':      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format',
    'comedy':      'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&h=400&fit=crop&auto=format',
    'drama':       'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop&auto=format',
    'cultural':    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop&auto=format',
    'conference':  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format',
    'workshop':    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop&auto=format',
    'festival':    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop&auto=format',
    'networking':  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop&auto=format',
  };

  const getCategoryImage = () => {
    const cat = (event.categoryName || '').toLowerCase().trim();
    for (const key of Object.keys(CATEGORY_IMAGES)) {
      if (cat.includes(key)) return CATEGORY_IMAGES[key];
    }
    // Deterministic fallback using event ID so each event has a unique stable image
    const seeds = ['photo-1540575467063-178a50c2df87','photo-1493225457124-a3eb161ffa5f','photo-1559136555-9303baea8ebd','photo-1506157786151-b8491531f063','photo-1511795409834-ef04bbd61622'];
    const idx = (event.id || 0) % seeds.length;
    return `https://images.unsplash.com/${seeds[idx]}?w=600&h=400&fit=crop&auto=format`;
  };

  const defaultBanner = (event.bannerUrl && event.bannerUrl.startsWith('http') && !event.bannerUrl.includes('example.com'))
    ? event.bannerUrl
    : getCategoryImage();

  return (
    <Link 
      to={`/events/${event.id}`} 
      className="event-card-modern"
      style={isCancelled ? { filter: 'grayscale(100%)', opacity: 0.6 } : {}}
      ref={cardRef}
    >
      {/* Banner image wrapper */}
      <div className="event-card-image">
        <div className="event-card-floating-badge">
          <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
          {showPulse && (
            <span className="pulse" style={{ marginLeft: '6px' }}>
              <i></i><i></i><i></i>
            </span>
          )}
        </div>
        
        <span className="badge event-card-category-badge">
          {event.categoryName || 'Event'}
        </span>

        <img src={defaultBanner} alt={event.eventTitle} loading="lazy" />
        <div className="event-card-image-overlay"></div>
      </div>
      
      {/* Card Details Body */}
      <div className="event-card-body">
        <h3 className="event-card-title">{event.eventTitle}</h3>
        
        <div className="event-card-meta">
          <span><MapPin size={14} style={{ color: 'var(--secondary)' }} /> {event.venueName || 'TBA'}</span>
          <span><Calendar size={14} style={{ color: 'var(--secondary)' }} /> {formatDate(event.eventDate)} • {event.startTime}</span>
        </div>

        {/* Capacity Progress Bar */}
        <div className="event-card-capacity-bar">
          <div className="event-card-capacity-label">
            <span>Seat Capacity</span>
            <strong>{availableSeats} / {totalSeats} Left</strong>
          </div>
          <div className="event-card-capacity-progress">
            <div 
              className={`event-card-capacity-fill ${availableSeats <= totalSeats * 0.2 ? 'low-capacity' : ''}`}
              style={{ width: `${fillPct}%` }}
            ></div>
          </div>
        </div>

        {/* Card Footer pricing */}
        <div className="event-card-footer">
          <div>
            <div className="event-card-price-label">Tickets from</div>
            <div className="event-card-price">{formatCurrency(event.ticketPrice || 0)}</div>
          </div>
          
          <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: '50%', width: '38px', height: '38px' }}>
            <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
          </button>
        </div>
      </div>
    </Link>
  );
}
