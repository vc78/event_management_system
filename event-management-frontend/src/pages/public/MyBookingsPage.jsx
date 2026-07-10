import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppLogo from '../../components/common/AppLogo.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import GradientButton from '../../components/common/GradientButton.jsx';
import * as bookingApi from '../../api/bookingApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { useRealtimeBookings } from '../../hooks/useRealtime.js';

export default function MyBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings = [], isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: () => bookingApi.getBookingsByUser(user.id),
    enabled: !!user?.id
  });

  useRealtimeBookings(user?.id);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['bookings', 'mine']); // Refresh bookings
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <header className="topbar">
          <AppLogo />
          <Link to="/" className="top-link">Back to events</Link>
        </header>
        <div className="container py-10">
          <EmptyState 
            title="Authentication Required" 
            description="Please sign in to view and manage your bookings."
          />
          <div className="flex justify-center mt-6" style={{ display: 'flex', justifyContent: 'center' }}>
            <Link to="/login">
              <GradientButton>Sign In Now</GradientButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="topbar">
        <AppLogo />
        <div className="flex gap-3">
          <Link to="/" className="top-link align-center" style={{ display: 'flex', alignItems: 'center' }}>
            Browse Events
          </Link>
          {user?.role === 'ADMIN' || user?.role === 'ORGANIZER' ? (
            <Link to="/dashboard">
              <GradientButton>Dashboard</GradientButton>
            </Link>
          ) : null}
        </div>
      </header>
      
      <div className="container py-10">
        <h1 className="page-title">My bookings</h1>
        <p className="muted mb-6">All your reservations in one place.</p>
        
        {loading ? (
          <LoadingSpinner label="Retrieving your bookings..." />
        ) : isError ? (
          <div className="center-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
            <p className="text-danger">Failed to load bookings: {error?.message}</p>
            <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState 
            title="No bookings yet" 
            description="Reserve a seat at an event and it will appear here."
          />
        ) : (
          <div className="tickets">
            {bookings.map((b) => (
              <div key={b.id} className="event-card-modern">
                <div className="event-card-image">
                  <div className="event-card-category-badge badge">{b.categoryName || 'Event'}</div>
                  <img src={`https://picsum.photos/seed/${b.eventId || b.id}/600/400`} alt={b.eventTitle} />
                  <div className="event-card-image-overlay"></div>
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">{b.eventTitle}</h3>
                  <div className="event-card-meta">
                    <span>
                      <strong>Tickets:</strong> {b.numberOfTickets}
                    </span>
                    <span>
                      <strong>Date Booked:</strong> {formatDate(b.bookingTime)}
                    </span>
                    {b.tokenId && (
                      <span style={{ display: 'block', width: '100%', marginTop: '6px' }}>
                        <strong>Token ID:</strong> <code style={{ background: 'var(--stage-2)', padding: '2px 6px', borderRadius: '4px' }}>{b.tokenId}</code>
                      </span>
                    )}
                  </div>
                  
                  <div className="event-card-capacity-bar">
                    <div className="event-card-capacity-label">
                      <span>Status: <span className={`status-chip ${b.bookingStatus?.toLowerCase()}`}>{b.bookingStatus}</span></span>
                      <span>Payment: {b.paymentStatus}</span>
                    </div>
                  </div>
                  
                  <div className="event-card-footer">
                    <div className="event-card-price">
                      {formatCurrency(b.totalAmount || 0)}
                    </div>
                    {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'CANCELED' ? (
                      <div className="flex gap-2">
                        <button 
                          className="btn-secondary"
                          onClick={() => setSelectedBooking(b)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          className="btn-secondary"
                          onClick={() => setSelectedBooking(b)}
                        >
                          View Details
                        </button>
                        <span className="muted text-sm" style={{ padding: '10px 16px' }}>Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}
