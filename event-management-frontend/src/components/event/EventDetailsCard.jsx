import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function EventDetailsCard({event}) {
  const CATEGORY_IMAGES = {
    'music':       'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=500&fit=crop&auto=format',
    'technology':  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=500&fit=crop&auto=format',
    'tech':        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=500&fit=crop&auto=format',
    'sports':      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=500&fit=crop&auto=format',
    'art':         'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=500&fit=crop&auto=format',
    'food':        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=500&fit=crop&auto=format',
    'business':    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=500&fit=crop&auto=format',
    'education':   'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=500&fit=crop&auto=format',
    'health':      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=500&fit=crop&auto=format',
    'comedy':      'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200&h=500&fit=crop&auto=format',
    'cultural':    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=500&fit=crop&auto=format',
    'conference':  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=500&fit=crop&auto=format',
    'workshop':    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=500&fit=crop&auto=format',
    'festival':    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=500&fit=crop&auto=format',
    'networking':  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=500&fit=crop&auto=format',
  };

  const getCategoryImage = () => {
    const cat = (event.categoryName || '').toLowerCase().trim();
    for (const key of Object.keys(CATEGORY_IMAGES)) {
      if (cat.includes(key)) return CATEGORY_IMAGES[key];
    }
    const seeds = ['photo-1540575467063-178a50c2df87','photo-1493225457124-a3eb161ffa5f','photo-1559136555-9303baea8ebd','photo-1506157786151-b8491531f063','photo-1511795409834-ef04bbd61622'];
    const idx = (event.id || 0) % seeds.length;
    return `https://images.unsplash.com/${seeds[idx]}?w=1200&h=500&fit=crop&auto=format`;
  };

  const bannerSrc = (event.bannerUrl && event.bannerUrl.startsWith('http') && !event.bannerUrl.includes('example.com'))
    ? event.bannerUrl
    : getCategoryImage();

  return (
    <div className='event-card-modern' style={{ height: 'auto', marginBottom: '24px' }}>
      <div className='event-card-image' style={{ height: '350px' }}>
        <div className='event-card-category-badge badge'>{event.categoryName || 'Event'}</div>
        <img src={bannerSrc} alt={event.eventTitle} />
        <div className='event-card-image-overlay'></div>
      </div>
      <div className='event-card-body' style={{ padding: '32px' }}>
        <h1 className='event-card-title' style={{ fontSize: '36px', marginBottom: '16px' }}>{event.eventTitle}</h1>
        <p className='muted' style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>{event.description}</p>
        
        <div className='details-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className='stat-card' style={{ background: 'var(--stage)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ color: 'var(--ash)', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Date</strong>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>{formatDate(event.eventDate)}</span>
          </div>
          <div className='stat-card' style={{ background: 'var(--stage)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ color: 'var(--ash)', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Time</strong>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>{event.startTime} - {event.endTime}</span>
          </div>
          <div className='stat-card' style={{ background: 'var(--stage)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ color: 'var(--ash)', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Venue</strong>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>{event.venueName || 'TBA'}</span>
          </div>
          <div className='stat-card' style={{ background: 'var(--stage)', padding: '16px', borderRadius: '12px' }}>
            <strong style={{ color: 'var(--ash)', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Price</strong>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--amber)' }}>{formatCurrency(event.ticketPrice || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
