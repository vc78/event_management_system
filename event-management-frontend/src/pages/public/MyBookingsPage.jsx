import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLogo from '../../components/common/AppLogo.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import GradientButton from '../../components/common/GradientButton.jsx';
import * as bookingApi from '../../api/bookingApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function MyBookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await bookingApi.getBookingsByUser(user.id);
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh bookings
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
                      <button 
                        className="btn-danger"
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <span className="muted text-sm" style={{ padding: '10px 16px' }}>Cancelled</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
