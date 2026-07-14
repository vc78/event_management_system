import { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Minus, Plus, Ticket } from 'lucide-react';

/* ─── Ticket quantity stepper + live price + inline validation ─── */
export default function BookingForm({ event, onSubmit, isSubmitting = false, currentUserId }) {
  const [qty, setQty] = useState(1);
  const [touched, setTouched] = useState(false);

  const ticketPrice = event?.ticketPrice  ?? 0;
  const availSeats  = event?.availableSeats ?? 0;
  const maxPerOrder = Math.min(10, availSeats);
  const total       = ticketPrice * qty;

  const error =
    touched && qty < 1            ? 'Minimum 1 ticket required.'
    : touched && qty > maxPerOrder ? `Only ${maxPerOrder} ticket${maxPerOrder !== 1 ? 's' : ''} per order.`
    : null;

  const handleChange = (raw) => {
    setTouched(true);
    const n = parseInt(raw, 10);
    setQty(isNaN(n) ? 1 : n);
  };

  const step = (delta) => {
    setTouched(true);
    setQty(prev => Math.max(1, Math.min(maxPerOrder, prev + delta)));
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (qty < 1 || qty > maxPerOrder) return;
    onSubmit({ userId: currentUserId, eventId: event.id, numberOfTickets: qty });
  };

  const disabled = isSubmitting || availSeats === 0;

  return (
    <form onSubmit={submit} className="bf-root">

      {/* ── Price header ── */}
      <div className="bf-price-header">
        <div className="bf-price-left">
          <span className="bf-price-label">Ticket Price</span>
          <span className="bf-price-amount">
            {formatCurrency(ticketPrice)}
            <span className="bf-price-each"> / person</span>
          </span>
        </div>
        <div className={`bf-seats-pill${availSeats <= 5 ? ' bf-seats-pill--low' : ''}`}>
          {availSeats <= 0 ? 'Sold Out' : `${availSeats} left`}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="bf-divider" />

      {/* ── Quantity stepper ── */}
      <div className="bf-qty-group">
        <label className="bf-label">Number of Tickets</label>
        <div className="bf-qty-row">
          <button
            type="button"
            className="bf-qty-btn"
            onClick={() => step(-1)}
            disabled={disabled || qty <= 1}
            aria-label="Decrease"
          >
            <Minus size={14} />
          </button>
          <input
            className={`bf-qty-input${error ? ' bf-qty-input--error' : ''}`}
            type="number"
            min={1}
            max={maxPerOrder}
            value={qty}
            onChange={e => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={disabled}
            aria-label="Ticket quantity"
          />
          <button
            type="button"
            className="bf-qty-btn"
            onClick={() => step(1)}
            disabled={disabled || qty >= maxPerOrder}
            aria-label="Increase"
          >
            <Plus size={14} />
          </button>
        </div>
        {error
          ? <p className="bf-error-msg">{error}</p>
          : <p className="bf-hint">Max {maxPerOrder} per order</p>
        }
      </div>

      {/* ── Live price breakdown ── */}
      <div className="bf-total-card">
        <div className="bf-total-row">
          <span className="bf-total-label">{qty} × {formatCurrency(ticketPrice)}</span>
          <span className="bf-total-amount">{formatCurrency(total)}</span>
        </div>
        <div className="bf-total-taxes">Taxes &amp; fees included</div>
      </div>

      {/* ── Sold out banner ── */}
      {availSeats === 0 && (
        <div className="bf-soldout-banner">🎟️ This event is sold out</div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        className="bf-submit-btn"
        disabled={disabled || !!error}
      >
        {isSubmitting
          ? <span className="bf-spinner" aria-label="Confirming..." />
          : <><Ticket size={16} /> Confirm Booking</>
        }
      </button>
    </form>
  );
}
