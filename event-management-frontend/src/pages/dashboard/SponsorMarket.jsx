import { useEffect, useState } from 'react';
import * as sponsorApi from '../../api/sponsorApi.js';
import * as referralApi from '../../api/referralApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Award, DollarSign, ExternalLink, Link2, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function SponsorMarket() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [booths, setBooths] = useState([]);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [customCode, setCustomCode] = useState('');
  
  const fetchData = async () => {
    try {
      const [b, r] = await Promise.all([
        sponsorApi.getBooths(),
        user?.id ? referralApi.getReferralByUser(user.id) : Promise.resolve(null)
      ]);
      setBooths(b);
      setReferral(r);
    } catch (err) {
      toast.error('Failed to load marketplace records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Book Booth
  const handleBookBooth = async (boothId) => {
    if (!user?.id) return;
    try {
      setSubmitting(true);
      await sponsorApi.bookBooth(boothId, user.id);
      toast.success('Booth space booked! Welcome to the expo.');
      fetchData();
    } catch (err) {
      toast.error('Failed to book booth space');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate Referral Code
  const handleGenerateReferral = async (e) => {
    e.preventDefault();
    if (!customCode.trim() || !user?.id) return;
    
    try {
      setSubmitting(true);
      const payload = {
        referrerId: user.id,
        referralCode: customCode.trim().toUpperCase()
      };
      await referralApi.createReferral(payload);
      toast.success('Affiliate referral code generated!');
      setCustomCode('');
      fetchData();
    } catch (err) {
      toast.error('Code already exists or generation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Simulate link click
  const handleSimulateClick = async (code) => {
    try {
      await referralApi.registerClick(code);
      toast.success('Simulated referral link click registered');
      fetchData();
    } catch (err) {
      toast.error('Click registration failed');
    }
  };

  // Simulate conversions
  const handleSimulateConversion = async (code) => {
    try {
      // Assume a ticket purchase value of 1500.00
      const ticketVal = 1500.00;
      await referralApi.registerConversion(code, ticketVal);
      toast.success(`Referral conversion logged! Commission earned (10% of ₹${ticketVal})`);
      fetchData();
    } catch (err) {
      toast.error('Conversion registration failed');
    }
  };

  if (loading) return <LoadingSpinner label="Loading sponsor marketplace..." />;

  return (
    <div>
      <div className="header-actions">
        <div>
          <p className="eyebrow">Monetization & Affiliates</p>
          <h1 className="page-title-main">Sponsorship & Earnings</h1>
        </div>
      </div>

      <div className="two-col-grid-equal" style={{ marginTop: '20px' }}>
        
        {/* Left Column: Self-Serve Sponsorship Booking */}
        <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
          <h3 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '20px', textTransform: 'uppercase' }}>
            Sponsor Booth Marketplace
          </h3>
          <p className="muted mb-6">Select and book premium spaces in the exhibition hall directly.</p>

          <div className="stack" style={{ gap: '14px' }}>
            {booths.map(b => {
              const isBooked = b.bookedByUserId !== null;
              const isMine = b.bookedByUserId === user?.id;
              
              return (
                <div key={b.id} className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="flex row-between">
                    <span className="badge selling">{b.tier} package</span>
                    <span className="clock">Booth {b.boothNumber}</span>
                  </div>

                  <div className="flex row-between mt-2" style={{ alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{b.sponsorName}</div>
                    
                    {isBooked ? (
                      isMine ? (
                        <span className="badge live" style={{ background: '#d1fae5', color: '#065f46' }}>
                          Booked by You
                        </span>
                      ) : (
                        <span className="badge soldout">Unavailable</span>
                      )
                    ) : (
                      <button 
                        className="cta" 
                        disabled={submitting}
                        onClick={() => handleBookBooth(b.id)}
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        Reserve Booth
                      </button>
                    )}
                  </div>

                  {isBooked && (
                    <div className="flex gap-6 mt-2 text-xs muted">
                      <span>Booths Traffic: <strong>{b.boothTraffic}</strong></span>
                      <span>Leads: <strong>{b.leadCount}</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Affiliate Program & Link Tracking */}
        <div className="card p-6" style={{ background: 'var(--stage-2)' }}>
          <h3 className="section-title" style={{ fontFamily: 'Poppins', fontSize: '20px', textTransform: 'uppercase' }}>
            Attendee Referral Program
          </h3>
          <p className="muted mb-6">Share your custom affiliate link and earn a 10% commission on every ticket sold.</p>

          {referral ? (
            <div className="stack" style={{ gap: '16px' }}>
              <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '20px' }}>
                <span className="eyebrow">Your Active Campaign</span>
                <div className="flex row-between mt-2" style={{ alignItems: 'center' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, fontSize: '18px', color: 'var(--amber)' }}>
                    {referral.referralCode}
                  </span>
                  <span className="badge live">Active</span>
                </div>
                <div className="muted text-xs mt-3">
                  Share link: <code>http://localhost:5173/?ref={referral.referralCode}</code>
                </div>
              </div>

              {/* Commission Stats */}
              <div className="three-col-grid" style={{ gap: '12px' }}>
                <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '14px' }}>
                  <strong style={{ fontSize: '20px' }}>{referral.clicks}</strong>
                  <span className="muted text-xs">Link Clicks</span>
                </div>
                <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '14px' }}>
                  <strong style={{ fontSize: '20px' }}>{referral.conversions}</strong>
                  <span className="muted text-xs">Conversions</span>
                </div>
                <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '14px' }}>
                  <strong style={{ fontSize: '20px', color: 'var(--success)' }}>{formatCurrency(referral.commissionEarned || 0)}</strong>
                  <span className="muted text-xs">Earnings</span>
                </div>
              </div>

              {/* Simulation Sandbox */}
              <div className="card p-4" style={{ background: 'rgba(255, 184, 77, 0.02)', border: '1px solid rgba(255, 184, 77, 0.1)' }}>
                <span className="eyebrow" style={{ fontSize: '10px', color: 'var(--magenta)' }}>Simulation Sandbox</span>
                <p className="text-xs muted mt-2" style={{ margin: '0 0 12px 0' }}>
                  Simulate attendee link clicks and conversions to verify real-time commission aggregation.
                </p>
                <div className="flex gap-3">
                  <button 
                    className="btn-secondary text-xs flex-1"
                    onClick={() => handleSimulateClick(referral.referralCode)}
                  >
                    Simulate Link Click
                  </button>
                  
                  <button 
                    className="cta text-xs flex-1"
                    onClick={() => handleSimulateConversion(referral.referralCode)}
                    style={{ background: 'var(--magenta)', color: '#fff', boxShadow: 'none' }}
                  >
                    Simulate Ticket Sale
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerateReferral} className="stack">
              <div className="stat-card" style={{ background: 'var(--stage)', border: '1px solid var(--line)', padding: '20px' }}>
                <span className="muted text-xs">Create your customized referral code to join the affiliate program.</span>
                
                <div className="mt-4">
                  <label className="label-text">Custom Referral Code</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      className="input-field" 
                      placeholder="e.g. MYCODE10" 
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                    />
                    <button className="cta" type="submit" disabled={submitting} style={{ padding: '12px 20px' }}>
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
