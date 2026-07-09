import { createContext, useMemo, useState } from 'react';
import * as authApi from '../api/authApi.js';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ems_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('ems_token'));
  const [isLoading, setIsLoading] = useState(false);
  const normalize = (d) => ({ id:d.id, email:d.email, fullName:d.fullName, role:d.role });
  const login = async (payload) => { setIsLoading(true); try { const d=await authApi.login(payload); const u=normalize(d); localStorage.setItem('ems_token', d.token); localStorage.setItem('ems_user', JSON.stringify(u)); setToken(d.token); setUser(u); return u; } finally { setIsLoading(false);} };
  const register = async (payload) => { setIsLoading(true); try { const d=await authApi.register(payload); const u=normalize(d); localStorage.setItem('ems_token', d.token); localStorage.setItem('ems_user', JSON.stringify(u)); setToken(d.token); setUser(u); return u; } finally { setIsLoading(false);} };
  const logout = () => { localStorage.removeItem('ems_token'); localStorage.removeItem('ems_user'); setToken(null); setUser(null); };
  const value = useMemo(()=>({user, token, isAuthenticated:!!token, isLoading, login, register, logout}),[user,token,isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
