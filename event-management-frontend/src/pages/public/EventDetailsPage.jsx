import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import EventDetailsCard from '../../components/event/EventDetailsCard.jsx';
import BookingForm from '../../components/forms/BookingForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import * as eventApi from '../../api/eventApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { useRealtimeEvent } from '../../hooks/useRealtime.js';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [submitting, setSubmitting] = useState(false);

  const { data: event, isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['events', id],
    queryFn: () => eventApi.getEventById(id)
  });

  useRealtimeEvent(id);

  const handleBooking = async (payload) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to reserve your tickets');
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    
    setSubmitting(true);
    try {
      // Inject current user ID to ensure booking is created for the logged-in user
      await bookingApi.createBooking({
        ...payload,
        userId: user.id
      });
      toast.success('Tickets reserved successfully!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not complete booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading event details..." />;
  if (isError) return (
    <div className="center-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
      <p className="text-danger">Error loading event: {error?.message}</p>
      <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
    </div>
  );
  if (!event) return <div className="center-screen">Event not found</div>;

  return (
    <div>
      {/* D09: Booking panel is DOM-first so mobile users see CTA immediately.
              CSS order property restores visual order on lg+. */}
      <div className="container details-layout">
        <div className="card p-6 details-booking-panel" style={{ height: 'fit-content' }}>
          <h2 className="section-title">Reserve your seat</h2>
          {event.availableSeats <= 0 ? (
            <div className="stat-card" style={{ border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <strong style={{ color: 'var(--danger)' }}>SOLD OUT</strong>
              <span>All seats for this event are fully booked.</span>
            </div>
          ) : (
            <BookingForm
              event={event}
              onSubmit={handleBooking}
              isSubmitting={submitting}
              currentUserId={user?.id || 0}
            />
          )}
          {!isAuthenticated && (
            <p className="muted mt-4 text-xs text-center" style={{ textAlign: 'center' }}>
              You will be prompted to sign in before final checkout.
            </p>
          )}
        </div>

        <EventDetailsCard event={event} />
      </div>
    </div>
  );
}
