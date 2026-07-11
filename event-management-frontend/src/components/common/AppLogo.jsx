import { Link } from 'react-router-dom';

/**
 * EVENTzaa Brand Logo — SVG inline, responsive.
 * Orbital ring animation + gradient wordmark.
 */
export default function AppLogo({ size = 'md', linked = true }) {
  const sizes = {
    sm: { icon: 28, fontSize: 13, subSize: 8 },
    md: { icon: 36, fontSize: 15, subSize: 9 },
    lg: { icon: 48, fontSize: 20, subSize: 11 },
  };
  const s = sizes[size] || sizes.md;

  const Logo = (
    <div className="ez-logo" style={{ '--icon-size': `${s.icon}px` }}>
      {/* Orbital SVG icon */}
      <div className="ez-logo-icon" style={{ width: s.icon, height: s.icon }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
          aria-hidden
        >
          {/* Outer ring */}
          <ellipse
            cx="24" cy="24" rx="22" ry="10"
            stroke="url(#ring1)" strokeWidth="1.6"
            fill="none" strokeDasharray="2 1"
            className="ez-ring ez-ring-1"
          />
          {/* Middle ring rotated */}
          <ellipse
            cx="24" cy="24" rx="22" ry="10"
            stroke="url(#ring2)" strokeWidth="1.4"
            fill="none"
            transform="rotate(60 24 24)"
            className="ez-ring ez-ring-2"
          />
          {/* Inner ring rotated */}
          <ellipse
            cx="24" cy="24" rx="22" ry="10"
            stroke="url(#ring3)" strokeWidth="1.2"
            fill="none" strokeDasharray="3 2"
            transform="rotate(120 24 24)"
            className="ez-ring ez-ring-3"
          />
          {/* Center dot */}
          <circle cx="24" cy="24" r="3" fill="url(#centerGrad)" className="ez-center-dot" />
          {/* Orbit particle */}
          <circle cx="46" cy="24" r="2" fill="#06B6D4" className="ez-particle" />

          <defs>
            <linearGradient id="ring1" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="ring2" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="1" stopColor="#10B981" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="ring3" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" stopOpacity="0.5" />
              <stop offset="1" stopColor="#4F46E5" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop stopColor="#06B6D4" />
              <stop offset="1" stopColor="#4F46E5" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      <div className="ez-logo-text">
        <div className="ez-logo-name" style={{ fontSize: s.fontSize }}>
          <span className="ez-event">EVENT</span><span className="ez-zaa">zaa</span>
        </div>
        <div className="ez-logo-sub" style={{ fontSize: s.subSize }}>
          Event Management
        </div>
      </div>
    </div>
  );

  if (!linked) return Logo;

  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      {Logo}
    </Link>
  );
}
