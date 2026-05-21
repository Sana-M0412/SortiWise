import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, ShieldAlert, Sparkles } from 'lucide-react';

export default function Auth({ onAuthSuccess, onGuestMode }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        if (error) throw error;
        setSuccessMsg('Account registered successfully! Please log in.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data?.user) {
          onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-grid"></div>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--accent-bg)', marginBottom: '12px' }}>
            ♻️
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }} className="gradient-text">
            {isSignUp ? 'Create Eco Account' : 'Access SortiWise'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            Sync logs, track achievements, and save your streak.
          </p>
        </div>

        {!supabase && (
          <div className="glass-card" style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.3)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldAlert size={20} color="var(--ewaste)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--ewaste)', fontWeight: '600' }}>Cloud Sync Offline</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Supabase keys are not set up. Click "Continue as Guest" to store your logs locally.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--hazardous)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--compostable)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={!supabase}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!supabase}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!supabase}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.9rem' }}
            />
          </div>

          <button 
            type="submit" 
            className="neon-glow-btn"
            disabled={!supabase || loading}
            style={{ padding: '12px', borderRadius: '8px', fontSize: '0.95rem', marginTop: '8px' }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', textAlign: 'center' }}>
          {supabase && (
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          )}

          <button 
            type="button" 
            onClick={onGuestMode}
            className="secondary-btn"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '0.95rem', gap: '8px' }}
          >
            <Sparkles size={16} color="var(--compostable)" /> Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
