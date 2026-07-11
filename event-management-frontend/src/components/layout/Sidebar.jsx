/**
 * Sidebar — D06 (defense-in-depth role guard)
 *
 * Nav items for /dashboard/** are ONLY rendered for ADMIN and ORGANIZER roles.
 * RoleProtectedRoute (D05) is the real gate; this component just ensures
 * the sidebar itself is honest about who it serves — if it ever gets reused
 * in a public layout, it won't accidentally expose admin links to plain users.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tags,
  MapPin,
  CalendarDays,
  Ticket,
  LogOut,
  Tv,
  Map,
  Sparkles,
  UserCheck
} from 'lucide-react';
import AppLogo from '../common/AppLogo.jsx';
import useAuth from '../../hooks/useAuth.js';

// ── Nav item definitions ─────────────────────────────────────────────────────
const ADMIN_ORG_ITEMS = [
  { to: '/dashboard',              label: 'Overview',        icon: LayoutDashboard, end: true },
  { to: '/dashboard/events',       label: 'Events Manager',  icon: CalendarDays },
  { to: '/dashboard/venues',       label: 'Venues Config',   icon: MapPin },
  { to: '/dashboard/categories',   label: 'Categories',      icon: Tags },
  { to: '/dashboard/bookings',     label: 'Bookings Logs',   icon: Ticket },
  { to: '/dashboard/engagement',   label: 'Engagement Room', icon: Tv },
  { to: '/dashboard/venue-map',    label: 'Venue Map',       icon: Map },
  { to: '/dashboard/marketplace',  label: 'Sponsor Market',  icon: Sparkles },
  { to: '/dashboard/check-in',     label: 'Check-In Gate',   icon: UserCheck },
];

// Browse Events is always visible at the top (public link back to homepage)
const PUBLIC_ITEMS = [
  { to: '/browse', label: 'Browse Events', icon: CalendarDays },
];

// ────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ onNavClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/register', { replace: true });
  };

  // D06: Only ADMIN and ORGANIZER see dashboard management links.
  // This is a defense-in-depth guard — RoleProtectedRoute (D05) is the
  // authoritative gate at the routing layer; this ensures the sidebar
  // never renders admin links if it were ever reused outside that gate.
  const isAdminOrOrg = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const navItems = isAdminOrOrg
    ? [...PUBLIC_ITEMS, ...ADMIN_ORG_ITEMS]
    : PUBLIC_ITEMS;

  return (
    <aside className="sidebar">
      <div className="px-5 py-6">
        <AppLogo />
      </div>

      <nav className="flex-1 px-3" style={{ overflowY: 'auto' }}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* User chip */}
        <div className="user-chip">
          <div className="avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <div className="text-sm" style={{ fontWeight: 600 }}>
              {user?.fullName ?? 'Guest'}
            </div>
            <div className="muted text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: user?.role === 'ADMIN' ? '#F59E0B'
                    : user?.role === 'ORGANIZER' ? '#06B6D4'
                    : '#10B981',
                  flexShrink: 0,
                }}
              />
              {user?.role ?? 'USER'}
            </div>
          </div>
        </div>

        <button
          className="nav-link w-full mt-2"
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
