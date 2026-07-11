import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as bookingApi from '../../api/bookingApi.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { exportToCSV } from '../../utils/csvExport.js';
import { Download } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function BookingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: bookingApi.getBookings
  });

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will refund tickets and free up the seats.')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['bookings', 'all']);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // Export spreadsheet
  const handleExportBookings = () => {
    if (!bookings.length) return;
    const clean = bookings.map(b => ({
      BookingId: b.id,
      AttendeeName: b.userName || `User #${b.userId}`,
      AttendeeEmail: b.userEmail,
      EventTitle: b.eventTitle,
      TicketsBooked: b.numberOfTickets,
      TotalAmountPaid: b.totalAmount,
      BookingDate: b.bookingTime,
      TokenId: b.tokenId,
      Status: b.bookingStatus
    }));
    exportToCSV(clean, 'Bookings_Telemetry_Report.csv');
    toast.success('Booking spreadsheet exported successfully!');
  };

  if (loading) return <LoadingSpinner label="Loading bookings..." />;
  if (isError) return (
    <div className="center-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
      <p className="text-danger">Failed to load bookings: {error?.message}</p>
      <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
    </div>
  );

  return (
    <div>
      <div className="header-actions">
        <div>
          <h1 className="page-title">Manage Bookings</h1>
          <p className="muted">Review, monitor, and cancel user reservations.</p>
        </div>
        <button className="btn-secondary" onClick={handleExportBookings}>
          <Download size={16} /> Export to Excel
        </button>
      </div>

      {/* D04: Desktop table — hidden on mobile */}
      <div className="hidden-mobile table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Customer</th>
              <th>Event Title</th>
              <th>Tickets</th>
              <th>Total Amount</th>
              <th>Booking Date</th>
              <th>Token ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.userName || `User #${b.userId}`}</div>
                  <div className="muted text-xs">{b.userEmail}</div>
                </td>
                <td style={{ fontWeight: 500 }}>{b.eventTitle}</td>
                <td>{b.numberOfTickets} seats</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(b.totalAmount || 0)}</td>
                <td>{formatDate(b.bookingTime)}</td>
                <td><code style={{ fontSize: '11px', background: 'var(--stage-2)', padding: '2px 4px' }}>{b.tokenId || 'N/A'}</code></td>
                <td>
                  <span className={`status-chip ${b.bookingStatus?.toLowerCase()}`}>
                    {b.bookingStatus}
                  </span>
                </td>
                <td>
                  {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'CANCELED' ? (
                    <button 
                      className="btn-danger" 
                      onClick={() => handleCancelBooking(b.id)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  ) : (
                    <span className="muted text-xs">Cancelled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* D04: Mobile card list — shown only below md */}
      <div className="mobile-cards">
        {bookings.map((b) => (
          <div key={b.id} className="mobile-card">
            <div className="mobile-card-header">
              <div>
                <div className="mobile-card-title">{b.userName || `User #${b.userId}`}</div>
                <div className="mobile-card-sub">{b.userEmail}</div>
              </div>
              <span className={`status-chip ${b.bookingStatus?.toLowerCase()}`}>{b.bookingStatus}</span>
            </div>
            <div className="mobile-card-body">
              <span style={{ fontWeight: 600, fontSize: 13 }}>{b.eventTitle}</span>
              <span style={{ color: 'var(--ash)', fontSize: 12 }}>🎫 {b.numberOfTickets} seats · {formatCurrency(b.totalAmount || 0)}</span>
              <span style={{ color: 'var(--ash)', fontSize: 12 }}>📅 {formatDate(b.bookingTime)}</span>
              {b.tokenId && <code style={{ fontSize: 11, background: 'var(--stage-2)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>{b.tokenId}</code>}
            </div>
            <div className="mobile-card-actions">
              {b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'CANCELED' ? (
                <button
                  className="mobile-action-btn danger"
                  style={{ width: '100%' }}
                  onClick={() => handleCancelBooking(b.id)}
                >
                  Cancel Booking
                </button>
              ) : (
                <span className="muted text-xs" style={{ padding: '10px 0', display: 'block', textAlign: 'center' }}>Booking Cancelled</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
