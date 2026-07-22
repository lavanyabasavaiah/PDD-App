import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import VitalsEntry from './pages/VitalsEntry';
import MedicationManager from './pages/MedicationManager';
import MedicalProfile from './pages/MedicalProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// New Screens / Modules
import OnboardingWizard from './pages/OnboardingWizard';
import Trackers from './pages/Trackers';
import PrescriptionScanner from './pages/PrescriptionScanner';
import AIAssistant from './pages/AIAssistant';
import HealthInsights from './pages/HealthInsights';
import UtilityHub from './pages/UtilityHub';
import NotificationCenter from './pages/NotificationCenter';
import Settings from './pages/Settings';
import Logout from './pages/Logout';
import BottomNavigation from './components/BottomNavigation';

import { HeartPulse, X, Pill } from 'lucide-react';
import './App.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [preAuthStage, setPreAuthStage] = useState(
    localStorage.getItem('hasSeenOnboarding') ? 'login' : 'splash'
  );
  
  // UI Notification State
  const [activeReminder, setActiveReminder] = useState(null);

  // Data States
  const [vitals, setVitals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insight, setInsight] = useState(null);

  // UI State
  const [showQuickLog, setShowQuickLog] = useState(false);

  // Quick Log Form States
  const [qSystolic, setQSystolic] = useState('');
  const [qDiastolic, setQDiastolic] = useState('');
  const [qHeartRate, setQHeartRate] = useState('');
  const [qTemp, setQTemp] = useState('');
  const [qSpO2, setQSpO2] = useState('');

  // Fetch all dashboard data when token is present
  const fetchDashboardData = async (jwtToken = token) => {
    if (!jwtToken) return;
    
    const headers = {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // Fetch Vitals
      const vitalsRes = await fetch('http://localhost:5000/api/vitals', { headers });
      if (vitalsRes.ok) {
        const vitalsData = await vitalsRes.json();
        setVitals(vitalsData);
      }

      // Fetch Medications
      const medsRes = await fetch('http://localhost:5000/api/medications', { headers });
      if (medsRes.ok) {
        const medsData = await medsRes.json();
        setMedications(medsData);
      }

      // Fetch Alerts
      const alertsRes = await fetch('http://localhost:5000/api/alerts', { headers });
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      // Fetch Latest Insight
      const insightRes = await fetch('http://localhost:5000/api/insights/latest', { headers });
      if (insightRes.ok) {
        const insightData = await insightRes.json();
        setInsight(insightData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Check scheduled medications for reminder popup
  useEffect(() => {
    if (!token || medications.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHourMin = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const todayStr = now.toISOString().split('T')[0];

      medications.forEach(med => {
        if (!med.active) return;
        med.times.forEach(time => {
          if (time === currentHourMin) {
            const logged = med.logs.some(l => l.date === todayStr && l.time === time);
            if (!logged && (!activeReminder || activeReminder.id !== med._id)) {
              setActiveReminder({
                id: med._id,
                name: med.name,
                dosage: med.dosage,
                time
              });
            }
          }
        });
      });
    }, 15000); // check every 15s

    return () => clearInterval(interval);
  }, [token, medications, activeReminder]);

  // Advanced data maintenance wipe
  const handleClearDatabase = async () => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    try {
      for (const vital of vitals) {
        await fetch(`http://localhost:5000/api/vitals/${vital._id}`, {
          method: 'DELETE',
          headers
        });
      }
      setVitals([]);
      setAlerts([]);
      setInsight(null);
      alert('Local vital log database cleared successfully.');
    } catch (err) {
      console.error(err);
      alert('Error clearing logs.');
    }
  };

  // Auth Handlers
  const handleLogin = (newToken, loggedUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setToken(newToken);
    setUser(loggedUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setVitals([]);
    setMedications([]);
    setAlerts([]);
    setInsight(null);
  };

  // Vital Operations
  const handleAddVital = async (vitalData) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch('http://localhost:5000/api/vitals', {
      method: 'POST',
      headers,
      body: JSON.stringify(vitalData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to log vitals');
    }

    // Refresh data
    await fetchDashboardData();
  };

  const handleDeleteVital = async (vitalId) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch(`http://localhost:5000/api/vitals/${vitalId}`, {
      method: 'DELETE',
      headers
    });

    if (res.ok) {
      setVitals(vitals.filter(v => v._id !== vitalId));
    }
  };

  // Medication Operations
  const handleAddMedication = async (medData) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch('http://localhost:5000/api/medications', {
      method: 'POST',
      headers,
      body: JSON.stringify(medData)
    });

    if (res.ok) {
      await fetchDashboardData();
    }
  };

  const handleDeleteMedication = async (medId) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch(`http://localhost:5000/api/medications/${medId}`, {
      method: 'DELETE',
      headers
    });

    if (res.ok) {
      setMedications(medications.filter(m => m._id !== medId));
    }
  };

  const handleToggleMedActive = async (medId, newStatus) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch(`http://localhost:5000/api/medications/${medId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ active: newStatus })
    });

    if (res.ok) {
      await fetchDashboardData();
    }
  };

  const handleLogMedicationStatus = async (medId, time, status) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const res = await fetch(`http://localhost:5000/api/medications/${medId}/log`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ date: todayStr, time, status })
    });

    if (res.ok) {
      await fetchDashboardData();
    }
  };

  // Alert operations
  const handleResolveAlert = async (alertId) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch(`http://localhost:5000/api/alerts/${alertId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'Resolved' })
    });

    if (res.ok) {
      setAlerts(alerts.filter(a => a._id !== alertId));
    }
  };

  // Insight Operations
  const handleTriggerInsight = async () => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch('http://localhost:5000/api/insights/analyze', {
      method: 'POST',
      headers
    });

    if (res.ok) {
      const data = await res.json();
      setInsight(data);
    }
  };

  // Profile Operations
  const handleUpdateProfile = async (profileData) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  // Quick Log Submit
  const handleQuickLogSubmit = async (e) => {
    e.preventDefault();
    const vitalData = {};
    if (qSystolic) vitalData.systolic = Number(qSystolic);
    if (qDiastolic) vitalData.diastolic = Number(qDiastolic);
    if (qHeartRate) vitalData.heartRate = Number(qHeartRate);
    if (qTemp) vitalData.temperature = Number(qTemp);
    if (qSpO2) vitalData.spo2 = Number(qSpO2);

    if (Object.keys(vitalData).length === 0) {
      alert('Enter at least one parameter!');
      return;
    }

    try {
      await handleAddVital(vitalData);
      setQSystolic('');
      setQDiastolic('');
      setQHeartRate('');
      setQTemp('');
      setQSpO2('');
      setShowQuickLog(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Navigation title mapper
  const getPageTitle = () => {
    switch(currentPage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'trackers': return 'Vitals & Activity Trackers';
      case 'medications': return 'Medication Scheduling';
      case 'prescription-scanner': return 'Prescription OCR Scanner';
      case 'ai-assistant': return 'AI Diagnostic Copilot';
      case 'insights': return 'Weekly & Monthly Trends';
      case 'notifications': return 'Notification Center Drawer';
      case 'sos': return 'Emergency SOS & Care Summary';
      case 'settings': return 'Configurations & Settings';
      default: return 'VitalTrack';
    }
  };

  // Unread alerts calculations
  const unreadAlerts = alerts.filter(a => a.status === 'Unread');
  const hasCriticalAlert = unreadAlerts.some(a => a.severity === 'Critical');

  // Pre-auth screens flow (splash, intro, onboarding, login, register, forgot-password)
  if (!token) {
    if (preAuthStage === 'login') {
      return (
        <Login 
          onLogin={handleLogin} 
          onNavigateRegister={() => setPreAuthStage('register')} 
          onNavigateForgotPassword={() => setPreAuthStage('forgot-password')}
        />
      );
    } else if (preAuthStage === 'register') {
      return (
        <Register 
          onRegister={handleLogin} 
          onNavigateLogin={() => setPreAuthStage('login')} 
        />
      );
    } else if (preAuthStage === 'forgot-password') {
      return (
        <ForgotPassword 
          onNavigateLogin={() => setPreAuthStage('login')} 
          onNavigateOTP={() => setPreAuthStage('otp')}
        />
      );
    } else {
      // Renders Splash Screen (1), App Intro Screen (2), Onboardings (3-5), OTP verify (8)
      return (
        <OnboardingWizard
          stage={preAuthStage}
          onCancel={() => setPreAuthStage('login')}
          onVerifyOTP={(code) => {
            localStorage.setItem('hasSeenOnboarding', 'true');
            setPreAuthStage('login');
          }}
          onComplete={async () => {
            localStorage.setItem('hasSeenOnboarding', 'true');
            setPreAuthStage('login');
          }}
        />
      );
    }
  }

  // Post-Signup Setup Wizard (Create Profile (11), Photo upload (12), Health Setup (13), Goal Selection (14), Permissions (15))
  if (token && user && !user.onboardingComplete) {
    return (
      <OnboardingWizard
        stage="create-profile"
        user={user}
        token={token}
        onComplete={async (profileData) => {
          await handleUpdateProfile(profileData);
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Panel Content Area */}
      <main className="main-content">
        <Navbar 
          title={getPageTitle()} 
          alertsCount={unreadAlerts.length}
          hasCriticalAlert={hasCriticalAlert}
          onQuickLog={() => setShowQuickLog(true)}
          onRefresh={() => fetchDashboardData()}
          onNavigateNotifications={() => setCurrentPage('notifications')}
        />

        {/* View Switcher Router */}
        {currentPage === 'dashboard' && (
          <Dashboard 
            vitals={vitals}
            medications={medications}
            alerts={unreadAlerts}
            insight={insight}
            onLogMedication={handleLogMedicationStatus}
            onResolveAlert={handleResolveAlert}
            onTriggerInsight={handleTriggerInsight}
            user={user}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'trackers' && (
          <Trackers 
            vitals={vitals}
            onAddVital={handleAddVital}
            onDeleteVital={handleDeleteVital}
            user={user}
          />
        )}

        {currentPage === 'medications' && (
          <MedicationManager 
            medications={medications}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onToggleActive={handleToggleMedActive}
          />
        )}

        {currentPage === 'prescription-scanner' && (
          <PrescriptionScanner 
            onAddMedication={handleAddMedication}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'ai-assistant' && (
          <AIAssistant 
            vitals={vitals}
            user={user}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'insights' && (
          <HealthInsights 
            vitals={vitals}
            medications={medications}
            insight={insight}
            onTriggerInsight={handleTriggerInsight}
            user={user}
          />
        )}

        {currentPage === 'notifications' && (
          <NotificationCenter 
            alerts={unreadAlerts}
            onResolveAlert={handleResolveAlert}
          />
        )}

        {currentPage === 'settings' && (
          <Settings 
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onClearDatabase={handleClearDatabase}
          />
        )}

        {/* SOS Emergency Utilities */}
        {(currentPage === 'sos' || currentPage === 'appointments' || currentPage === 'records' || currentPage === 'family') && (
          <UtilityHub 
            user={user}
            onUpdateProfile={handleUpdateProfile}
            medications={medications}
          />
        )}

        {/* Logout Screen loader transition */}
        {currentPage === 'logout' && (
          <Logout onLogout={handleLogout} />
        )}
      </main>

      {/* Sticky Bottom Navigation Bar for Mobile sizes */}
      <BottomNavigation 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Quick Log Modal Overlay */}
      {showQuickLog && (
        <div className="modal-overlay" onClick={() => setShowQuickLog(false)}>
          <div className="modal-content glass-panel glass-panel-glow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-gap" style={{ color: 'var(--color-primary)' }}>
                <HeartPulse size={22} />
                <h3 className="modal-title" style={{ color: 'white' }}>Quick Vitals Log</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowQuickLog(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickLogSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Systolic BP</label>
                  <input
                    type="number"
                    placeholder="mmHg"
                    className="form-input"
                    value={qSystolic}
                    onChange={(e) => setQSystolic(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Diastolic BP</label>
                  <input
                    type="number"
                    placeholder="mmHg"
                    className="form-input"
                    value={qDiastolic}
                    onChange={(e) => setQDiastolic(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="bpm"
                  className="form-input"
                  value={qHeartRate}
                  onChange={(e) => setQHeartRate(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="°C"
                    className="form-input"
                    value={qTemp}
                    onChange={(e) => setQTemp(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Oxygen (%)</label>
                  <input
                    type="number"
                    placeholder="SpO2 %"
                    className="form-input"
                    value={qSpO2}
                    onChange={(e) => setQSpO2(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowQuickLog(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medication Reminder Popup Notification */}
      {activeReminder && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content glass-panel glass-panel-glow" style={{ maxWidth: '400px', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-primary)', background: 'rgba(99,102,241,0.1)', padding: '12px', borderRadius: '50%', flexShrink: 0 }}>
                <Pill size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', color: 'white', fontWeight: 700 }}>Time for Medication</h3>
                <p style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', marginTop: '6px' }}>{activeReminder.name} ({activeReminder.dosage})</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Scheduled for: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{activeReminder.time}</span></p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  handleLogMedicationStatus(activeReminder.id, activeReminder.time, 'skipped');
                  setActiveReminder(null);
                }} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Skip Dose
              </button>
              <button 
                onClick={() => {
                  setActiveReminder(null);
                  alert('Reminder snoozed for 5 minutes.');
                }} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Snooze
              </button>
              <button 
                onClick={() => {
                  handleLogMedicationStatus(activeReminder.id, activeReminder.time, 'taken');
                  setActiveReminder(null);
                }} 
                className="btn btn-primary" 
                style={{ flex: 1.5, padding: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Take Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
