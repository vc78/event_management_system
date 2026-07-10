import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Compass, Tv, Award, ArrowRight, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import * as bookingApi from '../../api/bookingApi.js';
import * as referralApi from '../../api/referralApi.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function AttendeeHub() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [bookings, setBookings] = useState([]);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Live clock
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

  useEffect(() => {
    if (!user?.id) return;
    
    Promise.all([
      bookingApi.getBookingsByUser(user.id).catch(() => []),
      referralApi.getReferralByUser(user.id).catch(() => null)
    ]).then(([b, r]) => {
      setBookings(b);
      setReferral(r);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <LoadingSpinner label="Entering attendee workspace..." />;

  // Calculate stats
  const activeBookings = bookings.filter(b => b.bookingStatus !== 'CANCELLED');
  const totalSpent = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div>
      <header className="hero" style={{ padding: '0 0 24px', marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Attendee Space / Workspace</p>
          <h1>Welcome, {user?.fullName || 'Guest'}</h1>
          <p className="sub">Authorized Email Access: <strong style={{ color: 'var(--amber)' }}>{user?.email}</strong></p>
        </div>
        
        <div className="hero-right">
          <div className="clock">
            <span>{dateStr || 'Loading...'}</span>
            <strong>{timeStr || '--:--:--'}</strong>
          </div>
        </div>
      </header>

      {/* Quick Summary Telemetry */}
      <section className="stats">
        <div className="stat">
          <p className="label">Your Reserved Sessions</p>
          <p className="num">{activeBookings.length}</p>
        </div>

        <div className="stat magenta">
          <p className="label">Total Amount Spent</p>
          <p className="num">{formatCurrency(totalSpent)}</p>
        </div>

        <div className="stat">
          <p className="label">Affiliate Commission</p>
          <p className="num" style={{ color: 'var(--amber)' }}>
            {formatCurrency(referral?.commissionEarned || 0)}
          </p>
        </div>

        <div className="stat magenta">
          <p className="label">Referral Code</p>
          <p className="num" style={{ fontSize: '24px', letterSpacing: '2px', fontFamily: 'IBM Plex Mono' }}>
            {referral?.referralCode || 'INACTIVE'}
          </p>
        </div>
      </section>

      <div className="two-col-grid" style={{ marginTop: '10px' }}>
        
        {/* Booked Sessions */}
        <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="section-title" style={{ fontFamily: 'Anton', fontSize: '18px', textTransform: 'uppercase', margin: 0 }}>
              Your Session Schedule
            </h3>
            <Link to="/">
              <button className="cta text-xs" style={{ padding: '6px 12px' }}>Browse More Events</button>
            </Link>
          </div>
          
          <div className="stack" style={{ gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {activeBookings.length === 0 ? (
              <div className="text-center py-6">
                <p className="muted text-sm">You haven't booked any sessions yet.</p>
              </div>
            ) : (
              activeBookings.map(b => (
                <div key={b.id} className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>{b.eventTitle}</h4>
                    <span className="muted text-xs">Date Booked: {formatDate(b.bookingTime)}</span>
                  </div>
                  <button className="btn-secondary text-xs" style={{ padding: '6px 12px' }} onClick={() => setSelectedBooking(b)}>
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', padding: '30px', maxWidth: '500px', width: '90%', position: 'relative' }}>
              <button onClick={() => setSelectedBooking(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              <h2 style={{ fontFamily: 'Anton', textTransform: 'uppercase', marginBottom: '20px', fontSize: '24px' }}>Booking Receipt</h2>
              
              <div style={{ background: 'var(--stage)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--stage-2)', padding: '10px', display: 'inline-block', borderRadius: '8px', letterSpacing: '2px', fontFamily: 'IBM Plex Mono', fontSize: '20px', fontWeight: 'bold' }}>
                    {selectedBooking.tokenId}
                  </div>
                  <div className="muted text-xs mt-2">Scan at the Check-In Gate</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <span className="muted text-xs">Event</span>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.eventTitle}</div>
                  </div>
                  <div>
                    <span className="muted text-xs">Venue</span>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.venueName || 'Main Arena'}</div>
                  </div>
                  <div>
                    <span className="muted text-xs">Date</span>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.eventDate ? formatDate(selectedBooking.eventDate) : 'TBD'}</div>
                  </div>
                  <div>
                    <span className="muted text-xs">Time</span>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.startTime ? selectedBooking.startTime : 'TBD'}</div>
                  </div>
                  <div>
                    <span className="muted text-xs">Tickets</span>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.numberOfTickets}</div>
                  </div>
                  <div>
                    <span className="muted text-xs">Total Amount</span>
                    <div style={{ fontWeight: 600, color: 'var(--magenta)' }}>{formatCurrency(selectedBooking.totalAmount)}</div>
                  </div>
                  <div>
                    <span className="muted text-xs">Status</span>
                    <div>
                      <span className={`status-chip ${selectedBooking.bookingStatus?.toLowerCase()}`}>
                        {selectedBooking.bookingStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="muted text-xs">Payment</span>
                    <div style={{ fontWeight: 600 }}>{selectedBooking.paymentStatus}</div>
                  </div>
                </div>
              </div>
              
              <p className="muted text-sm text-center">
                Please present this receipt or your Token ID at the venue entrance.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Action Console */}
        <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
          <h3 className="section-title" style={{ fontFamily: 'Anton', fontSize: '18px', textTransform: 'uppercase' }}>
            Attendee Fast-Link Hub
          </h3>
          
          <div className="stack" style={{ gap: '14px' }}>
            <Link to="/dashboard/engagement" className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', cursor: 'pointer', transition: 'border-color 0.2s ease', textDecoration: 'none' }}>
              <div className="flex gap-3" style={{ alignItems: 'center' }}>
                <div className="avatar" style={{ background: 'rgba(255, 61, 122, 0.1)', color: 'var(--magenta)' }}>
                  <Tv size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Live Engagement Room</h4>
                  <span className="muted text-xs">Join session live streams, polls, Q&A boards, and word clouds.</span>
                </div>
              </div>
            </Link>

            <Link to="/dashboard/venue-map" className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', cursor: 'pointer', transition: 'border-color 0.2s ease', textDecoration: 'none' }}>
              <div className="flex gap-3" style={{ alignItems: 'center' }}>
                <div className="avatar" style={{ background: 'rgba(255, 184, 77, 0.1)', color: 'var(--amber)' }}>
                  <Compass size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Interactive Wayfinder</h4>
                  <span className="muted text-xs">Check expo floor layout, heatmaps, and tap sponsor badges.</span>
                </div>
              </div>
            </Link>

            <Link to="/dashboard/marketplace" className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', cursor: 'pointer', transition: 'border-color 0.2s ease', textDecoration: 'none' }}>
              <div className="flex gap-3" style={{ alignItems: 'center' }}>
                <div className="avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <Award size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Affiliate Earnings Console</h4>
                  <span className="muted text-xs">Generate codes and track custom link commissions.</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
