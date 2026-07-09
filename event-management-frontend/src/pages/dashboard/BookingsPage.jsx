import { useEffect, useState } from 'react';
import * as bookingApi from '../../api/bookingApi.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { exportToCSV } from '../../utils/csvExport.js';
import { Download } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function BookingsPage() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getBookings();
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will refund tickets and free up the seats.')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
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
      Status: b.bookingStatus
    }));
    exportToCSV(clean, 'Bookings_Telemetry_Report.csv');
    toast.success('Booking spreadsheet exported successfully!');
  };

  if (loading) return <LoadingSpinner label="Loading bookings..." />;

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

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Customer</th>
              <th>Event Title</th>
              <th>Tickets</th>
              <th>Total Amount</th>
              <th>Booking Date</th>
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
    </div>
  );
}
