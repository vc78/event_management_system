import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap, Shield, Star } from 'lucide-react';
import AppLogo from '../../components/common/AppLogo.jsx';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

/* ── Animated feature badge ──────────────────────────────────── */
const FEATURES = [
  { icon: '🎟️', label: 'Book Tickets Instantly' },
  { icon: '📍', label: 'Discover Live Events' },
  { icon: '📊', label: 'Track Your Bookings' },
  { icon: '🔒', label: 'Secure & Private' },
];

/* ── Floating orb positions ──────────────────────────────────── */
const ORBS = [
  { w: 500, h: 500, top: '-120px', left: '-120px', color: 'rgba(79,70,229,0.35)' },
  { w: 350, h: 350, top: '40%', right: '-80px', color: 'rgba(6,182,212,0.25)' },
  { w: 280, h: 280, bottom: '-60px', left: '30%', color: 'rgba(245,158,11,0.2)' },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const [featureIdx, setFeatureIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  // redirectTo is set AFTER auth state is committed — avoids race condition.
  const [redirectTo, setRedirectTo] = useState(null);

  /* Cycle feature badges */
  useEffect(() => {
    const t = setInterval(() => setFeatureIdx(i => (i + 1) % FEATURES.length), 2500);
    return () => clearInterval(t);
  }, []);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Both fields are required');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setSubmitting(true);
    try {
      // D04: login() returns the user object — use role to decide destination.
      // Respect location.state.from when present (e.g. bounced from a protected page).
      const loggedInUser = await login(form);
      toast.success('Welcome back! 🎉');
      // state.from is set when ProtectedRoute bounced the user to /login.
      // Never restore to /register (avoids loops when user clicks 'sign in' from register page).
      const from = location.state?.from?.pathname;
      const safeFrom = from && from !== '/register' ? from : null;
      const roleDefault = ['ADMIN', 'ORGANIZER'].includes(loggedInUser?.role)
        ? '/dashboard'
        : '/';
      // State-based redirect — fires on next render after auth state is committed.
      setRedirectTo(safeFrom ?? roleDefault);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  // Render-time redirect — fires only after AuthContext state is committed.
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return (
    <div className="auth-page-root">
      {/* ── Background aurora ─────────────────────────────────── */}
      <div className="auth-aurora" aria-hidden>
        {ORBS.map((o, i) => (
          <div key={i} className="aurora-orb" style={{
            width: o.w, height: o.h,
            top: o.top, left: o.left, right: o.right, bottom: o.bottom,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          }} />
        ))}
      </div>

      {/* ── Left panel: brand / visual ───────────────────────── */}
      <div className="auth-left-panel">
        {/* Immersive concert image */}
        <div className="auth-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=85&w=1400"
            alt="Live event crowd"
            className="auth-image"
          />
          <div className="auth-image-overlay" />
        </div>

        {/* Overlay content */}
        <div className="auth-left-content">
          <AppLogo />

          <div className="auth-left-body">
            <div className="auth-left-eyebrow">
              <span className="auth-live-dot" />
              Platform of record for live events
            </div>

            <h2 className="auth-left-headline">
              Your next unforgettable<br />
              <span className="auth-gradient-text">experience awaits.</span>
            </h2>

            <p className="auth-left-sub">
              Join thousands of event-goers and organizers who trust EVENTzaa
              to discover, book, and manage live experiences.
            </p>

            {/* Animated feature badges */}
            <div className="auth-feature-strip">
              {FEATURES.map((f, i) => (
                <div
                  key={f.label}
                  className={`auth-feature-badge${i === featureIdx ? ' auth-feature-badge--active' : ''}`}
                >
                  <span>{f.icon}</span> {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* Social proof strip */}
          <div className="auth-social-proof">
            <div className="auth-avatar-stack">
              {['#4F46E5', '#06B6D4', '#F59E0B', '#10B981'].map((c, i) => (
                <div key={i} className="auth-avatar-bubble" style={{ background: c, zIndex: 4 - i }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="auth-proof-text">
              <strong>12,000+</strong> event enthusiasts already on board
            </span>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────── */}
      <div className="auth-right-panel">
        <div className={`auth-form-card${shake ? ' auth-shake' : ''}`}>
          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <AppLogo />
          </div>

          {/* Header */}
          <div className="auth-form-header">
            <div className="auth-form-badge">
              <Shield size={14} />
              Secure sign-in
            </div>
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-sub">
              Sign in to your EVENTzaa account to manage events and bookings.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="auth-form-body" noValidate>
            {/* Email field */}
            <div className={`auth-field${focused === 'email' ? ' auth-field--focus' : ''}${form.email ? ' auth-field--filled' : ''}`}>
              <label className="auth-field-label" htmlFor="login-email">
                Email address
              </label>
              <div className="auth-field-wrap">
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="auth-field-input"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={update('email')}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  disabled={busy}
                />
              </div>
            </div>

            {/* Password field */}
            <div className={`auth-field${focused === 'password' ? ' auth-field--focus' : ''}${form.password ? ' auth-field--filled' : ''}`}>
              <div className="auth-field-label-row">
                <label className="auth-field-label" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-forgot-link"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-field-wrap">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="auth-field-input"
                  placeholder="••••••••"
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
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={busy}
              id="login-submit"
            >
              {busy ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Sign in securely
                  <ArrowRight size={18} className="auth-btn-arrow" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span />
              <p>New to EVENTzaa?</p>
              <span />
            </div>

            {/* Register link */}
            <Link to="/register" className="auth-register-btn">
              Create a free account
            </Link>
          </form>

          {/* Trust footer */}
          <div className="auth-trust-row">
            <span><Zap size={12} /> Instant access</span>
            <span><Shield size={12} /> SSL secured</span>
            <span><Star size={12} /> Free forever</span>
          </div>
        </div>
      </div>
    </div>
  );
}
