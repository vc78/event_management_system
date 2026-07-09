import { useState } from 'react';
import GradientButton from '../common/GradientButton.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function BookingForm({ event, onSubmit, isSubmitting = false, currentUserId }) {
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  
  const ticketPrice = event?.ticketPrice || 0;
  const availableSeats = event?.availableSeats || 0;
  const maxTickets = Math.min(10, availableSeats); // Limit to 10 tickets per booking
  
  const total = ticketPrice * numberOfTickets;

  const submit = (e) => {
    e.preventDefault();
    if (numberOfTickets < 1 || numberOfTickets > maxTickets) {
      alert(`You can only book between 1 and ${maxTickets} tickets.`);
      return;
    }
    onSubmit({
      userId: currentUserId,
      eventId: event.id,
      numberOfTickets
    });
  };

  return (
    <form onSubmit={submit} className="stack">
      <div>
        <label className="label-text">Number of Tickets</label>
        <input 
          className="input-field" 
          type="number" 
          min="1" 
          max={maxTickets} 
          value={numberOfTickets} 
          onChange={(e) => setFormValue(Number(e.target.value))}
        />
        <span className="muted text-xs mt-2" style={{ display: 'block', marginTop: '6px' }}>
          Available seats: {availableSeats} (Max {maxTickets} per order)
        </span>
      </div>
      
      <div className="stat-card">
        <strong>{formatCurrency(total)}</strong>
        <span>Total Price ({numberOfTickets} × {formatCurrency(ticketPrice)})</span>
      </div>
      
      <GradientButton fullWidth isLoading={isSubmitting} type="submit">
        Confirm Booking
      </GradientButton>
    </form>
  );

  function setFormValue(val) {
    if (val < 1) {
      setNumberOfTickets(1);
    } else if (val > maxTickets) {
      setNumberOfTickets(maxTickets);
    } else {
      setNumberOfTickets(val);
    }
  }
}
