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

  if (availableSeats <= 0) {
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

  // Fallback image banner based on category or index if bannerUrl is empty
  const defaultBanner = event.bannerUrl && !event.bannerUrl.includes('example.com')
    ? event.bannerUrl
    : `https://picsum.photos/seed/${event.id}/600/400`;

  return (
    <Link 
      to={`/events/${event.id}`} 
      className="event-card-modern"
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
          <span><MapPin size={14} style={{ color: 'var(--amber)' }} /> {event.venueName || 'TBA'}</span>
          <span><Calendar size={14} style={{ color: 'var(--amber)' }} /> {formatDate(event.eventDate)} • {event.startTime}</span>
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
            <ArrowRight size={16} style={{ color: 'var(--amber)' }} />
          </button>
        </div>
      </div>
    </Link>
  );
}
