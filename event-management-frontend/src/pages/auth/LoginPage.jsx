import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppLogo from '../../components/common/AppLogo.jsx';
import GradientButton from '../../components/common/GradientButton.jsx';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email and password are required');
      return;
    }
    try {
      await login(form);
      toast.success('Logged in successfully');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-split-layout">
      <div className="auth-split-image">
        <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200" alt="Event crowd" />
        <div className="auth-split-overlay">
          <div className="auth-quote">
            <p>"The best events are the ones where everything flows seamlessly behind the scenes."</p>
            <span>Event Control Room</span>
          </div>
        </div>
      </div>
      
      <div className="auth-form-pane">
        <div className="auth-form-container">
          <div className="auth-logo-mobile">
            <AppLogo />
          </div>
          
          <div className="hidden-mobile mb-6" style={{ display: 'none' }}>
             <AppLogo />
          </div>
          <AppLogo />
          
          <h1 className="page-title" style={{ marginTop: '32px' }}>Welcome back</h1>
          <p className="muted mb-8" style={{ fontSize: '15px' }}>Sign in to manage events and your bookings.</p>
          
          <form onSubmit={submit} className="stack">
            <div>
              <label className="label-text">Email Address</label>
              <input 
                className="input-field" 
                placeholder="name@example.com" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input 
                className="input-field" 
                placeholder="••••••••" 
                type="password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <GradientButton isLoading={isLoading} fullWidth className="mt-6" style={{ padding: '16px', fontSize: '16px' }}>
              Sign in securely
            </GradientButton>
          </form>
          
          <p className="muted mt-8 text-sm text-center" style={{ textAlign: 'center' }}>
            Don't have an account? <Link className="top-link font-semibold" to="/register">Create one now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
