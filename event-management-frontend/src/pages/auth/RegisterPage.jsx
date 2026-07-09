import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLogo from '../../components/common/AppLogo.jsx';
import GradientButton from '../../components/common/GradientButton.jsx';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phoneNumber || !form.password) {
      toast.error('All fields are required');
      return;
    }
    try {
      await register(form);
      toast.success('Account created successfully');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-split-layout">
      <div className="auth-split-image">
        <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200" alt="Event setup" />
        <div className="auth-split-overlay">
          <div className="auth-quote">
            <p>"Create incredible experiences and manage everything in one powerful platform."</p>
            <span>Event Control Room</span>
          </div>
        </div>
      </div>
      
      <div className="auth-form-pane">
        <div className="auth-form-container">
          <div className="auth-logo-mobile">
            <AppLogo />
          </div>
          
          <AppLogo />
          <h1 className="page-title" style={{ marginTop: '32px' }}>Create account</h1>
          <p className="muted mb-8" style={{ fontSize: '15px' }}>Start managing events and booking tickets.</p>
          
          <form onSubmit={submit} className="stack">
            <div>
              <label className="label-text">Full Name</label>
              <input 
                className="input-field" 
                placeholder="John Doe" 
                value={form.fullName} 
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            
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
              <label className="label-text">Phone Number</label>
              <input 
                className="input-field" 
                placeholder="+1 (555) 000-0000" 
                value={form.phoneNumber} 
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
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
              Create account
            </GradientButton>
          </form>
          
          <p className="muted mt-8 text-sm text-center" style={{ textAlign: 'center' }}>
            Already have an account? <Link className="top-link font-semibold" to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
