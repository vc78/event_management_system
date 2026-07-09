import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
export default function useAuth(){ const c = useContext(AuthContext); if(!c) throw new Error('useAuth must be used within AuthProvider'); return c; }
