import React from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  HeartPulse, 
  Pill, 
  Camera, 
  MessageSquare, 
  TrendingUp, 
  Bell, 
  ShieldAlert, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, onLogout, user }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'trackers', name: 'Health Trackers', icon: HeartPulse },
    { id: 'medications', name: 'Medications', icon: Pill },
    { id: 'prescription-scanner', name: 'Prescription Scan', icon: Camera },
    { id: 'ai-assistant', name: 'AI Diagnostics', icon: MessageSquare },
    { id: 'insights', name: 'Analytics & Reports', icon: TrendingUp },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'sos', name: 'Utilities & SOS', icon: ShieldAlert },
    { id: 'settings', name: 'Settings & Profile', icon: Settings },
  ];

  return (
    <div className="sidebar glass-panel" style={{
      width: '260px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none',
      zIndex: 100,
      padding: '24px 16px'
    }}>
      {/* Logo */}
      <div className="flex-gap" style={{ marginBottom: '32px', padding: '0 8px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
          <Activity size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'white', lineHeight: 1.1 }}>
            VitalTrack
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
            AI Health Tracker
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '10px',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: isActive ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer info & logout */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {user && (
          <div style={{ padding: '0 8px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>
              {user.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              {user.email}
            </div>
          </div>
        )}

        <button
          onClick={() => setCurrentPage('logout')}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            fontSize: '0.85rem'
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
