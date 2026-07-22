import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Pill, 
  ShieldAlert, 
  FileText,
  UserCheck
} from 'lucide-react';

export default function NotificationCenter({ alerts, onResolveAlert }) {
  const [mockNotifs, setMockNotifs] = useState([
    { id: '1', type: 'Medication', message: 'Reminder: It is time to take Lisinopril 10mg (Scheduled: 08:00 AM)', time: '1 hour ago', read: false, icon: Pill, color: 'var(--color-primary)' },
    { id: '2', type: 'Scanner', message: 'OCR scan completed. 3 medications identified and reviewed.', time: '2 hours ago', read: true, icon: FileText, color: 'var(--color-info)' },
    { id: '3', type: 'Family', message: 'Invitation accepted: son.doe@example.com is now viewing your health charts.', time: '1 day ago', read: true, icon: UserCheck, color: 'var(--color-success)' }
  ]);

  const handleMarkAllRead = () => {
    const updated = mockNotifs.map(n => ({ ...n, read: true }));
    setMockNotifs(updated);
    // Resolve all active database alerts too
    alerts.forEach(a => onResolveAlert(a._id));
  };

  const handleDeleteNotif = (id) => {
    setMockNotifs(mockNotifs.filter(n => n.id !== id));
  };

  const handleMarkSingleRead = (id) => {
    setMockNotifs(mockNotifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = mockNotifs.filter(n => !n.read).length + alerts.length;

  return (
    <div className="glass-panel animate-fade-in">
      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '20px' }}>
        <div className="flex-gap">
          <Bell size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Notification Center</h3>
          {unreadCount > 0 && (
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{unreadCount} New</span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead} 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Active Database warning alerts */}
        {alerts.map(alert => (
          <div 
            key={alert._id} 
            className={`alert-card ${alert.severity === 'Critical' ? 'critical' : 'warning'}`}
            style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}
          >
            <div style={{
              color: alert.severity === 'Critical' ? 'var(--color-danger)' : 'var(--color-warning)',
              background: alert.severity === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              padding: '10px',
              borderRadius: '50%'
            }}>
              <ShieldAlert size={20} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{alert.type} Alert</span>
                <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>{alert.severity}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{alert.message}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>

            <button 
              onClick={() => onResolveAlert(alert._id)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Dismiss
            </button>
          </div>
        ))}

        {/* Regular Mock Notifications */}
        {mockNotifs.map(notif => {
          const Icon = notif.icon;
          return (
            <div 
              key={notif.id} 
              className="alert-card"
              style={{ 
                padding: '16px', 
                display: 'flex', 
                gap: '16px', 
                alignItems: 'center',
                opacity: notif.read ? 0.7 : 1,
                borderLeft: '4px solid ' + (notif.read ? 'transparent' : 'var(--color-primary)')
              }}
            >
              <div style={{
                color: notif.color,
                background: notif.color + '1a',
                padding: '10px',
                borderRadius: '50%'
              }}>
                <Icon size={20} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{notif.type}</span>
                  {!notif.read && (
                    <button 
                      onClick={() => handleMarkSingleRead(notif.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.7rem', textDecoration: 'underline' }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{notif.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</span>
              </div>

              <button 
                onClick={() => handleDeleteNotif(notif.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}

        {alerts.length === 0 && mockNotifs.length === 0 && (
          <div className="flex-center" style={{ height: '220px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
            <Bell size={44} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <span>Your notifications drawer is completely clean!</span>
          </div>
        )}

      </div>
    </div>
  );
}
