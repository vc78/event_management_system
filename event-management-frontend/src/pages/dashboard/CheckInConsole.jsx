import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import * as bookingApi from '../../api/bookingApi.js';
import * as eventApi from '../../api/eventApi.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import {
  ShieldAlert, UserCheck, ShieldCheck, Search, AlertTriangle,
  QrCode, ScanLine, StopCircle, CheckCircle2, XCircle
} from 'lucide-react';

/* ─── tiny inline styles ──────────────────────────────────────────────── */
const PANEL = { background: 'var(--stage-2)', borderRadius: 18, padding: 24 };
const CARD  = { background: 'var(--stage)',   borderRadius: 14, padding: 16, border: '1px solid var(--line)' };

/* ─── Tab selector ────────────────────────────────────────────────────── */
function ModeTab({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '11px 0',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: '0.04em',
        transition: 'all 0.2s',
        background: active ? 'var(--accent, #4F46E5)' : 'transparent',
        color: active ? '#fff' : 'var(--ash)',
        boxShadow: active ? '0 4px 14px rgba(79,70,229,0.35)' : 'none',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

/* ─── Ticket stub display ─────────────────────────────────────────────── */
function TicketStub({ booking, zones, capacityPct, showCapacityAlert, onCheckIn, onClear }) {
  const isCheckedIn = booking.checkedIn;
  const isDuplicate = booking.duplicateScan;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* DUPLICATE SCAN ALARM */}
      {isDuplicate && (
        <div style={{ border: '2px solid var(--magenta)', background: 'rgba(255,61,122,0.06)', borderRadius: 14, padding: 16, animation: 'pulse 1s infinite' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--magenta)', fontWeight: 'bold', fontSize: 16 }}>
            <AlertTriangle size={22} /> SECURITY ALERT: DUPLICATE QR SCAN!
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ash)' }}>
            This ticket has already been checked in. Verify attendee credentials physically.
          </p>
        </div>
      )}

      {/* CAPACITY ALARM */}
      {showCapacityAlert && (
        <div style={{ border: '2px solid var(--amber)', background: 'rgba(255,184,77,0.06)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--amber)', fontWeight: 'bold', fontSize: 16 }}>
            <ShieldAlert size={22} /> ROOM CAPACITY LIMIT REACHED!
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ash)' }}>
            This session is at <strong>{capacityPct}% capacity</strong>. Redirect overflow attendees to the secondary hall.
          </p>
        </div>
      )}

      {/* TICKET STUB */}
      <div style={{ background: 'var(--paper)', color: 'var(--ink)', borderRadius: 18, padding: 24, position: 'relative' }}>
        <span style={{
          position: 'absolute', top: 18, right: 18,
          padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          background: isCheckedIn ? 'rgba(16,185,129,0.15)' : 'rgba(79,70,229,0.15)',
          color: isCheckedIn ? '#10B981' : '#4F46E5',
          border: `1px solid ${isCheckedIn ? 'rgba(16,185,129,0.3)' : 'rgba(79,70,229,0.3)'}`,
        }}>
          {isCheckedIn ? '✔ Checked In' : '⬤ Valid Ticket'}
        </span>

        <div style={{ fontSize: 11, color: 'var(--magenta)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          Ticket #{booking.id}{booking.tokenId ? ` · Token: ${booking.tokenId}` : ''}
        </div>
        <h2 style={{ fontFamily: 'Poppins', fontSize: 26, textTransform: 'uppercase', margin: '0 0 14px', color: 'var(--ink)' }}>
          {booking.userName || 'Attendee'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#555' }}>
          <span>📧 <strong>{booking.userEmail}</strong></span>
          <span>🎪 <strong>{booking.eventTitle}</strong></span>
          <span>🎫 <strong>{booking.numberOfTickets} seat{booking.numberOfTickets !== 1 ? 's' : ''}</strong></span>
        </div>

        <div className="barcode" style={{ marginTop: 20, height: 38 }} />
      </div>

      {/* ACCESS ZONES */}
      {zones.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ash)', marginBottom: 8 }}>
            Credential Zones Approved
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {zones.map(zone => (
              <span key={zone} style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: zone.includes('VIP') || zone.includes('Backstage') ? 'rgba(255,61,122,0.1)' : 'rgba(255,255,255,0.05)',
                color:      zone.includes('VIP') || zone.includes('Backstage') ? 'var(--magenta)' : 'var(--paper-dim)',
                border: '1px solid var(--line)',
              }}>
                {zone}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        <button className="btn-secondary" onClick={onClear} style={{ flex: 1 }}>
          Clear Screen
        </button>
        <button
          className="btn-primary"
          onClick={onCheckIn}
          disabled={isCheckedIn && !isDuplicate}
          style={{
            flex: 2,
            background: isCheckedIn ? 'var(--line)' : 'var(--amber)',
            color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <UserCheck size={16} /> Approve &amp; Check-In
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   QR SCANNER PANEL
   ════════════════════════════════════════════════════════════════════════ */
function QrScannerPanel({ onScanSuccess }) {
  const scannerRef = useRef(null);
  const [scanning,  setScanning]  = useState(false);
  const [scanError, setScanError] = useState('');
  const [lastScan,  setLastScan]  = useState('');
  const SCANNER_ID = 'qr-reader-viewport';

  const startScanner = useCallback(async () => {
    setScanError('');
    setLastScan('');
    try {
      const qr = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        (decodedText) => {
          setLastScan(decodedText);
          stopScanner();
          onScanSuccess(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg.toLowerCase().includes('permission')) {
        setScanError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (msg.toLowerCase().includes('no camera') || msg.toLowerCase().includes('notfound')) {
        setScanError('No camera found on this device.');
      } else {
        setScanError(`Could not start camera: ${msg}`);
      }
    }
  }, [onScanSuccess]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {}).finally(() => { scannerRef.current = null; });
    }
    setScanning(false);
  }, []);

  useEffect(() => () => stopScanner(), [stopScanner]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Viewfinder */}
      <div style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        border: `2px solid ${scanning ? '#4F46E5' : 'rgba(79,70,229,0.2)'}`,
        background: '#000',
        minHeight: scanning ? 'auto' : 240,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.3s',
      }}>
        <div id={SCANNER_ID} style={{ width: '100%' }} />

        {/* Placeholder */}
        {!scanning && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ScanLine size={52} style={{ color: 'rgba(79,70,229,0.35)' }} />
            <p style={{ margin: 0, color: '#475569', fontSize: 12 }}>Camera viewfinder will appear here</p>
          </div>
        )}

        {/* Corner guides */}
        {scanning && ['tl','tr','bl','br'].map(c => (
          <div key={c} style={{
            position: 'absolute',
            top:    c.startsWith('t') ? 10 : undefined,
            bottom: c.startsWith('b') ? 10 : undefined,
            left:   c.endsWith('l')   ? 10 : undefined,
            right:  c.endsWith('r')   ? 10 : undefined,
            width: 22, height: 22,
            borderTop:    c.startsWith('t') ? '3px solid #4F46E5' : undefined,
            borderBottom: c.startsWith('b') ? '3px solid #4F46E5' : undefined,
            borderLeft:   c.endsWith('l')   ? '3px solid #4F46E5' : undefined,
            borderRight:  c.endsWith('r')   ? '3px solid #4F46E5' : undefined,
            borderRadius: c==='tl'?'4px 0 0 0':c==='tr'?'0 4px 0 0':c==='bl'?'0 0 0 4px':'0 0 4px 0',
            pointerEvents: 'none',
          }} />
        ))}
      </div>

      {/* Error */}
      {scanError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444', display: 'flex', gap: 8, alignItems: 'center' }}>
          <XCircle size={16} /> {scanError}
        </div>
      )}

      {/* Last scan */}
      {lastScan && !scanError && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#10B981', display: 'flex', gap: 8, alignItems: 'center' }}>
          <CheckCircle2 size={16} /> Decoded: <strong>{lastScan}</strong> — fetching booking…
        </div>
      )}

      {/* Start / Stop */}
      {!scanning ? (
        <button
          onClick={startScanner}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, width: '100%', fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#4F46E5,#06B6D4)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}
        >
          <QrCode size={18} /> Start Camera &amp; Scan QR
        </button>
      ) : (
        <button
          onClick={stopScanner}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, width: '100%', fontSize: 14, fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
        >
          <StopCircle size={18} /> Stop Camera
        </button>
      )}

      <p style={{ margin: 0, fontSize: 12, color: 'var(--ash)', textAlign: 'center', lineHeight: 1.5 }}>
        Point the camera at the printed ticket QR code.<br />
        The system will auto-identify the booking instantly.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN CHECK-IN CONSOLE
   ════════════════════════════════════════════════════════════════════════ */
export default function CheckInConsole() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mode,     setMode]     = useState('manual');

  const [searchQuery,     setSearchQuery]     = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [lookingUp,       setLookingUp]       = useState(false);
  const [eventHeadcounts, setEventHeadcounts] = useState({});

  const fetchData = async () => {
    try {
      const [b, e] = await Promise.all([bookingApi.getBookings(), eventApi.getEvents()]);
      setBookings(b);
      setEvents(e);
      const hc = {};
      e.forEach(ev => { hc[ev.id] = b.filter(bk => bk.eventId === ev.id && bk.checkedIn).length; });
      setEventHeadcounts(hc);
    } catch {
      toast.error('Failed to load check-in telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resolveBooking = useCallback(async (rawValue) => {
    const str = rawValue.toString().trim().toLowerCase();
    const local = bookings.find(b =>
      b.id.toString() === str ||
      b.tokenId?.toLowerCase() === str ||
      b.userEmail?.toLowerCase() === str
    );
    if (local) return local;
    if (/^\d+$/.test(str)) return await bookingApi.getBookingById(Number(str));
    return null;
  }, [bookings]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLookingUp(true);
    try {
      const match = await resolveBooking(searchQuery);
      if (match) { setSelectedBooking(match); toast.success('Ticket record found'); }
      else         toast.error('No booking matches this query');
    } catch {
      toast.error('Could not retrieve booking. Check the ID.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleQrDecoded = useCallback(async (decoded) => {
    setLookingUp(true);
    try {
      const match = await resolveBooking(decoded);
      if (match) {
        setSelectedBooking(match);
        setMode('manual');
        toast.success(`QR matched — Booking #${match.id}`);
      } else {
        toast.error(`QR decoded "${decoded}" but no booking found`);
      }
    } catch {
      toast.error('Failed to fetch booking from QR data');
    } finally {
      setLookingUp(false);
    }
  }, [resolveBooking]);

  const handleCheckIn = async (bookingId, eventId) => {
    if (selectedBooking?.checkedIn) {
      toast.error('SECURITY WARNING: DUPLICATE scan detected!');
      setSelectedBooking(prev => ({ ...prev, duplicateScan: true }));
      return;
    }
    try {
      const updated = await bookingApi.checkInBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
      setSelectedBooking(updated);
      setEventHeadcounts(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }));
      toast.success('Attendee checked in successfully!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Check-in failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('already checked in'))
        setSelectedBooking(prev => ({ ...prev, duplicateScan: true }));
    }
  };

  if (loading) return <LoadingSpinner label="Booting check-in console..." />;

  const bookingEvent  = selectedBooking ? events.find(e => e.id === selectedBooking.eventId) : null;
  const currentCount  = bookingEvent ? (eventHeadcounts[bookingEvent.id] || 0) : 0;
  const maxCapacity   = bookingEvent ? (bookingEvent.totalSeats || 1) : 1;
  const capacityPct   = Math.round((currentCount / maxCapacity) * 100);
  const showCapacityAlert = capacityPct >= 90;

  const getAccessZones = (price) => {
    if (price >= 1500) return ['General Access', 'Exhibition Floor', 'Speaker Lounge', 'VIP Backstage'];
    if (price >= 500)  return ['General Access', 'Exhibition Floor', 'VIP Lounge'];
    return ['General Access', 'Exhibition Floor'];
  };
  const zones = bookingEvent ? getAccessZones(bookingEvent.ticketPrice) : [];

  return (
    <div>
      <div className="header-actions">
        <div>
          <p className="eyebrow">Staff Operations Room</p>
          <h1 className="page-title-main">Access &amp; Check-In Console</h1>
        </div>
        <span className="badge live">Gate Scanners Live</span>
      </div>

      <div className="two-col-grid" style={{ marginTop: 20 }}>

        {/* LEFT COLUMN */}
        <div className="stack">

          {/* Mode card */}
          <div style={PANEL}>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 6, padding: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 14, marginBottom: 20 }}>
              <ModeTab active={mode === 'manual'} icon={Search} label="Manual Search" onClick={() => setMode('manual')} />
              <ModeTab active={mode === 'scan'}   icon={QrCode} label="Scan QR Code"  onClick={() => setMode('scan')} />
            </div>

            {/* MANUAL */}
            {mode === 'manual' && (
              <>
                <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
                  Enter a Ticket ID, Token ID, or email to look up a registration.
                </p>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="input-field"
                    placeholder="Ticket ID, Token ID, or email"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button className="cta" type="submit" disabled={lookingUp} style={{ padding: '12px 18px', minWidth: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {lookingUp ? '…' : <Search size={16} />}
                  </button>
                </form>
              </>
            )}

            {/* QR SCAN */}
            {mode === 'scan' && (
              <>
                <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
                  Point your camera at an attendee's ticket QR code. Booking auto-identified.
                </p>
                {lookingUp ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid rgba(79,70,229,0.3)', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ margin: 0, color: 'var(--ash)', fontSize: 13 }}>Looking up booking…</p>
                  </div>
                ) : (
                  <QrScannerPanel onScanSuccess={handleQrDecoded} />
                )}
              </>
            )}
          </div>

          {/* Occupancy telemetry */}
          <div style={PANEL}>
            <h3 style={{ fontFamily: 'Poppins', fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, margin: '0 0 14px' }}>
              Active Room Occupancy
            </h3>
            <div className="stack" style={{ gap: 10 }}>
              {events.length === 0 && <p className="muted text-sm">No events found.</p>}
              {events.map(ev => {
                const cnt = eventHeadcounts[ev.id] || 0;
                const cap = ev.totalSeats || 1;
                const pct = Math.round((cnt / cap) * 100);
                return (
                  <div key={ev.id} style={CARD}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                      <span>{ev.eventTitle}</span>
                      <span style={{ color: pct >= 90 ? 'var(--magenta)' : 'var(--amber)' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100,pct)}%`, height: '100%', background: pct >= 90 ? 'var(--magenta)' : 'var(--amber)', transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ display: 'block', marginTop: 6, fontSize: 11, color: 'var(--ash)' }}>
                      {cnt} / {cap} Checked In
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={PANEL}>
          {selectedBooking ? (
            <TicketStub
              booking={selectedBooking}
              zones={zones}
              capacityPct={capacityPct}
              showCapacityAlert={showCapacityAlert}
              onCheckIn={() => handleCheckIn(selectedBooking.id, selectedBooking.eventId)}
              onClear={() => setSelectedBooking(null)}
            />
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 380 }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <ShieldCheck size={52} style={{ color: 'rgba(79,70,229,0.25)' }} />
                <p className="muted text-sm" style={{ margin: 0, maxWidth: 260, lineHeight: 1.5 }}>
                  {mode === 'scan'
                    ? 'Scan a QR code to pull up booking details here.'
                    : 'Search for a ticket ID, token, or email to display booking info.'}
                </p>
                {mode === 'manual' && (
                  <button
                    onClick={() => setMode('scan')}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(79,70,229,0.3)', background: 'rgba(79,70,229,0.08)', color: '#4F46E5', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                  >
                    <QrCode size={15} /> Switch to QR Scanner
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
