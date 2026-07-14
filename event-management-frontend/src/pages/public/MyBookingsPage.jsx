import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import * as bookingApi from '../../api/bookingApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { useRealtimeBookings } from '../../hooks/useRealtime.js';
import QRCode from 'qrcode';

/* ── Status badge helper ─────────────────────────────────────── */
const STATUS_META = {
  CONFIRMED: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '✔' },
  CANCELLED:  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '✕' },
  CANCELED:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '✕' },
  PENDING:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '⏳' },
};

function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: m.bg, border: `1px solid ${m.border}`, borderRadius: 999,
      padding: '3px 12px', fontSize: 11, fontWeight: 700,
      color: m.color, letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>
      {m.icon} {status}
    </span>
  );
}

/* ── Booking Card ────────────────────────────────────────────── */
function BookingCard({ booking: b, onViewDetails, onCancel }) {
  const isCancelled = b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'CANCELED';

  return (
    <div className="bk-card" style={{ opacity: isCancelled ? 0.65 : 1 }}>
      {/* Image header */}
      <div className="bk-card-img">
        <img
          src={`https://picsum.photos/seed/${b.eventId || b.id}/700/300`}
          alt={b.eventTitle}
          draggable={false}
        />
        <div className="bk-card-img-overlay" />
        {/* Category badge */}
        <div className="bk-card-category">{b.categoryName || '🎟️ Event'}</div>
        {/* Status ribbon */}
        <div className="bk-card-status-ribbon">
          <StatusChip status={b.bookingStatus} />
        </div>
      </div>

      {/* Body */}
      <div className="bk-card-body">
        <h3 className="bk-card-title">{b.eventTitle}</h3>

        {/* Meta grid */}
        <div className="bk-meta-grid">
          <div className="bk-meta-item">
            <span className="bk-meta-label">🎫 Tickets</span>
            <span className="bk-meta-val">{b.numberOfTickets}</span>
          </div>
          <div className="bk-meta-item">
            <span className="bk-meta-label">📅 Booked</span>
            <span className="bk-meta-val">{formatDate(b.bookingTime)}</span>
          </div>
          <div className="bk-meta-item bk-meta-item--full">
            <span className="bk-meta-label">🔑 Token ID</span>
            <code className="bk-token">{b.tokenId || '—'}</code>
          </div>
          <div className="bk-meta-item">
            <span className="bk-meta-label">💳 Payment</span>
            <span className="bk-meta-val" style={{ color: b.paymentStatus === 'PAID' ? '#10B981' : '#F59E0B' }}>
              {b.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bk-card-footer">
        <div className="bk-price">{formatCurrency(b.totalAmount || 0)}</div>
        <div className="bk-actions">
          <button className="bk-btn-view" onClick={() => onViewDetails(b)}>
            View Details
          </button>
          {!isCancelled ? (
            <button className="bk-btn-cancel" onClick={() => onCancel(b.id)}>
              Cancel
            </button>
          ) : (
            <span className="bk-cancelled-label">Cancelled</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Receipt Modal ────────────────────────────────────────────── */
function ReceiptModal({ booking: b, qrCodeUrl, onClose }) {
  if (!b) return null;
  return (
    <div className="bk-modal-overlay" onClick={onClose}>
      <div className="bk-modal" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="bk-modal-header">
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#4F46E5', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>EVENTzaa Receipt</div>
            <h2 className="bk-modal-title">Booking Confirmation</h2>
          </div>
          <button className="bk-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Token display */}
        <div className="bk-modal-token-block">
          <div className="bk-modal-token-label">Entry Token ID</div>
          <div className="bk-modal-token">{b.tokenId}</div>
          <div className="bk-modal-token-sub">Present at venue check-in gate</div>
          {/* Barcode decoration */}
          <div className="bk-modal-barcode" aria-hidden />
        </div>

        {/* Details grid */}
        <div className="bk-modal-grid">
          {[
            { label: 'Event',   value: b.eventTitle },
            { label: 'Venue',   value: b.venueName || 'Main Arena' },
            { label: 'Date',    value: b.eventDate ? formatDate(b.eventDate) : 'TBD' },
            { label: 'Time',    value: b.startTime || 'TBD' },
            { label: 'Tickets', value: b.numberOfTickets },
            { label: 'Amount',  value: formatCurrency(b.totalAmount), highlight: true },
            { label: 'Status',  value: <StatusChip status={b.bookingStatus} /> },
            { label: 'Payment', value: b.paymentStatus },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="bk-modal-field">
              <span className="bk-modal-field-label">{label}</span>
              <span className="bk-modal-field-value" style={highlight ? { color: '#10B981', fontWeight: 700 } : {}}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* QR Code preview in modal */}
        {b.bookingStatus === 'CONFIRMED' && qrCodeUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 28px', padding: '16px 12px', background: 'rgba(79,70,229,0.06)', borderRadius: '12px', border: '1px solid rgba(79,70,229,0.18)' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#4F46E5', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.12em' }}>🔲 Scan QR at Entrance</span>
            <img src={qrCodeUrl} alt="Ticket QR Code" style={{ background: '#fff', padding: '10px', borderRadius: '8px', display: 'block' }} width="140" height="140" />
            <span style={{ marginTop: '10px', fontSize: '11px', color: 'var(--ash)', textAlign: 'center', lineHeight: 1.4 }}>Present at entrance gate for wristband check-in.</span>
          </div>
        )}

        {b.bookingStatus === 'CONFIRMED' && (
          <div style={{ padding: '0 28px 4px' }}>
            <button
              className="hp-btn-primary"
              onClick={() => window.print()}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '13px 16px', borderRadius: '12px' }}
            >
              🖨️ Print Ticket
            </button>
          </div>
        )}

        <p className="bk-modal-note">
          This is your official booking receipt. Keep your Token ID safe — it is required at the entry gate.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function MyBookingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Generate QR code when selected booking changes
  // Encode tokenId (secure, opaque) — fall back to id string for legacy seed bookings
  useEffect(() => {
    if (selectedBooking && selectedBooking.bookingStatus === 'CONFIRMED') {
      const qrPayload = selectedBooking.tokenId || selectedBooking.id.toString();
      QRCode.toDataURL(qrPayload, { width: 250, margin: 2 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    } else {
      setQrCodeUrl('');
    }
  }, [selectedBooking]);

  // D07 GUARD: If auth state is corrupted (user exists but has no id),
  // redirect to login via useEffect — never call navigate() during render.
  useEffect(() => {
    if (user !== null && !user?.id) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const { data: bookings = [], isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: () => bookingApi.getBookingsByUser(user.id),
    enabled: !!user?.id,
  });

  useRealtimeBookings(user?.id);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries(['bookings', 'mine']);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    }
  };

  /* Stats derived from bookings */
  const confirmedCount = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
  const totalSpent = bookings
    .filter(b => b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'CANCELED')
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const ticketsCount = bookings
    .filter(b => b.bookingStatus !== 'CANCELLED')
    .reduce((s, b) => s + (b.numberOfTickets || 0), 0);


  return (
    <div className="bk-root">
      {/* Aurora */}
      <div className="bk-aurora" aria-hidden>
        <div className="aurora-orb" style={{ width: 600, height: 600, top: '-150px', left: '-200px', background: 'radial-gradient(circle, rgba(79,70,229,0.28) 0%, transparent 70%)' }} />
        <div className="aurora-orb" style={{ width: 400, height: 400, top: '200px', right: '-100px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="bk-container">
        {/* Page header */}
        <div className="bk-page-header">
          <div>
            <div className="bk-page-eyebrow">
              <span className="hp-eyebrow-dot" />
              My Account
            </div>
            <h1 className="bk-page-title">My Bookings</h1>
            <p className="bk-page-sub">All your reservations and tickets in one place.</p>
          </div>

          {/* Stats summary */}
          {bookings.length > 0 && (
            <div className="bk-stats-row">
              <div className="bk-stat">
                <div className="bk-stat-num">{confirmedCount}</div>
                <div className="bk-stat-label">Confirmed</div>
              </div>
              <div className="bk-stat-divider" />
              <div className="bk-stat">
                <div className="bk-stat-num">{ticketsCount}</div>
                <div className="bk-stat-label">Tickets</div>
              </div>
              <div className="bk-stat-divider" />
              <div className="bk-stat">
                <div className="bk-stat-num" style={{ color: '#10B981' }}>{formatCurrency(totalSpent)}</div>
                <div className="bk-stat-label">Total Spent</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner label="Retrieving your bookings..." />
        ) : isError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <p style={{ color: '#EF4444' }}>Failed to load: {error?.message}</p>
            <button onClick={() => refetch()} className="hp-btn-primary">Retry</button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 60 }}>
            <EmptyState title="No bookings yet" description="Reserve a seat at an event and it will appear here." />
            <Link to="/" className="hp-btn-primary">🎟️ Explore Events</Link>
          </div>
        ) : (
          <div className="bk-grid">
            {bookings.map(b => (
              <BookingCard
                key={b.id}
                booking={b}
                onViewDetails={setSelectedBooking}
                onCancel={handleCancelBooking}
              />
            ))}
          </div>
        )}
      </div>

      {/* Receipt modal */}
      <ReceiptModal booking={selectedBooking} qrCodeUrl={qrCodeUrl} onClose={() => setSelectedBooking(null)} />

      {/* Printable Ticket Container */}
      {selectedBooking && selectedBooking.bookingStatus === 'CONFIRMED' && (
        <div id="printable-ticket">
          <div className="ticket-print-header">EVENTzaa OFFICIAL TICKET</div>
          <div className="ticket-print-body">
            <h2>{selectedBooking.eventTitle}</h2>
            <div className="ticket-print-meta">
              <div>
                <strong>Attendee</strong>
                <span>{selectedBooking.userName || 'Attendee'}</span>
              </div>
              <div>
                <strong>Ticket ID</strong>
                <span>#{selectedBooking.id}</span>
              </div>
              <div>
                <strong>Token ID</strong>
                <span>{selectedBooking.tokenId}</span>
              </div>
              <div>
                <strong>Venue</strong>
                <span>{selectedBooking.venueName || 'Main Arena'}</span>
              </div>
              <div>
                <strong>Date</strong>
                <span>{selectedBooking.eventDate ? formatDate(selectedBooking.eventDate) : 'TBD'}</span>
              </div>
              <div>
                <strong>Time</strong>
                <span>{selectedBooking.startTime || 'TBD'}</span>
              </div>
              <div>
                <strong>Tickets</strong>
                <span>{selectedBooking.numberOfTickets} seats</span>
              </div>
              <div>
                <strong>Status</strong>
                <span>{selectedBooking.bookingStatus}</span>
              </div>
            </div>
            {qrCodeUrl && (
              <div className="ticket-print-qrcode">
                <img src={qrCodeUrl} alt="QR Code" width="200" height="200" />
              </div>
            )}
            <div className="ticket-print-instructions">
              <p>IMPORTANT: Present this QR code at the entrance for wristband check-in verification.</p>
              <p>Each QR code is unique and can only be scanned once. Do not share this ticket.</p>
            </div>
          </div>
        </div>
      )}

      {/* Embedded print-specific CSS */}
      <style>{`
        @media print {
          /* Hide all body elements */
          body * {
            visibility: hidden !important;
          }
          /* Show only the printable ticket and its children */
          #printable-ticket, #printable-ticket * {
            visibility: visible !important;
          }
          #printable-ticket {
            position: absolute !important;
            left: 50% !important;
            top: 40px !important;
            transform: translateX(-50%) !important;
            width: 90% !important;
            max-width: 480px !important;
            padding: 24px !important;
            border: 2px dashed #000 !important;
            border-radius: 12px !important;
            background: #fff !important;
            color: #000 !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .ticket-print-header {
            font-size: 20px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            border-bottom: 2px solid #000 !important;
            padding-bottom: 8px !important;
            margin-bottom: 16px !important;
            width: 100% !important;
            text-align: center !important;
            color: #000 !important;
          }
          .ticket-print-body {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .ticket-print-body h2 {
            font-size: 18px !important;
            font-weight: 700 !important;
            margin: 0 0 16px 0 !important;
            text-align: center !important;
            color: #000 !important;
          }
          .ticket-print-meta {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
            font-size: 13px !important;
            border-bottom: 1px solid #ddd !important;
            padding-bottom: 12px !important;
          }
          .ticket-print-meta div {
            display: flex !important;
            flex-direction: column !important;
          }
          .ticket-print-meta div strong {
            font-size: 10px !important;
            text-transform: uppercase !important;
            color: #555 !important;
            margin-bottom: 2px !important;
          }
          .ticket-print-meta div span {
            color: #000 !important;
            font-weight: 500 !important;
          }
          .ticket-print-qrcode {
            margin: 12px 0 !important;
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
          }
          .ticket-print-qrcode img {
            border: 1px solid #ccc !important;
            padding: 8px !important;
            background: #fff !important;
          }
          .ticket-print-instructions {
            text-align: center !important;
            font-size: 11px !important;
            color: #333 !important;
            line-height: 1.4 !important;
            margin-top: 8px !important;
            border-top: 1px dashed #ccc !important;
            padding-top: 12px !important;
            width: 100% !important;
          }
        }

        @media screen {
          #printable-ticket {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
