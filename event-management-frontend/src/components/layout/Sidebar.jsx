import { NavLink } from 'react-router-dom';
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

const NAV_ITEMS = [
  { to: '/', label: 'Browse Events', icon: CalendarDays, end: true },
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/events', label: 'Events Manager', icon: CalendarDays },
  { to: '/dashboard/venues', label: 'Venues Config', icon: MapPin },
  { to: '/dashboard/categories', label: 'Categories Config', icon: Tags },
  { to: '/dashboard/bookings', label: 'Bookings Logs', icon: Ticket },
  { to: '/dashboard/engagement', label: 'Engagement Room', icon: Tv },
  { to: '/dashboard/venue-map', label: 'Venue Map & Flow', icon: Map },
  { to: '/dashboard/marketplace', label: 'Sponsor Market', icon: Sparkles },
  { to: '/dashboard/check-in', label: 'Check-In Gate', icon: UserCheck }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  // Filter navbar links dynamically by logging role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.to === '/') return true; // Everyone can see Browse Events

    if (user?.role === 'ADMIN' || user?.role === 'ORGANIZER') {
      return true; // Admins/Organizers see all platform dashboards
    }
    
    if (user?.role === 'SPONSOR') {
      // Sponsors see their ROI dashboard and the Live expo map
      return item.to === '/dashboard' || item.to === '/dashboard/venue-map';
    }
    
    if (user?.role === 'USER') {
      // General attendees see their booked schedules hub, live streams, wayfinder, and affiliate links
      return (
        item.to === '/dashboard' ||
        item.to === '/dashboard/engagement' ||
        item.to === '/dashboard/venue-map' ||
        item.to === '/dashboard/marketplace'
      );
    }
    
    return false;
  });

  return (
    <aside className="sidebar">
      <div className="px-5 py-6">
        <AppLogo />
      </div>
      
      <nav className="flex-1 px-3" style={{ overflowY: 'auto' }}>
        {filteredNavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink 
            key={to} 
            to={to} 
            end={end} 
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <Icon size={16} /> 
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <div className="text-sm" style={{ fontWeight: 600 }}>{user?.fullName ?? 'Guest'}</div>
            <div className="muted text-xs">{user?.email ?? ''}</div>
          </div>
        </div>
        
        <button className="nav-link w-full mt-2" onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={16} /> 
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
