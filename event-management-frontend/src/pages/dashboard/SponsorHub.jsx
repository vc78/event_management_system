import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import * as sponsorApi from '../../api/sponsorApi.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { exportToCSV } from '../../utils/csvExport.js';
import { Award, Download, Users, Target, ShieldAlert } from 'lucide-react';

export default function SponsorHub() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSponsorBooths = async () => {
    try {
      const data = await sponsorApi.getBooths();
      // Filter booths booked by this sponsor (using user.id)
      const myBooths = data.filter(b => b.bookedByUserId === user?.id);
      setBooths(myBooths);
    } catch (err) {
      toast.error('Failed to load sponsor booth analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorBooths();
  }, [user]);

  const handleExportLeads = (booth) => {
    // Generate simulated structured leads data based on the lead count
    const mockLeads = [];
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 'Robert', 'Karen'];
    const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson'];
    const jobTitles = ['Software Architect', 'VP Product', 'Fullstack Engineer', 'CISO', 'Data Scientist', 'DevOps Lead'];
    
    for (let i = 0; i < booth.leadCount; i++) {
      const f = firstNames[Math.floor(Math.random() * firstNames.length)];
      const l = lastNames[Math.floor(Math.random() * lastNames.length)];
      const j = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const domain = booth.sponsorName.toLowerCase().replace(/ /g, '') + '.com';
      
      mockLeads.push({
        LeadId: 2026000 + i,
        FullName: `${f} ${l}`,
        Email: `${f.toLowerCase()}.${l.toLowerCase()}@example.com`,
        JobTitle: j,
        ScanTime: new Date(Date.now() - Math.random() * 86400000 * 3).toLocaleString(),
        ConsentGiven: 'YES'
      });
    }

    exportToCSV(mockLeads, `${booth.sponsorName.replace(/ /g, '_')}_Leads.csv`);
    toast.success('Leads spreadsheet downloaded successfully!');
  };

  if (loading) return <LoadingSpinner label="Authenticating sponsor console..." />;

  if (booths.length === 0) {
    return (
      <div>
        <header className="hero" style={{ padding: '0 0 24px', marginBottom: '20px' }}>
          <div>
            <p className="eyebrow">Sponsor Space / Console</p>
            <h1>Sponsor Portal</h1>
            <p className="sub">Authorized Access: <strong style={{ color: 'var(--amber)' }}>{user?.email}</strong></p>
          </div>
        </header>
        
        <EmptyState 
          title="No Booth Reserved" 
          description="Your sponsor account does not currently have any booth spaces booked."
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <a href="/dashboard/marketplace">
            <button className="cta">Book Booth Package</button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="hero" style={{ padding: '0 0 24px', marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Sponsor Space / Analytics</p>
          <h1>Sponsor Dashboard</h1>
          <p className="sub">Welcome back. Authorized Access: <strong style={{ color: 'var(--amber)' }}>{user?.email}</strong></p>
        </div>
      </header>

      <div className="stack" style={{ gap: '24px' }}>
        {booths.map(b => (
          <div key={b.id} className="card p-6" style={{ background: 'var(--stage-2)', border: '1px solid var(--line)' }}>
            <div className="flex row-between">
              <div>
                <span className="badge selling" style={{ marginBottom: '8px' }}>{b.tier} Partner</span>
                <h2 style={{ fontFamily: 'Poppins', fontSize: '24px', textTransform: 'uppercase', margin: 0, color: 'var(--paper)' }}>
                  {b.sponsorName}
                </h2>
                <p className="muted text-sm mt-2" style={{ margin: 0 }}>Exhibition Space: <strong>Booth {b.boothNumber}</strong></p>
              </div>

              <button 
                className="cta"
                onClick={() => handleExportLeads(b)}
                style={{ background: 'var(--amber)', color: 'var(--ink)' }}
              >
                <Download size={16} /> Export Leads to Excel
              </button>
            </div>

            {/* Performance telemetry stats */}
            <div className="stats" style={{ padding: '24px 0 0 0' }}>
              <div className="stat" style={{ background: 'var(--stage)' }}>
                <p className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={12} /> Dwell Traffic
                </p>
                <p className="num">{b.boothTraffic}</p>
              </div>

              <div className="stat magenta" style={{ background: 'var(--stage)' }}>
                <p className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={12} /> Swag Leads Scanned
                </p>
                <p className="num">{b.leadCount}</p>
              </div>

              <div className="stat" style={{ background: 'var(--stage)', gridColumn: 'span 2' }}>
                <p className="label">Lead Conversion Ratio</p>
                <p className="num" style={{ color: 'var(--success)' }}>
                  {b.boothTraffic > 0 ? Math.round((b.leadCount / b.boothTraffic) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Compliance warning */}
            <div className="stat-card mt-6" style={{ borderLeft: '4px solid var(--magenta)', background: 'var(--stage)', padding: '14px 18px' }}>
              <span className="text-xs muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <ShieldAlert size={14} className="warning" /> GDPR/CCPA Consent Data Policy
              </span>
              <p className="text-xs muted mt-2" style={{ margin: 0, lineScale: 1.4 }}>
                Lead exports contain attendee names, emails, and scan timestamps. These records must be stored and processed in compliance with global data protection directives.
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
