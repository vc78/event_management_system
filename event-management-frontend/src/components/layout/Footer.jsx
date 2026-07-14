/**
 * Footer — Beautiful, responsive system-wide footer.
 * Renders in both public layouts and dashboard shells.
 * - 4-column layout: Brand | Navigate | Features | Platform Telemetry
 * - Responsive: 2-col on tablet, 1-col on mobile
 * - Animated social icons, pulsing live status, heartbeat copyright
 */
import { Link } from 'react-router-dom';
import AppLogo from '../common/AppLogo.jsx';
import {
  Github, Twitter, Linkedin, Heart, Shield, Cpu,
  Zap, CalendarDays, Ticket, MapPin, Tv, ShieldCheck
} from 'lucide-react';

const FEATURES = [
  { icon: Zap,         label: 'Real-Time Websockets' },
  { icon: CalendarDays,label: 'Instant Booking Engine' },
  { icon: Ticket,      label: 'Digital Ticket QR' },
  { icon: MapPin,      label: 'Live Venue Heatmaps' },
  { icon: Tv,          label: 'HLS Stream Integration' },
  { icon: ShieldCheck, label: 'GDPR-Compliant NFC' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="footer-wrap">
        <div className="footer-grid">

          {/* ── Brand Column ── */}
          <div className="footer-brand-col">
            <AppLogo />
            <p className="footer-desc mt-3">
              India's premier real-time event booking and live engagement platform. Discover workshops, concerts, and tech summits — all in one place.
            </p>
            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="GitHub">
                <Github size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* ── Navigate Column ── */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Navigate</h4>
            <ul className="footer-list">
              <li><Link to="/browse"       className="footer-link">Browse Events</Link></li>
              <li><Link to="/my-bookings"  className="footer-link">My Bookings</Link></li>
              <li><Link to="/dashboard"    className="footer-link">Control Dashboard</Link></li>
              <li><Link to="/login"        className="footer-link">Sign In</Link></li>
              <li><Link to="/register"     className="footer-link">Create Account</Link></li>
            </ul>
          </div>

          {/* ── Features Column ── */}
          <div className="footer-features-col">
            <h4 className="footer-heading">Platform Features</h4>
            <ul className="footer-feature-list">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="footer-feature-item">
                  <Icon size={13} className="footer-feature-icon" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Platform Telemetry Column ── */}
          <div className="footer-status-col">
            <h4 className="footer-heading">System Status</h4>
            <div className="footer-status-card">
              <div className="footer-status-row">
                <span className="status-indicator status-indicator--live" />
                <span className="status-text">WebSockets Live</span>
              </div>
              <div className="footer-status-divider" />
              <div className="footer-status-row">
                <Cpu size={12} style={{ color: 'var(--ash)', flexShrink: 0 }} />
                <span className="status-label">Database:</span>
                <span className="status-val text-success">Healthy</span>
              </div>
              <div className="footer-status-row">
                <Shield size={12} style={{ color: 'var(--ash)', flexShrink: 0 }} />
                <span className="status-label">GDPR:</span>
                <span className="status-val text-amber">Active</span>
              </div>
              <div className="footer-status-row">
                <Zap size={12} style={{ color: 'var(--ash)', flexShrink: 0 }} />
                <span className="status-label">HMR Server:</span>
                <span className="status-val" style={{ color: '#60a5fa' }}>Running</span>
              </div>
            </div>

            {/* Tech stack badge row */}
            <div className="footer-tech-badges">
              <span className="footer-tech-badge">Spring Boot</span>
              <span className="footer-tech-badge">React 18</span>
              <span className="footer-tech-badge">WebSockets</span>
            </div>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {currentYear} EVENTzaa · All rights reserved
          </div>
          <div className="footer-legal-links">
            <span className="footer-legal-link">Privacy Policy</span>
            <span className="footer-legal-sep">·</span>
            <span className="footer-legal-link">Terms of Service</span>
            <span className="footer-legal-sep">·</span>
            <span className="footer-legal-link">Cookie Policy</span>
          </div>
          <div className="footer-heart">
            Crafted with <Heart size={12} className="heart-icon" /> by Antigravity
          </div>
        </div>
      </div>
    </footer>
  );
}
