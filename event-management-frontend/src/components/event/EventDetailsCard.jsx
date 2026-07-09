import { formatDate } from '../../utils/formatDate.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function EventDetailsCard({event}) {
  return (
    <div className='event-card-modern' style={{ height: 'auto', marginBottom: '24px' }}>
      <div className='event-card-image' style={{ height: '350px' }}>
        <div className='event-card-category-badge badge'>{event.categoryName || 'Event'}</div>
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.eventTitle} />
        ) : (
          <img src={`https://picsum.photos/seed/${event.id}/1200/500`} alt={event.eventTitle} />
        )}
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
