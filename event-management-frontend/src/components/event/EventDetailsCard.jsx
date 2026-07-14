import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { CalendarDays, Clock, MapPin, Tag, Users } from 'lucide-react';

export default function EventDetailsCard({ event }) {
  const CATEGORY_IMAGES = {
    'music':       'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop&auto=format',
    'technology':  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop&auto=format',
    'tech':        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop&auto=format',
    'sports':      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop&auto=format',
    'art':         'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=600&fit=crop&auto=format',
    'food':        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop&auto=format',
    'business':    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop&auto=format',
    'education':   'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=600&fit=crop&auto=format',
    'health':      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&auto=format',
    'comedy':      'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200&h=600&fit=crop&auto=format',
    'cultural':    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop&auto=format',
    'conference':  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop&auto=format',
    'workshop':    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop&auto=format',
    'festival':    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=600&fit=crop&auto=format',
    'networking':  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=600&fit=crop&auto=format',
  };

  const getCategoryImage = () => {
    const cat = (event.categoryName || '').toLowerCase().trim();
    for (const key of Object.keys(CATEGORY_IMAGES)) {
      if (cat.includes(key)) return CATEGORY_IMAGES[key];
    }
    const seeds = ['photo-1540575467063-178a50c2df87','photo-1493225457124-a3eb161ffa5f','photo-1559136555-9303baea8ebd','photo-1506157786151-b8491531f063','photo-1511795409834-ef04bbd61622'];
    return `https://images.unsplash.com/${seeds[(event.id || 0) % seeds.length]}?w=1200&h=600&fit=crop&auto=format`;
  };

  const bannerSrc = (event.bannerUrl && event.bannerUrl.startsWith('http') && !event.bannerUrl.includes('example.com'))
    ? event.bannerUrl
    : getCategoryImage();

  const isSoldOut = (event.availableSeats ?? 0) <= 0;

  return (
    <div className="edc-root">
      {/* ── Banner ── */}
      <div className="edc-banner">
        <img src={bannerSrc} alt={event.eventTitle} className="edc-banner-img" />
        <div className="edc-banner-overlay" />

        <div className="edc-banner-badges">
          <span className="edc-badge-cat">{event.categoryName || 'Event'}</span>
          {isSoldOut
            ? <span className="edc-badge-soldout">SOLD OUT</span>
            : <span className="edc-badge-seats">🎫 {event.availableSeats} seats left</span>
          }
        </div>

        <div className="edc-banner-title-wrap">
          <h1 className="edc-banner-title">{event.eventTitle}</h1>
        </div>
      </div>

      {/* ── Meta Strip ── */}
      <div className="edc-meta-strip">
        <div className="edc-meta-item">
          <CalendarDays size={16} className="edc-meta-icon" />
          <div>
            <span className="edc-meta-label">Date</span>
            <span className="edc-meta-value">{formatDate(event.eventDate)}</span>
          </div>
        </div>
        <div className="edc-meta-item">
          <Clock size={16} className="edc-meta-icon" />
          <div>
            <span className="edc-meta-label">Time</span>
            <span className="edc-meta-value">{event.startTime} – {event.endTime}</span>
          </div>
        </div>
        <div className="edc-meta-item">
          <MapPin size={16} className="edc-meta-icon" />
          <div>
            <span className="edc-meta-label">Venue</span>
            <span className="edc-meta-value">{event.venueName || 'TBA'}</span>
          </div>
        </div>
        <div className="edc-meta-item">
          <Tag size={16} className="edc-meta-icon" />
          <div>
            <span className="edc-meta-label">Price</span>
            <span className="edc-meta-value edc-meta-price">{formatCurrency(event.ticketPrice || 0)}</span>
          </div>
        </div>
        {event.capacity && (
          <div className="edc-meta-item">
            <Users size={16} className="edc-meta-icon" />
            <div>
              <span className="edc-meta-label">Capacity</span>
              <span className="edc-meta-value">{event.capacity}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Description ── */}
      {event.description && (
        <div className="edc-body">
          <h2 className="edc-section-heading">About this Event</h2>
          <p className="edc-description">{event.description}</p>
        </div>
      )}
    </div>
  );
}
