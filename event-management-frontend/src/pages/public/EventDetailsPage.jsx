import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import EventDetailsCard from '../../components/event/EventDetailsCard.jsx';
import BookingForm from '../../components/forms/BookingForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import * as eventApi from '../../api/eventApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import * as paymentApi from '../../api/paymentApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { useRealtimeEvent } from '../../hooks/useRealtime.js';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const { data: event, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['events', id],
    queryFn: () => eventApi.getEventById(id),
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
      const response = await paymentApi.createOrder({ ...payload, userId: user.id });

      const options = {
        key: response.razorpayKeyId,
        amount: response.amount,
        currency: response.currency,
        order_id: response.razorpayOrderId,
        name: 'EVENTzaa',
        description: `Booking for ${event?.eventTitle || 'Event'}`,
        handler: async (rzpResponse) => {
          setSubmitting(true);
          try {
            await paymentApi.verifyPayment({
              bookingId: response.bookingId,
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature: rzpResponse.razorpay_signature,
            });
            toast.success('Payment successful & tickets reserved!');
            navigate('/my-bookings');
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Payment verification failed');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.warning('Payment was cancelled. You can review pending bookings in My Bookings.');
            navigate('/my-bookings');
          },
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not initiate booking payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen label="Loading event details..." />;

  if (isError) return (
    <div className="edp-error">
      <p className="edp-error-msg">Failed to load event: {error?.message}</p>
      <button onClick={() => refetch()} className="edp-retry-btn">Try Again</button>
    </div>
  );

  if (!event) return (
    <div className="edp-error">
      <p className="edp-error-msg">Event not found.</p>
      <button onClick={() => navigate('/')} className="edp-retry-btn">Go Home</button>
    </div>
  );

  return (
    <div className="edp-root">
      {/*
        D09 layout note: booking panel is first in DOM for mobile scroll,
        CSS `order` property swaps it visually to the right column on desktop.
      */}
      <div className="edp-layout">

        {/* ── Right: Booking panel (DOM-first) ── */}
        <aside className="edp-booking-panel">
          <div className="edp-booking-card">
            <h2 className="edp-booking-heading">Reserve your seat</h2>

            {(event.availableSeats ?? 0) <= 0 ? (
              <div className="edp-soldout-card">
                <span className="edp-soldout-icon">🎟️</span>
                <strong>SOLD OUT</strong>
                <p>All seats for this event are fully booked.</p>
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
              <p className="edp-auth-hint">
                You will be prompted to sign in before checkout.
              </p>
            )}
          </div>
        </aside>

        {/* ── Left: Event details ── */}
        <main className="edp-details">
          <EventDetailsCard event={event} />
        </main>

      </div>
    </div>
  );
}
