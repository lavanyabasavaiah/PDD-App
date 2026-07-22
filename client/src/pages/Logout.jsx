import React, { useEffect } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';

export default function Logout({ onLogout }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLogout();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onLogout]);

  return (
    <div className="flex-center animate-fade-in" style={{
      height: '100vh',
      width: '100vw',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        padding: '24px',
        borderRadius: '50%',
        color: 'var(--color-primary)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LogOut size={44} style={{ animation: 'pulseGlow 1.5s infinite' }} />
      </div>
      
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
        Logging Out Securely
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
        <span>Clearing session tokens and caches...</span>
      </p>
    </div>
  );
}
