import { useEffect, useState } from 'react';
import * as bookingApi from '../../api/bookingApi.js';
import * as eventApi from '../../api/eventApi.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { ShieldAlert, UserCheck, ShieldCheck, Search, Users, AlertTriangle } from 'lucide-react';

export default function CheckInConsole() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Console state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Simulated database check-ins
  const [checkedInSet, setCheckedInSet] = useState(new Set());
  
  // Capacity headcounts
  const [eventHeadcounts, setEventHeadcounts] = useState({});

  const fetchData = async () => {
    try {
      const [b, e] = await Promise.all([
        bookingApi.getBookings(),
        eventApi.getEvents()
      ]);
      setBookings(b);
      setEvents(e);
      
      // Initialize capacities
      const headcounts = {};
      e.forEach(ev => {
        // Initial headcounts: assume 40% of total sold seats are checked-in initially
        const soldSeats = ev.totalSeats - ev.availableSeats;
        headcounts[ev.id] = Math.round(soldSeats * 0.4);
      });
      setEventHeadcounts(headcounts);
    } catch (err) {
      toast.error('Failed to load check-in telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const searchStr = searchQuery.trim().toLowerCase();
    const match = bookings.find(b => 
      b.id.toString() === searchStr || 
      b.tokenId?.toLowerCase() === searchStr ||
      b.userEmail?.toLowerCase() === searchStr
    );
    
    if (match) {
      setSelectedBooking(match);
      toast.success('Ticket records found');
    } else {
      toast.error('No booking records match this query');
    }
  };

  const handleCheckIn = (bookingId, eventId) => {
    if (checkedInSet.has(bookingId)) {
      // Trigger Duplicate Scan Warning
      toast.error('SECURITY WARNING: DUPLICATE scan detected!');
      setSelectedBooking(prev => ({ ...prev, duplicateScan: true }));
      return;
    }

    // Set check-in status
    setCheckedInSet(prev => new Set([...prev, bookingId]));
    
    // Update live headcount
    setEventHeadcounts(prev => {
      const current = prev[eventId] || 0;
      return {
        ...prev,
        [eventId]: current + 1
      };
    });

    setSelectedBooking(prev => ({ 
      ...prev, 
      checkedIn: true,
      duplicateScan: false 
    }));
    
    toast.success('Attendee checked in successfully!');
  };

  if (loading) return <LoadingSpinner label="Booting check-in console..." />;

  // Find event and capacity detail for selected booking
  const bookingEvent = selectedBooking 
    ? events.find(e => e.id === selectedBooking.eventId)
    : null;
    
  const currentCount = bookingEvent ? (eventHeadcounts[bookingEvent.id] || 0) : 0;
  const maxCapacity = bookingEvent ? bookingEvent.totalSeats : 1;
  const capacityPct = Math.round((currentCount / maxCapacity) * 100);
  
  // Warning at 90%+ capacity
  const showCapacityAlert = capacityPct >= 90;

  // Determine credential access zones based on seat price
  const getAccessZones = (price) => {
    if (price >= 1500) {
      return ['General Access', 'Exhibition Floor', 'Speaker Lounge', 'VIP Backstage'];
    } else if (price >= 500) {
      return ['General Access', 'Exhibition Floor', 'VIP Lounge'];
    } else {
      return ['General Access', 'Exhibition Floor'];
    }
  };

  const zones = bookingEvent ? getAccessZones(bookingEvent.ticketPrice) : [];

  return (
    <div>
      <div className="header-actions">
        <div>
          <p className="eyebrow">Staff Operations Room</p>
          <h1 className="page-title-main">Access & Check-In Console</h1>
        </div>
        
        <span className="badge live">Gate Scanners Live</span>
      </div>

      <div className="two-col-grid" style={{ marginTop: '20px' }}>
        
        {/* Left Column: Search & Quick Stats */}
        <div className="stack">
          
          {/* Quick Search */}
          <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
            <h3 className="section-title" style={{ fontFamily: 'Anton', fontSize: '18px', textTransform: 'uppercase' }}>
              Scan Ticket QR
            </h3>
            <p className="muted mb-4">Enter Ticket ID or customer email to query registration system.</p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input 
                className="input-field" 
                placeholder="e.g. Ticket ID, Token ID, or name@ems.com" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="cta" type="submit" style={{ padding: '12px 18px' }}>
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Quick Platform Telemetry */}
          <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
            <h3 className="section-title" style={{ fontFamily: 'Anton', fontSize: '18px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Active Room Occupancy
            </h3>
            
            <div className="stack" style={{ gap: '10px' }}>
              {events.map(ev => {
                const count = eventHeadcounts[ev.id] || 0;
                const cap = ev.totalSeats || 1;
                const pct = Math.round((count / cap) * 100);
                
                return (
                  <div key={ev.id} className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '12px 16px' }}>
                    <div className="flex row-between text-sm font-semibold">
                      <span>{ev.eventTitle}</span>
                      <span style={{ color: pct >= 90 ? 'var(--magenta)' : 'var(--amber)' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: pct >= 90 ? 'var(--magenta)' : 'var(--amber)', transition: 'width 0.4s ease' }}></div>
                    </div>
                    <span className="muted text-xs mt-2" style={{ display: 'block', marginTop: '6px' }}>
                      {count} / {cap} Checked In
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Scanned Ticket details & Warnings */}
        <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
          {selectedBooking ? (
            <div className="stack" style={{ gap: '16px' }}>
              
              {/* Duplicate scan alarm */}
              {selectedBooking.duplicateScan && (
                <div className="stat-card" style={{ border: '2px solid var(--magenta)', background: 'rgba(255,61,122,0.06)', animation: 'pulse 1s infinite', padding: '16px' }}>
                  <div className="flex gap-3" style={{ alignItems: 'center', color: 'var(--magenta)', fontWeight: 'bold', fontSize: '16px' }}>
                    <AlertTriangle size={24} /> SECURITY ALERT: DUPLICATE QR SCAN!
                  </div>
                  <p className="text-xs muted mt-2" style={{ margin: 0 }}>
                    This ticket ID has already registered a check-in event. Verify attendee credentials physically.
                  </p>
                </div>
              )}

              {/* Room capacity overflow alarm */}
              {showCapacityAlert && (
                <div className="stat-card" style={{ border: '2px solid var(--amber)', background: 'rgba(255,184,77,0.06)', padding: '16px' }}>
                  <div className="flex gap-3" style={{ alignItems: 'center', color: 'var(--amber)', fontWeight: 'bold', fontSize: '16px' }}>
                    <ShieldAlert size={24} /> ROOM CAPACITY LIMIT REACHED!
                  </div>
                  <p className="text-xs muted mt-2" style={{ margin: 0 }}>
                    This session is currently at <strong>{capacityPct}% capacity</strong>. Please redirect overflow attendees to the secondary hall.
                  </p>
                </div>
              )}

              {/* Ticket stub layout */}
              <div className="stat-card" style={{ background: 'var(--paper)', color: 'var(--ink)', padding: '24px', border: 'none', borderRadius: '18px', position: 'relative' }}>
                <span className="badge live" style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  {checkedInSet.has(selectedBooking.id) ? 'CHECKED IN' : 'VALID TICKET'}
                </span>
                
                <span className="eyebrow" style={{ color: 'var(--magenta)' }}>Ticket ID #{selectedBooking.id} {selectedBooking.tokenId ? `| Token: ${selectedBooking.tokenId}` : ''}</span>
                <h2 style={{ fontFamily: 'Anton', fontSize: '28px', textTransform: 'uppercase', margin: '8px 0 16px 0', color: 'var(--ink)' }}>
                  {selectedBooking.userName || 'Attendee'}
                </h2>
                
                <div className="t-meta" style={{ color: '#555', gap: '20px' }}>
                  <span>Email: <strong>{selectedBooking.userEmail}</strong></span>
                  <span>Session: <strong>{selectedBooking.eventTitle}</strong></span>
                  <span>Tickets: <strong>{selectedBooking.numberOfTickets} seats</strong></span>
                </div>

                <div className="barcode" style={{ marginTop: '24px', height: '40px' }}></div>
              </div>

              {/* Access credentials zones */}
              <div>
                <label className="label-text">Credential Zones Approved</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {zones.map(zone => (
                    <span 
                      key={zone} 
                      className="badge" 
                      style={{ 
                        background: zone.includes('VIP') || zone.includes('Backstage') ? 'rgba(255,61,122,0.1)' : 'rgba(255,255,255,0.05)',
                        color: zone.includes('VIP') || zone.includes('Backstage') ? 'var(--magenta)' : 'var(--paper-dim)',
                        border: '1px solid var(--line)'
                      }}
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              {/* Checkin Trigger */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setSelectedBooking(null)}
                  style={{ flex: 1 }}
                >
                  Clear Screen
                </button>
                
                <button 
                  className="btn-primary" 
                  onClick={() => handleCheckIn(selectedBooking.id, selectedBooking.eventId)}
                  disabled={checkedInSet.has(selectedBooking.id) && !selectedBooking.duplicateScan}
                  style={{ flex: 2, background: checkedInSet.has(selectedBooking.id) ? 'var(--line)' : 'var(--amber)', color: 'var(--ink)' }}
                >
                  <UserCheck size={16} /> Approve & Check-In
                </button>
              </div>

            </div>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '350px' }}>
              <div className="text-center stack" style={{ alignItems: 'center' }}>
                <ShieldCheck size={48} className="muted" />
                <p className="muted text-sm mt-3">Ready to scan. Please query a ticket ID.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
