import { useEffect, useState } from 'react';
import * as eventApi from '../../api/eventApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function Marquee() {
  const [items, setItems] = useState([
    "EVENT CONTROL ROOM LIVE",
    "CONNECTING TO DATABASE...",
    "SECURE CHECKOUT ENGAGED"
  ]);

  useEffect(() => {
    Promise.all([
      eventApi.getEvents().catch(() => []),
      bookingApi.getBookings().catch(() => [])
    ]).then(([events, bookings]) => {
      const liveEvents = events.filter(e => e.eventStatus === 'PUBLISHED' || e.eventStatus === 'LIVE').length;
      const ticketsSold = bookings
        .filter(b => b.bookingStatus !== 'CANCELLED')
        .reduce((sum, b) => sum + (b.numberOfTickets || 0), 0);
      const revenue = bookings
        .filter(b => b.bookingStatus !== 'CANCELLED')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      const formattedRevenue = formatCurrency(revenue).toUpperCase();
      
      setItems([
        `${liveEvents} EVENTS ACTIVE NOW`,
        `${ticketsSold} TICKETS CONFIRMED`,
        `${formattedRevenue} REVENUE ACCUMULATED`,
        "EVENT CONTROL ROOM — SYSTEM STATUS OPERATIONAL"
      ]);
    });
  }, []);

  const line = items.map(t => `${t}`).join('   ◆   ');

  return (
    <div className="marquee-container">
      <div className="marquee-fade-left"></div>
      <div className="marquee">
        <div className="marquee-track">
          <span>◆ {line} ◆</span>
          <span>   ◆ {line} ◆</span>
          <span>   ◆ {line} ◆</span>
        </div>
      </div>
      <div className="marquee-fade-right"></div>
    </div>
  );
}
