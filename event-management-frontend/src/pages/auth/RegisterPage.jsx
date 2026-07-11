import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield, Zap, Star } from 'lucide-react';
import AppLogo from '../../components/common/AppLogo.jsx';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

const ORBS = [
  { w: 500, h: 500, top: '-120px', left: '-120px', color: 'rgba(6,182,212,0.3)' },
  { w: 350, h: 350, top: '35%', right: '-80px', color: 'rgba(79,70,229,0.25)' },
  { w: 280, h: 280, bottom: '-60px', left: '25%', color: 'rgba(16,185,129,0.2)' },
];

const PERKS = [
  '✓  No credit card required',
  '✓  Book tickets in seconds',
  '✓  Manage your events freely',
  '✓  Cancel anytime',
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [strength, setStrength] = useState(0); // 0-4
  // redirectTo is set AFTER the auth state update is committed,
  // so <Navigate> always sees the correct isAuthenticated/role.
  const [redirectTo, setRedirectTo] = useState(null);

  const update = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (k === 'password') calcStrength(e.target.value);
  };

  const calcStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setStrength(s);
  };

  const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const STRENGTH_COLORS = ['', '#EF4444', '#F59E0B', '#06B6D4', '#10B981'];

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phoneNumber || !form.password) {
      toast.error('All fields are required');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setSubmitting(true);
    try {
      // D04: register() returns the user object — use role to decide destination.
      // New accounts default to ROLE_USER server-side, so this will almost always
      // land on '/', but the check is here for correctness if an admin ever
      // registers a staff account via this form.
      const newUser = await register(form);
      toast.success('Account created! Welcome to EVENTzaa 🎉');
      // State-based redirect — avoids the race condition where navigate()
      // fires before React has committed the new token/user state from
      // AuthContext, which would cause RootLanding to see isAuthenticated=false
      // and immediately redirect back to /register.
      const destination = ['ADMIN', 'ORGANIZER'].includes(newUser?.role)
        ? '/dashboard'
        : '/';
      setRedirectTo(destination);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  // Render-time redirect — fires only after AuthContext state is committed.
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  const FIELDS = [
    { key: 'fullName', label: 'Full name', placeholder: 'John Doe', type: 'text', Icon: User, id: 'reg-name' },
    { key: 'email', label: 'Email address', placeholder: 'name@example.com', type: 'email', Icon: Mail, id: 'reg-email' },
    { key: 'phoneNumber', label: 'Phone number', placeholder: '+91 99999 99999', type: 'tel', Icon: Phone, id: 'reg-phone' },
  ];

  return (
    <div className="auth-page-root">
      {/* ── Aurora ──────────────────────────────────────────── */}
      <div className="auth-aurora" aria-hidden>
        {ORBS.map((o, i) => (
          <div key={i} className="aurora-orb" style={{
            width: o.w, height: o.h,
            top: o.top, left: o.left, right: o.right, bottom: o.bottom,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          }} />
        ))}
      </div>

      {/* ── Left panel ──────────────────────────────────────── */}
      <div className="auth-left-panel">
        <div className="auth-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=85&w=1400"
            alt="Event setup"
            className="auth-image"
          />
          <div className="auth-image-overlay" />
        </div>

        <div className="auth-left-content">
          <AppLogo />

          <div className="auth-left-body">
            <div className="auth-left-eyebrow">
              <span className="auth-live-dot" style={{ background: '#10B981' }} />
              Join the community
            </div>

            <h2 className="auth-left-headline">
              Start your event<br />
              <span className="auth-gradient-text">journey today.</span>
            </h2>

            <p className="auth-left-sub">
              Create your free account and unlock access to hundreds of curated
              live events, concerts, workshops, and more.
            </p>

            {/* Perks list */}
            <div className="auth-perks-list">
              {PERKS.map(p => (
                <div key={p} className="auth-perk-item">{p}</div>
              ))}
            </div>
          </div>

          <div className="auth-social-proof">
            <div className="auth-avatar-stack">
              {['#10B981', '#4F46E5', '#F59E0B', '#06B6D4'].map((c, i) => (
                <div key={i} className="auth-avatar-bubble" style={{ background: c, zIndex: 4 - i }}>
                  {String.fromCharCode(69 + i)}
                </div>
              ))}
            </div>
            <span className="auth-proof-text">
              <strong>500+</strong> events added every month
            </span>
          </div>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="auth-right-panel">
        <div className={`auth-form-card${shake ? ' auth-shake' : ''}`}>
          <div className="auth-mobile-logo">
            <AppLogo />
          </div>

          <div className="auth-form-header">
            <div className="auth-form-badge">
              <Shield size={14} />
              Free account, always
            </div>
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-sub">
              Get started in 30 seconds — no credit card needed.
            </p>
          </div>

          <form onSubmit={submit} className="auth-form-body" noValidate>
            {/* Standard fields */}
            {FIELDS.map(({ key, label, placeholder, type, Icon, id }) => (
              <div
                key={key}
                className={`auth-field${focused === key ? ' auth-field--focus' : ''}${form[key] ? ' auth-field--filled' : ''}`}
              >
                <label className="auth-field-label" htmlFor={id}>{label}</label>
                <div className="auth-field-wrap">
                  <Icon size={16} className="auth-field-icon" />
                  <input
                    id={id}
                    type={type}
                    className="auth-field-input"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={update(key)}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused('')}
                    disabled={busy}
                    autoComplete={key === 'email' ? 'email' : key === 'fullName' ? 'name' : 'tel'}
                  />
                </div>
              </div>
            ))}

            {/* Password + strength */}
            <div className={`auth-field${focused === 'password' ? ' auth-field--focus' : ''}${form.password ? ' auth-field--filled' : ''}`}>
              <label className="auth-field-label" htmlFor="reg-password">Password</label>
              <div className="auth-field-wrap">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="auth-field-input"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={update('password')}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  disabled={busy}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Hide' : 'Show'}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="auth-strength">
                  <div className="auth-strength-bars">
                    {[1, 2, 3, 4].map(n => (
                      <div
                        key={n}
                        className="auth-strength-bar"
                        style={{ background: n <= strength ? STRENGTH_COLORS[strength] : 'var(--line)' }}
                      />
                    ))}
                  </div>
                  <span style={{ color: STRENGTH_COLORS[strength], fontSize: 11, fontWeight: 600 }}>
                    {STRENGTH_LABELS[strength]}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={busy} id="register-submit">
              {busy ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Create free account
                  <ArrowRight size={18} className="auth-btn-arrow" />
                </>
              )}
            </button>

            <div className="auth-divider">
              <span />
              <p>Already have an account?</p>
              <span />
            </div>

            <Link to="/login" className="auth-register-btn">
              Sign in instead
            </Link>
          </form>

          <div className="auth-trust-row">
            <span><Zap size={12} /> Instant setup</span>
            <span><Shield size={12} /> SSL secured</span>
            <span><Star size={12} /> Free forever</span>
          </div>
        </div>
      </div>
    </div>
  );
}
