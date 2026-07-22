import React from 'react';
import { Bell, HeartPulse, RefreshCw } from 'lucide-react';

export default function Navbar({ title, alertsCount, hasCriticalAlert, onQuickLog, onRefresh, onNavigateNotifications }) {
  return (
    <header className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderRadius: '16px',
      marginBottom: '24px',
      border: '1px solid var(--border-light)',
      background: 'var(--bg-panel)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{title}</h2>
      </div>

      <div className="flex-gap" style={{ gap: '16px' }}>
        {/* Sync status */}
        <button 
          onClick={onRefresh}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-light)',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          title="Refresh Data"
        >
          <RefreshCw size={18} />
        </button>

        {/* Alerts Badge */}
        <div 
          onClick={onNavigateNotifications}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div 
            className={hasCriticalAlert ? 'pulse-glow-danger' : ''}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-light)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hasCriticalAlert ? 'var(--color-danger)' : 'var(--text-secondary)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Bell size={18} />
          </div>
          {alertsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: hasCriticalAlert ? 'var(--color-danger)' : 'var(--color-warning)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
            }}>
              {alertsCount}
            </span>
          )}
        </div>

        {/* Quick Log Action */}
        <button 
          onClick={onQuickLog}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <HeartPulse size={16} />
          <span>Quick Log</span>
        </button>
      </div>
    </header>
  );
}
