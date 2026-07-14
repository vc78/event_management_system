import { useEffect, useState, useMemo } from 'react';
import * as zoneApi from '../../api/zoneApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { socketService } from '../../realtime/socket.js';
import { Scan, MapPin, ShieldAlert, Award, Users, AlertTriangle, Search } from 'lucide-react';

export default function VenueMap() {
  const { user } = useAuth();
  const toast = useToast();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState('stage1');
  const [zoneHistory, setZoneHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // GDPR Consent states
  const [gdprConsent, setGdprConsent] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [nfcAttendeeId, setNfcAttendeeId] = useState('101');
  const [nfcSponsorId, setNfcSponsorId] = useState('201');

  // Fetch all zones
  const fetchZones = async () => {
    try {
      const data = await zoneApi.getZones();
      setZones(data);
    } catch (err) {
      toast.error('Failed to load venue maps data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sparkline history for selected zone
  const fetchHistory = async (zoneId) => {
    try {
      const data = await zoneApi.getZoneHistory(zoneId);
      setZoneHistory(data);
    } catch (err) {
      setZoneHistory([]);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (selectedZoneId) {
      fetchHistory(selectedZoneId);
    }
  }, [selectedZoneId]);

  // STOMP WebSocket telemetry subscription
  useEffect(() => {
    const unsubscribe = socketService.subscribe('/topic/venue-map/traffic', (updatedZones) => {
      setZones(updatedZones);
    });
    return () => unsubscribe();
  }, []);

  // Simulate dwell traffic
  const handleSimulateVisitor = async (zoneId) => {
    try {
      await zoneApi.simulateEvent({ zoneId, type: 'dwell' });
      toast.success('Dwell visit simulated in zone!');
      fetchHistory(zoneId);
    } catch (err) {
      toast.error('Simulation request failed');
    }
  };

  // Simulate GDPR nfc badge tap
  const handleSimulateNfcTap = async () => {
    if (!gdprConsent) {
      toast.error('GDPR consent must be granted to collect attendee leads.');
      return;
    }
    try {
      await zoneApi.simulateEvent({
        zoneId: selectedZoneId,
        type: 'nfc',
        attendeeId: nfcAttendeeId,
        sponsorId: nfcSponsorId,
        consentGiven: true
      });
      toast.success('NFC badge tapped! Consent verified and lead saved.');
      setShowNfcModal(false);
      setGdprConsent(false);
      fetchHistory(selectedZoneId);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'NFC registration failed');
    }
  };

  const selectedZone = useMemo(() => {
    return zones.find(z => z.zoneId === selectedZoneId);
  }, [zones, selectedZoneId]);

  // Capacity alert calculations
  const overCapacityZones = useMemo(() => {
    return zones.filter(z => z.currentVisitorCount >= z.capacityThreshold);
  }, [zones]);

  // Search filtered zones
  const filteredZones = useMemo(() => {
    if (!searchQuery.trim()) return zones;
    return zones.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [zones, searchQuery]);

  // Heatmap color calculations
  const getZoneHeatColor = (zone) => {
    if (!zone) return 'var(--success)';
    const ratio = zone.currentVisitorCount / zone.capacityThreshold;
    if (ratio >= 0.85) return '#EF4444'; // Red
    if (ratio >= 0.50) return '#F59E0B'; // Amber
    return '#10B981'; // Green
  };

  if (loading) return <LoadingSpinner label="Loading interactive wayfinder..." />;

  return (
    <div>
      {/* Dynamic Over-Capacity Warning Banners */}
      {overCapacityZones.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '5px solid #EF4444', padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} />
          <div>
            <strong style={{ display: 'block', fontSize: '14px' }}>Safety Warning: High Crowd Density Detected</strong>
            <span style={{ fontSize: '12px' }}>
              The following zones have crossed safe capacity thresholds: {overCapacityZones.map(z => `${z.name} (${z.currentVisitorCount}/${z.capacityThreshold})`).join(', ')}.
            </span>
          </div>
        </div>
      )}

      <div className="header-actions">
        <div>
          <p className="eyebrow">Wayfinder & Heatmaps</p>
          <h1 className="page-title-main">Interactive Floor Map</h1>
        </div>
        
        {/* Live Search & Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="bk-search-wrap" style={{ margin: 0, width: '260px' }}>
            <Search size={15} className="bk-search-icon" />
            <input 
              type="text" 
              className="bk-search-input" 
              placeholder="Search zones..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="flip-stat-dot" style={{ background: '#10B981', margin: 0 }} /> Live Telemetry
          </span>
        </div>
      </div>

      <div className="two-col-grid" style={{ marginTop: '20px' }}>
        
        {/* Left Side: SVG Floor Map with Heatmaps */}
        <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
          <h3 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '18px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Expo Floor Layout
          </h3>
          
          <div style={{ background: 'var(--stage)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', position: 'relative', overflowX: 'auto' }}>
            
            <svg viewBox="0 0 800 500" width="100%" height="100%" className="wayfinder-map">
              
              <rect x="10" y="10" width="780" height="480" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* STAGE 1 AREA */}
              <g 
                onClick={() => setSelectedZoneId('stage1')}
                style={{ cursor: 'pointer' }}
              >
                <rect x="40" y="40" width="220" height="150" fill="rgba(255, 255, 255, 0.01)" stroke={selectedZoneId === 'stage1' ? 'var(--amber)' : 'var(--line)'} strokeWidth="2" rx="10" />
                <text x="150" y="100" fill="var(--paper-dim)" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Poppins">STAGE 1</text>
                <text x="150" y="125" fill="var(--ash)" fontSize="12" textAnchor="middle">Simulcast Feed Area</text>
                
                {/* Dynamic heat circle for Stage 1 */}
                <circle cx="150" cy="65" r="10" fill={getZoneHeatColor(zones.find(z => z.zoneId === 'stage1'))} opacity="0.8" />
                <circle cx="150" cy="65" r="16" fill="none" stroke={getZoneHeatColor(zones.find(z => z.zoneId === 'stage1'))} strokeWidth="2" opacity="0.5" style={{ animation: 'ping 1.8s infinite' }} />
              </g>

              {/* STAGE 2 AREA */}
              <g 
                onClick={() => setSelectedZoneId('stage2')}
                style={{ cursor: 'pointer' }}
              >
                <rect x="40" y="310" width="220" height="150" fill="rgba(255, 255, 255, 0.01)" stroke={selectedZoneId === 'stage2' ? 'var(--amber)' : 'var(--line)'} strokeWidth="2" rx="10" />
                <text x="150" y="375" fill="var(--paper-dim)" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Poppins">STAGE 2</text>
                <text x="150" y="400" fill="var(--ash)" fontSize="12" textAnchor="middle">Developer Workshop</text>
                
                <circle cx="150" cy="340" r="9" fill={getZoneHeatColor(zones.find(z => z.zoneId === 'stage2'))} opacity="0.8" />
              </g>

              {/* VIP LOUNGE */}
              <g 
                onClick={() => setSelectedZoneId('lounge')}
                style={{ cursor: 'pointer' }}
              >
                <rect x="540" y="40" width="220" height="150" fill="rgba(255, 255, 255, 0.01)" stroke={selectedZoneId === 'lounge' ? 'var(--amber)' : 'var(--line)'} strokeWidth="2" rx="10" />
                <text x="650" y="100" fill="var(--paper-dim)" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Poppins">VIP LOUNGE</text>
                <text x="650" y="125" fill="var(--ash)" fontSize="12" textAnchor="middle">Workspace & Lounge</text>
                
                <circle cx="650" cy="70" r="9" fill={getZoneHeatColor(zones.find(z => z.zoneId === 'lounge'))} opacity="0.8" />
              </g>

              {/* SPONSOR EXPO FLOOR */}
              <rect x="300" y="40" width="200" height="420" fill="rgba(255,184,77,0.01)" stroke="rgba(255,184,77,0.1)" strokeWidth="2" rx="12" />
              <text x="400" y="30" fill="var(--amber)" fontSize="11" letterSpacing="2" fontWeight="bold" textAnchor="middle" fontFamily="IBM Plex Mono">SPONSOR EXPO</text>

              {/* Booth 1 */}
              <g 
                onClick={() => setSelectedZoneId('booth1')}
                style={{ cursor: 'pointer' }}
              >
                <rect 
                  x="320" y="60" width="160" height="90" 
                  fill={selectedZoneId === 'booth1' ? 'rgba(255,184,77,0.08)' : 'rgba(255,255,255,0.02)'} 
                  stroke={selectedZoneId === 'booth1' ? 'var(--amber)' : 'var(--line)'} 
                  strokeWidth="2" rx="8" 
                />
                <text x="400" y="105" fill="var(--paper)" fontSize="13" fontWeight="bold" textAnchor="middle">Google Cloud (B-01)</text>
                <text x="400" y="130" fill="var(--ash)" fontSize="11" textAnchor="middle">
                  Visitors: {zones.find(z => z.zoneId === 'booth1')?.currentVisitorCount ?? 0}
                </text>
              </g>

              {/* Booth 2 */}
              <g 
                onClick={() => setSelectedZoneId('booth2')}
                style={{ cursor: 'pointer' }}
              >
                <rect 
                  x="320" y="195" width="160" height="90" 
                  fill={selectedZoneId === 'booth2' ? 'rgba(255,184,77,0.08)' : 'rgba(255,255,255,0.02)'} 
                  stroke={selectedZoneId === 'booth2' ? 'var(--amber)' : 'var(--line)'} 
                  strokeWidth="2" rx="8" 
                />
                <text x="400" y="240" fill="var(--paper)" fontSize="13" fontWeight="bold" textAnchor="middle">JetBrains (B-02)</text>
                <text x="400" y="265" fill="var(--ash)" fontSize="11" textAnchor="middle">
                  Visitors: {zones.find(z => z.zoneId === 'booth2')?.currentVisitorCount ?? 0}
                </text>
              </g>

              {/* Booth 3 */}
              <g 
                onClick={() => setSelectedZoneId('booth3')}
                style={{ cursor: 'pointer' }}
              >
                <rect 
                  x="320" y="330" width="160" height="90" 
                  fill={selectedZoneId === 'booth3' ? 'rgba(255,184,77,0.08)' : 'rgba(255,255,255,0.02)'} 
                  stroke={selectedZoneId === 'booth3' ? 'var(--amber)' : 'var(--line)'} 
                  strokeWidth="2" rx="8" 
                />
                <text x="400" y="375" fill="var(--paper)" fontSize="13" fontWeight="bold" textAnchor="middle">Github Copilot (B-03)</text>
                <text x="400" y="400" fill="var(--ash)" fontSize="11" textAnchor="middle">
                  Visitors: {zones.find(z => z.zoneId === 'booth3')?.currentVisitorCount ?? 0}
                </text>
              </g>

            </svg>
          </div>

          {/* Search Result Quick List */}
          {searchQuery && (
            <div style={{ marginTop: '16px', background: 'var(--stage)', padding: '12px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <p className="text-xs muted font-semibold mb-2">Search Results:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filteredZones.map(z => (
                  <button 
                    key={z.zoneId}
                    className="pub-header-role-badge" 
                    style={{ background: selectedZoneId === z.zoneId ? 'var(--amber)' : 'var(--stage-2)', color: selectedZoneId === z.zoneId ? '#000' : '#fff', border: 'none', cursor: 'pointer', padding: '4px 10px' }}
                    onClick={() => setSelectedZoneId(z.zoneId)}
                  >
                    {z.name}
                  </button>
                ))}
                {filteredZones.length === 0 && <span className="muted text-xs">No matching zones</span>}
              </div>
            </div>
          )}

          {/* Map Legend */}
          <div className="flex gap-6 mt-4 text-xs muted" style={{ justifyContent: 'center' }}>
            <span className="flex gap-2" style={{ alignItems: 'center' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></span> Crowded Limit (Alert)
            </span>
            <span className="flex gap-2" style={{ alignItems: 'center' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></span> Moderate Traffic
            </span>
            <span className="flex gap-2" style={{ alignItems: 'center' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></span> Cleared / Safe
            </span>
          </div>
        </div>

        {/* Right Side: Selected Zone Telemetry Panel */}
        <div className="stack">
          {selectedZone ? (
            <div className="card p-6" style={{ background: 'var(--stage-2)', border: '1px solid var(--line)', height: 'fit-content' }}>
              <span className="badge selling mb-3" style={{ background: getZoneHeatColor(selectedZone), color: '#000' }}>
                {selectedZone.currentVisitorCount >= selectedZone.capacityThreshold ? 'CAPACITY ALERT' : 'ACTIVE ZONE'}
              </span>
              
              <h2 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '24px', textTransform: 'uppercase', marginBottom: '6px' }}>
                {selectedZone.name}
              </h2>
              
              <p className="muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} /> Capacity Limit: <strong>{selectedZone.capacityThreshold} people</strong>
              </p>

              {/* Sparkline Trend Chart */}
              <div style={{ background: 'var(--stage)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="text-xs muted font-semibold block mb-1">Hourly Visitor Trend</span>
                  <span className="text-xs text-amber font-semibold block">Last 60 mins</span>
                </div>
                {zoneHistory.length > 1 ? (
                  <svg width="120" height="35" style={{ overflow: 'visible' }}>
                    <polyline
                      fill="none"
                      stroke={getZoneHeatColor(selectedZone)}
                      strokeWidth="2.5"
                      points={zoneHistory.map((h, idx) => {
                        const maxCount = Math.max(...zoneHistory.map(h => h.visitorCount), 1);
                        const x = (idx / (zoneHistory.length - 1)) * 120;
                        const y = 35 - (h.visitorCount / maxCount) * 28 - 2;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </svg>
                ) : (
                  <span className="muted text-xs">Awaiting data points...</span>
                )}
              </div>

              {/* Dynamic ROI Metrics */}
              <div className="stack mt-6" style={{ gap: '12px' }}>
                <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)' }}>
                  <strong>{selectedZone.currentVisitorCount.toLocaleString()}</strong>
                  <span className="muted">Live Visitors Inside</span>
                </div>
                
                <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)' }}>
                  <strong>
                    {selectedZone.currentVisitorCount > 0 
                      ? Math.round(selectedZone.totalDwellSeconds / selectedZone.currentVisitorCount) 
                      : 0}s
                  </strong>
                  <span className="muted">Average Visitor Dwell Time</span>
                </div>
              </div>

              {/* Telemetry Actions (Admins/Speakers) */}
              <div className="stack mt-6" style={{ gap: '12px' }}>
                <button 
                  className="btn-primary w-full"
                  onClick={() => setShowNfcModal(true)}
                  style={{ padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <Scan size={16} /> Simulate NFC Badge Tap
                </button>
                
                <button 
                  className="btn-secondary w-full"
                  onClick={() => handleSimulateVisitor(selectedZone.zoneId)}
                >
                  Simulate Dwell Entry
                </button>
              </div>

              <div className="stat-card mt-6" style={{ borderLeft: '4px solid var(--amber)', background: 'var(--stage)', padding: '12px 16px' }}>
                <span className="text-xs muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={12} className="warning" /> Compliance Tooling (GDPR)
                </span>
                <p className="text-xs muted mt-2" style={{ margin: 0, lineHeight: 1.4 }}>
                  NFC badge taps will capture attendee emails for the sponsor booth. Explicit consent is verified on tap.
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="muted">Select a zone in the layout map to view ROI telemetry.</p>
            </div>
          )}
        </div>
      </div>

      {/* GDPR Consent Gate NFC Badge Tap Modal */}
      {showNfcModal && (
        <div className="bk-modal-overlay" onClick={() => setShowNfcModal(false)}>
          <div className="bk-modal" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="bk-modal-header">
              <h2 className="bk-modal-title">Simulate Badge Tap</h2>
            </div>
            <div className="stack" style={{ gap: '14px', padding: '10px 0' }}>
              <div>
                <label className="label-text">Attendee ID</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={nfcAttendeeId}
                  onChange={e => setNfcAttendeeId(e.target.value)}
                />
              </div>
              <div>
                <label className="label-text">Sponsor ID</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={nfcSponsorId}
                  onChange={e => setNfcSponsorId(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(255, 184, 77, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 184, 77, 0.15)' }}>
                <input 
                  type="checkbox" 
                  id="gdpr-consent-check"
                  checked={gdprConsent}
                  onChange={e => setGdprConsent(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="gdpr-consent-check" style={{ fontSize: '11px', color: 'var(--paper)', cursor: 'pointer', lineHeight: 1.4 }}>
                  <strong>GDPR Compliance Agreement</strong>: The attendee explicitly consents to sharing their name and email with the sponsor.
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="btn-secondary w-full" onClick={() => setShowNfcModal(false)}>Cancel</button>
              <button 
                className="btn-primary w-full" 
                onClick={handleSimulateNfcTap}
                disabled={!gdprConsent}
                style={{ opacity: gdprConsent ? 1 : 0.6 }}
              >
                Simulate Tap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
