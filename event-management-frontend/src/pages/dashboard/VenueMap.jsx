import { useEffect, useState } from 'react';
import * as sponsorApi from '../../api/sponsorApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Scan, MapPin, ShieldAlert, Award, Users } from 'lucide-react';

export default function VenueMap() {
  const { user } = useAuth();
  const toast = useToast();
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState(null);

  // Heatmap simulations
  const [heatmapIntensity, setHeatmapIntensity] = useState({
    stage1: 'high',
    stage2: 'low',
    expo: 'medium',
    lounge: 'medium'
  });

  const fetchBooths = async () => {
    try {
      const data = await sponsorApi.getBooths();
      setBooths(data);
      if (data.length > 0 && !selectedBooth) {
        setSelectedBooth(data[0]);
      } else if (data.length > 0 && selectedBooth) {
        const updated = data.find(b => b.id === selectedBooth.id);
        setSelectedBooth(updated || data[0]);
      }
    } catch (err) {
      toast.error('Failed to load venue maps data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooths();
  }, []);

  const handleCollectSwag = async (boothId) => {
    try {
      // Simulate badge scan / collecting swag (increments both traffic and leads)
      await Promise.all([
        sponsorApi.incrementTraffic(boothId),
        sponsorApi.incrementLeads(boothId)
      ]);
      toast.success('Badge tapped! Swag collected & lead scanned successfully.');
      fetchBooths(); // Refresh numbers
    } catch (err) {
      toast.error('Failed to register scan');
    }
  };

  const handleSimulateVisitor = async (boothId) => {
    try {
      await sponsorApi.incrementTraffic(boothId);
      toast.success('Visitor dwell simulated at booth!');
      fetchBooths();
    } catch (err) {
      toast.error('Failed to register dweller');
    }
  };

  if (loading) return <LoadingSpinner label="Loading interactive wayfinder..." />;

  // Find booth values for UI markers
  const getBoothTraffic = (number) => {
    const b = booths.find(x => x.boothNumber === number);
    return b ? b.boothTraffic : 0;
  };

  return (
    <div>
      <div className="header-actions">
        <div>
          <p className="eyebrow">Wayfinder & Heatmaps</p>
          <h1 className="page-title-main">Interactive Floor Map</h1>
        </div>
        
        <span className="badge" style={{ background: 'rgba(255, 184, 77, 0.1)', color: 'var(--amber)' }}>
          Live Telemetry Stream Active
        </span>
      </div>

      <div className="two-col-grid" style={{ marginTop: '20px' }}>
        
        {/* Left Side: SVG Floor Map */}
        <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
          <h3 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '18px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Expo Floor Layout
          </h3>
          
          <div style={{ background: 'var(--stage)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', position: 'relative' }}>
            
            {/* SVG MAP */}
            <svg viewBox="0 0 800 500" width="100%" height="100%" style={{ display: 'block', borderRadius: '8px' }}>
              
              {/* Outer boundary grid */}
              <rect x="10" y="10" width="780" height="480" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* STAGE 1 AREA */}
              <g 
                onClick={() => toast.info('Stage 1 Area: Live Session Ongoing')}
                style={{ cursor: 'pointer' }}
              >
                <rect x="40" y="40" width="220" height="150" fill="rgba(255, 255, 255, 0.02)" stroke="var(--line)" strokeWidth="2" rx="10" />
                <text x="150" y="100" fill="var(--paper-dim)" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Poppins">STAGE 1</text>
                <text x="150" y="125" fill="var(--ash)" fontSize="12" textAnchor="middle">Simulcast Feed</text>
                
                {/* Heatmap marker Stage 1 */}
                <circle cx="150" cy="70" r="10" fill="var(--magenta)" opacity="0.8" style={{ animation: 'ping 1.5s infinite' }} />
                <circle cx="150" cy="70" r="18" fill="none" stroke="var(--magenta)" strokeWidth="2" opacity="0.6" />
              </g>

              {/* STAGE 2 AREA */}
              <g 
                onClick={() => toast.info('Stage 2 Area: Next session starts in 15m')}
                style={{ cursor: 'pointer' }}
              >
                <rect x="40" y="310" width="220" height="150" fill="rgba(255, 255, 255, 0.02)" stroke="var(--line)" strokeWidth="2" rx="10" />
                <text x="150" y="375" fill="var(--paper-dim)" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Poppins">STAGE 2</text>
                <text x="150" y="400" fill="var(--ash)" fontSize="12" textAnchor="middle">Panel Discussions</text>
                <circle cx="150" cy="340" r="8" fill="var(--success)" opacity="0.8" />
              </g>

              {/* FOOD COURT & LOUNGE */}
              <g 
                onClick={() => toast.info('General Networking Lounge & Workspace')}
                style={{ cursor: 'pointer' }}
              >
                <rect x="540" y="40" width="220" height="150" fill="rgba(255, 255, 255, 0.02)" stroke="var(--line)" strokeWidth="2" rx="10" />
                <text x="650" y="100" fill="var(--paper-dim)" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Poppins">VIP LOUNGE</text>
                <text x="650" y="125" fill="var(--ash)" fontSize="12" textAnchor="middle">Catering & Tap Swag</text>
                
                {/* Heatmap marker Lounge */}
                <circle cx="650" cy="70" r="8" fill="var(--amber)" opacity="0.7" />
              </g>

              {/* BOOTHS EXPO FLOOR ZONE */}
              <rect x="300" y="40" width="200" height="420" fill="rgba(255,184,77,0.01)" stroke="rgba(255,184,77,0.1)" strokeWidth="2" rx="12" />
              <text x="400" y="30" fill="var(--amber)" fontSize="12" letterSpacing="2" fontWeight="bold" textAnchor="middle" fontFamily="IBM Plex Mono">SPONSOR EXPO</text>

              {/* Booth A-10 (Platinum) */}
              <g 
                onClick={() => {
                  const b = booths.find(x => x.boothNumber === 'A-10');
                  if (b) setSelectedBooth(b);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect 
                  x="320" y="60" width="160" height="90" 
                  fill={selectedBooth?.boothNumber === 'A-10' ? 'rgba(255,184,77,0.1)' : 'rgba(255,255,255,0.03)'} 
                  stroke={selectedBooth?.boothNumber === 'A-10' ? 'var(--amber)' : 'var(--line)'} 
                  strokeWidth="2" rx="8" 
                />
                <text x="400" y="105" fill="var(--paper)" fontSize="14" fontWeight="bold" textAnchor="middle">Google Cloud (A-10)</text>
                <text x="400" y="130" fill="var(--ash)" fontSize="11" textAnchor="middle">Traffic: {getBoothTraffic('A-10')}</text>
              </g>

              {/* Booth B-04 (Gold) */}
              <g 
                onClick={() => {
                  const b = booths.find(x => x.boothNumber === 'B-04');
                  if (b) setSelectedBooth(b);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect 
                  x="320" y="195" width="160" height="90" 
                  fill={selectedBooth?.boothNumber === 'B-04' ? 'rgba(255,184,77,0.1)' : 'rgba(255,255,255,0.03)'} 
                  stroke={selectedBooth?.boothNumber === 'B-04' ? 'var(--amber)' : 'var(--line)'} 
                  strokeWidth="2" rx="8" 
                />
                <text x="400" y="240" fill="var(--paper)" fontSize="14" fontWeight="bold" textAnchor="middle">JetBrains (B-04)</text>
                <text x="400" y="265" fill="var(--ash)" fontSize="11" textAnchor="middle">Traffic: {getBoothTraffic('B-04')}</text>
              </g>

              {/* Booth C-12 (Silver) */}
              <g 
                onClick={() => {
                  const b = booths.find(x => x.boothNumber === 'C-12');
                  if (b) setSelectedBooth(b);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect 
                  x="320" y="330" width="160" height="90" 
                  fill={selectedBooth?.boothNumber === 'C-12' ? 'rgba(255,184,77,0.1)' : 'rgba(255,255,255,0.03)'} 
                  stroke={selectedBooth?.boothNumber === 'C-12' ? 'var(--amber)' : 'var(--line)'} 
                  strokeWidth="2" rx="8" 
                />
                <text x="400" y="375" fill="var(--paper)" fontSize="14" fontWeight="bold" textAnchor="middle">Github Copilot (C-12)</text>
                <text x="400" y="400" fill="var(--ash)" fontSize="11" textAnchor="middle">Traffic: {getBoothTraffic('C-12')}</text>
              </g>

            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex gap-6 mt-4 text-xs muted" style={{ justifyContent: 'center' }}>
            <span className="flex gap-2" style={{ alignItems: 'center' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--magenta)' }}></span> Crowded Zone (Alert)
            </span>
            <span className="flex gap-2" style={{ alignItems: 'center' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--amber)' }}></span> Moderate Traffic
            </span>
            <span className="flex gap-2" style={{ alignItems: 'center' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></span> Cleared Area
            </span>
          </div>
        </div>

        {/* Right Side: Selected Sponsor Info */}
        <div className="stack">
          {selectedBooth ? (
            <div className="card p-6" style={{ background: 'var(--stage-2)', border: '1px solid var(--line)', height: 'fit-content' }}>
              <span className="badge selling mb-3">{selectedBooth.tier} SPONSOR</span>
              <h2 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '24px', textTransform: 'uppercase', marginBottom: '6px' }}>
                {selectedBooth.sponsorName}
              </h2>
              <p className="muted text-sm">Booth Space: <strong>{selectedBooth.boothNumber}</strong></p>

              {/* ROI Telemetry */}
              <div className="stack mt-6" style={{ gap: '12px' }}>
                <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)' }}>
                  <strong>{selectedBooth.boothTraffic.toLocaleString()}</strong>
                  <span className="muted">Total Visitors Dwell</span>
                </div>
                
                <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)' }}>
                  <strong>{selectedBooth.leadCount.toLocaleString()}</strong>
                  <span className="muted">Swag/Leads Collected</span>
                </div>
              </div>

              {/* Swag/Checkin simulation triggers */}
              <div className="stack mt-6" style={{ gap: '12px' }}>
                <button 
                  className="btn-primary w-full"
                  onClick={() => handleCollectSwag(selectedBooth.id)}
                  style={{ padding: '14px' }}
                >
                  <Scan size={16} /> Simulate NFC Badge Tap
                </button>
                
                <button 
                  className="btn-secondary w-full"
                  onClick={() => handleSimulateVisitor(selectedBooth.id)}
                >
                  Simulate Dwell Visit
                </button>
              </div>

              <div className="stat-card mt-6" style={{ borderLeft: '4px solid var(--amber)', background: 'var(--stage)', padding: '12px 16px' }}>
                <span className="text-xs muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={12} className="warning" /> Compliance Tooling (GDPR)
                </span>
                <p className="text-xs muted mt-2" style={{ margin: 0 }}>
                  By tapping the badge, attendees consent to share their registration full name and email with this sponsor.
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="muted">Click on a booth in the layout map to view ROI statistics.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
