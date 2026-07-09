import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
export default function ProtectedRoute({ children, roles=[] }) {
 const { isAuthenticated, isLoading, user } = useAuth(); const location = useLocation();
 if(isLoading) return <div className="center-screen">Loading...</div>;
 if(!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }}/>;
 if(roles.length && !roles.includes(user?.role)) return <Navigate to="/" replace/>;
 return children;
}
