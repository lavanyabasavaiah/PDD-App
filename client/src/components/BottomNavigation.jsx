import React from 'react';
import { 
  LayoutDashboard, 
  HeartPulse, 
  Pill, 
  MessageSquare, 
  AlertTriangle 
} from 'lucide-react';

export default function BottomNavigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'trackers', name: 'Trackers', icon: HeartPulse },
    { id: 'medications', name: 'Meds', icon: Pill },
    { id: 'ai-assistant', name: 'AI Chat', icon: MessageSquare },
    { id: 'sos', name: 'SOS', icon: AlertTriangle, critical: true }
  ];

  return (
    <div className="bottom-nav glass-panel" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '64px',
      borderRadius: 0,
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '8px 16px',
      display: 'none', // Controlled by CSS media queries
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 500,
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)'
    }}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id || (item.id === 'trackers' && currentPage.startsWith('tracker-'));
        const isCritical = item.critical;

        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: isCritical
                ? 'var(--color-danger)'
                : isActive 
                  ? 'var(--color-primary)' 
                  : 'var(--text-secondary)',
              cursor: 'pointer',
              flex: 1,
              transition: 'var(--transition-smooth)',
              gap: '4px'
            }}
          >
            <div style={{
              background: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'none',
              padding: isCritical ? '6px 12px' : '0',
              borderRadius: isCritical ? '20px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isCritical ? 'pulseDangerGlow 2s infinite ease-in-out' : 'none'
            }}>
              <Icon size={isCritical ? 18 : 20} />
            </div>
            {!isCritical && (
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 500 }}>
                {item.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
