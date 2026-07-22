import React, { useState } from 'react';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Droplet, 
  Check, 
  X, 
  AlertTriangle, 
  BrainCircuit, 
  Calendar,
  Sparkles,
  ShieldAlert,
  Footprints,
  Moon,
  Scale,
  MessageSquare,
  Camera,
  Zap
} from 'lucide-react';
import CustomChart from '../components/CustomChart';

export default function Dashboard({ vitals, medications, alerts, insight, onLogMedication, onResolveAlert, onTriggerInsight, user, setCurrentPage }) {
  const [selectedChartParam, setSelectedChartParam] = useState('bloodPressure');
  const [generatingInsight, setGeneratingInsight] = useState(false);

  // Get most recent vitals values
  const latestVital = vitals[0] || {};

  // Group medications by daily intake slots
  const getMedicationSchedule = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const list = [];

    medications.forEach(med => {
      if (!med.active) return;
      med.times.forEach(time => {
        // Find if logged for today at this time
        const log = med.logs.find(l => l.date === todayStr && l.time === time);
        list.push({
          id: med._id,
          name: med.name,
          dosage: med.dosage,
          time,
          status: log ? log.status : 'pending' // pending, taken, skipped
        });
      });
    });

    // Sort by time
    return list.sort((a, b) => a.time.localeCompare(b.time));
  };

  const scheduledMeds = getMedicationSchedule();

  const handleTriggerAI = async () => {
    setGeneratingInsight(true);
    try {
      await onTriggerInsight();
    } finally {
      setGeneratingInsight(false);
    }
  };

  // Helper to format vitals display
  const getBPStatus = (sys, dia) => {
    if (!sys || !dia) return { text: 'No Data', color: 'var(--text-muted)' };
    if (sys >= 180 || dia >= 120) return { text: 'Crisis', color: 'var(--color-danger)' };
    if (sys >= 140 || dia >= 90) return { text: 'High', color: 'var(--color-danger)' };
    if (sys >= 120 || dia >= 80) return { text: 'Elevated', color: 'var(--color-warning)' };
    if (sys < 90 || dia < 60) return { text: 'Low', color: 'var(--color-warning)' };
    return { text: 'Normal', color: 'var(--color-success)' };
  };

  const getHRStatus = (hr) => {
    if (!hr) return { text: 'No Data', color: 'var(--text-muted)' };
    if (hr >= 120 || hr <= 45) return { text: 'Critical', color: 'var(--color-danger)' };
    if (hr > 100) return { text: 'High', color: 'var(--color-warning)' };
    if (hr < 55) return { text: 'Low', color: 'var(--color-warning)' };
    return { text: 'Normal', color: 'var(--color-success)' };
  };

  const getTempStatus = (temp) => {
    if (!temp) return { text: 'No Data', color: 'var(--text-muted)' };
    if (temp >= 39.5 || temp < 35.0) return { text: 'Critical', color: 'var(--color-danger)' };
    if (temp >= 38.0) return { text: 'Fever', color: 'var(--color-warning)' };
    return { text: 'Normal', color: 'var(--color-success)' };
  };

  const getSpO2Status = (o2) => {
    if (!o2) return { text: 'No Data', color: 'var(--text-muted)' };
    if (o2 < 90) return { text: 'Severe Hypoxia', color: 'var(--color-danger)' };
    if (o2 < 95) return { text: 'Low', color: 'var(--color-warning)' };
    return { text: 'Normal', color: 'var(--color-success)' };
  };

  const bpStatus = getBPStatus(latestVital.systolic, latestVital.diastolic);
  const hrStatus = getHRStatus(latestVital.heartRate);
  const tempStatus = getTempStatus(latestVital.temperature);
  const spo2Status = getSpO2Status(latestVital.spo2);

  // Today progress logs
  const getTodayMetric = (key) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const logs = vitals.filter(v => {
      if (!v.timestamp) return false;
      const d = new Date(v.timestamp);
      if (isNaN(d.getTime())) return false;
      const logDate = d.toISOString().split('T')[0];
      return logDate === todayStr && v[key] !== undefined;
    });
    return logs.reduce((acc, curr) => acc + curr[key], 0);
  };

  const stepsToday = getTodayMetric('stepsCount');
  const stepsGoal = user?.goals?.steps || 8000;
  const stepsPercent = Math.min(Math.round((stepsToday / stepsGoal) * 100), 100);

  const waterToday = getTodayMetric('waterIntake');
  const waterGoal = user?.goals?.water || 2000;
  const waterPercent = Math.min(Math.round((waterToday / waterGoal) * 100), 100);

  const sleepLogs = vitals.filter(v => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!v.timestamp) return false;
    const d = new Date(v.timestamp);
    if (isNaN(d.getTime())) return false;
    const logDate = d.toISOString().split('T')[0];
    return logDate === todayStr && v.sleepHours !== undefined;
  });
  const sleepToday = sleepLogs[0]?.sleepHours || 0;
  const sleepGoal = user?.goals?.sleep || 8;
  const sleepPercent = Math.min(Math.round((sleepToday / sleepGoal) * 100), 100);

  const totalMeds = scheduledMeds.length;
  const takenMeds = scheduledMeds.filter(m => m.status === 'taken').length;

  const calculateHealthScore = () => {
    let score = 70; // baseline
    if (latestVital.systolic) {
      if (latestVital.systolic < 120 && latestVital.diastolic < 80) score += 5;
      else if (latestVital.systolic >= 140 || latestVital.diastolic >= 90) score -= 10;
    }
    if (latestVital.heartRate) {
      if (latestVital.heartRate >= 60 && latestVital.heartRate <= 85) score += 5;
      else if (latestVital.heartRate > 100) score -= 5;
    }
    if (stepsToday >= stepsGoal) score += 10;
    else if (stepsToday > 0) score += Math.round((stepsToday / stepsGoal) * 5);
    if (waterToday >= waterGoal) score += 5;
    if (sleepToday >= sleepGoal) score += 5;
    if (totalMeds > 0) score += Math.round((takenMeds / totalMeds) * 10);
    else score += 5;
    return Math.min(Math.max(score, 20), 100);
  };

  const healthScore = calculateHealthScore();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Row: Health Score, Daily summary, Quick actions */}
      <div className="dashboard-grid animate-fade-in" style={{ marginTop: 0 }}>
        
        {/* Health Score Card */}
        <div className="grid-span-4 glass-panel glass-panel-glow" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-light)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-primary)"
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
              {healthScore}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="var(--color-primary)" /> Health Score
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px', lineHeight: 1.4 }}>
              {healthScore >= 80 
                ? 'Optimal physical status! Today’s averages look excellent.' 
                : healthScore >= 65 
                  ? 'Healthy condition. Fill steps or water to maximize score.' 
                  : 'Alert: Health scores flagged low. Check active reminders.'}
            </p>
          </div>
        </div>

        {/* Daily Summary Widget */}
        <div className="grid-span-5 glass-panel">
          <h3 style={{ fontSize: '0.95rem', color: 'white', marginBottom: '12px' }}>Daily Activity Widget</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            {/* Steps */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Footprints size={12} color="var(--color-success)" /> Steps</span>
                <span style={{ color: 'white' }}>{stepsToday}/{stepsGoal} ({stepsPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${stepsPercent}%`, height: '100%', background: 'var(--color-success)', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Hydration */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplet size={12} color="var(--color-info)" /> Water Log</span>
                <span style={{ color: 'white' }}>{waterToday}/{waterGoal} ml ({waterPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${waterPercent}%`, height: '100%', background: 'var(--color-info)', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Sleep */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Moon size={12} color="var(--color-primary)" /> Sleep Quality</span>
                <span style={{ color: 'white' }}>{sleepToday}/{sleepGoal} hrs ({sleepPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${sleepPercent}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="grid-span-3 glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'white', marginBottom: '2px' }}>Quick Panels</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage('trackers')}
              className="btn btn-secondary" 
              style={{ padding: '6px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Heart size={14} color="var(--color-danger)" />
              <span>Log Vitals</span>
            </button>
            <button 
              onClick={() => setCurrentPage('prescription-scanner')}
              className="btn btn-secondary" 
              style={{ padding: '6px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Camera size={14} color="var(--color-info)" />
              <span>Scan Rx</span>
            </button>
            <button 
              onClick={() => setCurrentPage('ai-assistant')}
              className="btn btn-secondary" 
              style={{ padding: '6px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <MessageSquare size={14} color="var(--color-primary)" />
              <span>AI Assistant</span>
            </button>
            <button 
              onClick={() => setCurrentPage('sos')}
              className="btn btn-secondary" 
              style={{ padding: '6px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.02)', cursor: 'pointer' }}
            >
              <ShieldAlert size={14} color="var(--color-danger)" />
              <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>SOS Alarm</span>
            </button>
          </div>
        </div>

      </div>

      {/* Vitals Quick Cards */}
      <div className="stats-grid">
        {/* Blood Pressure */}
        <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedChartParam('bloodPressure')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-label">Blood Pressure</div>
            <div className="stat-value">
              {latestVital.systolic ? `${latestVital.systolic}/${latestVital.diastolic}` : '--/--'}
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '4px', color: 'var(--text-muted)' }}>mmHg</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: bpStatus.color }}>{bpStatus.text}</div>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedChartParam('heartRate')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
            <Heart size={24} />
          </div>
          <div>
            <div className="stat-label">Heart Rate</div>
            <div className="stat-value">
              {latestVital.heartRate || '--'}
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '4px', color: 'var(--text-muted)' }}>bpm</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: hrStatus.color }}>{hrStatus.text}</div>
          </div>
        </div>

        {/* Body Temperature */}
        <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedChartParam('temperature')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
            <Thermometer size={24} />
          </div>
          <div>
            <div className="stat-label">Temperature</div>
            <div className="stat-value">
              {latestVital.temperature ? `${latestVital.temperature}°C` : '--'}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: tempStatus.color }}>{tempStatus.text}</div>
          </div>
        </div>

        {/* Blood Oxygen */}
        <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedChartParam('spo2')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-info)' }}>
            <Droplet size={24} />
          </div>
          <div>
            <div className="stat-label">Blood Oxygen</div>
            <div className="stat-value">
              {latestVital.spo2 ? `${latestVital.spo2}%` : '--'}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: spo2Status.color }}>{spo2Status.text}</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column (Charts and AI Insights) */}
        <div className="grid-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Interactive Chart Panel */}
          <div className="glass-panel">
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Vital Sign Trends</h3>
              <div className="flex-gap" style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                {['bloodPressure', 'heartRate', 'temperature', 'spo2'].map(param => (
                  <button
                    key={param}
                    onClick={() => setSelectedChartParam(param)}
                    style={{
                      border: 'none',
                      background: selectedChartParam === param ? 'var(--color-primary)' : 'transparent',
                      color: selectedChartParam === param ? 'white' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {param === 'bloodPressure' ? 'BP' : param === 'heartRate' ? 'HR' : param === 'temperature' ? 'Temp' : 'SpO2'}
                  </button>
                ))}
              </div>
            </div>
            <CustomChart data={vitals} parameter={selectedChartParam} />
          </div>

          {/* AI Insights Engine Report */}
          <div className="glass-panel glass-panel-glow" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div className="flex-gap" style={{ color: 'var(--color-primary)' }}>
                <BrainCircuit size={22} />
                <h3 style={{ fontSize: '1.2rem', color: 'white' }}>AI Smart Health Insights</h3>
              </div>
              <button 
                onClick={handleTriggerAI}
                className="btn btn-secondary" 
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                disabled={generatingInsight || vitals.length === 0}
              >
                <Sparkles size={14} style={{ marginRight: '4px', color: 'var(--color-primary)' }} />
                {generatingInsight ? 'Analyzing...' : 'Refresh AI Analysis'}
              </button>
            </div>

            {insight ? (
              <div>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.04)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  marginBottom: '16px',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5'
                }}>
                  {insight.summary}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <h4 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    AI Recommendations
                  </h4>
                  <div style={{
                    whiteSpace: 'pre-line',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7'
                  }}>
                    {insight.recommendation}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '12px' }}>
                  Report Generated: {new Date(insight.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="flex-center" style={{ height: '120px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                <BrainCircuit size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <span>No reports generated. Click 'Refresh AI Analysis' above to generate.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Alerts and Medications) */}
        <div className="grid-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Smart Alerts list */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div className="flex-gap">
                <AlertTriangle size={20} color="var(--color-warning)" />
                <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Active Warnings</h3>
              </div>
              <span className="badge badge-warning" style={{ borderRadius: '6px' }}>
                {alerts.filter(a => a.status === 'Unread').length} unread
              </span>
            </div>

            <div className="alerts-list">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <div 
                    key={alert._id} 
                    className={`alert-card ${alert.severity === 'Critical' ? 'critical' : alert.severity === 'Warning' ? 'warning' : 'normal'}`}
                  >
                    <div className="alert-content">
                      <div className="alert-title flex-between">
                        <span style={{ color: alert.severity === 'Critical' ? 'var(--color-danger)' : alert.severity === 'Warning' ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700 }}>
                          {alert.type}
                        </span>
                        {alert.status === 'Unread' && (
                          <button 
                            onClick={() => onResolveAlert(alert._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textDecoration: 'underline'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                      <p className="alert-message">{alert.message}</p>
                      <div className="alert-time">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(alert.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'})}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-center" style={{ height: '100px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  All vitals stable. No active alerts.
                </div>
              )}
            </div>
          </div>

          {/* Daily Medications Checklist */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div className="flex-gap">
                <Calendar size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Today's Medications</h3>
              </div>
            </div>

            <div className="med-list-container">
              {scheduledMeds.length > 0 ? (
                scheduledMeds.map((slot, index) => (
                  <div key={`${slot.id}-${slot.time}-${index}`} className="med-item">
                    <div>
                      <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }}>
                        {slot.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {slot.dosage} • <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{slot.time}</span>
                      </div>
                    </div>

                    <div className="flex-gap" style={{ gap: '8px' }}>
                      {slot.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => onLogMedication(slot.id, slot.time, 'taken')}
                            className="med-checkbox"
                            style={{ borderColor: 'var(--color-success)' }}
                            title="Mark as Taken"
                          >
                            <Check size={14} color="var(--color-success)" />
                          </button>
                          <button
                            onClick={() => onLogMedication(slot.id, slot.time, 'skipped')}
                            className="med-checkbox"
                            style={{ borderColor: 'var(--color-danger)' }}
                            title="Mark as Skipped"
                          >
                            <X size={14} color="var(--color-danger)" />
                          </button>
                        </>
                      ) : (
                        <div className="flex-gap" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {slot.status === 'taken' ? (
                            <span className="badge badge-normal" style={{ gap: '4px' }}>
                              <Check size={10} /> Taken
                            </span>
                          ) : (
                            <span className="badge badge-critical" style={{ gap: '4px' }}>
                              <X size={10} /> Skipped
                            </span>
                          )}
                          <button
                            onClick={() => onLogMedication(slot.id, slot.time, 'pending')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '0.7rem',
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-center" style={{ height: '100px', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span>No medications scheduled for today.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
