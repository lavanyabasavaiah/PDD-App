import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Droplet, 
  Moon, 
  Footprints, 
  Scale, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Clock, 
  Flame, 
  Sparkles,
  Info
} from 'lucide-react';
import CustomChart from '../components/CustomChart';

export default function Trackers({ vitals, onAddVital, onDeleteVital, user, initialTab = 'heart' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [bloodSugarType, setBloodSugarType] = useState('Fasting');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [waterIntake, setWaterIntake] = useState('');
  const [stepsCount, setStepsCount] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // Tab List
  const tabs = [
    { id: 'heart', name: 'Heart Rate', icon: Heart, color: 'var(--color-danger)' },
    { id: 'bp', name: 'Blood Pressure', icon: Activity, color: 'var(--color-danger)' },
    { id: 'sugar', name: 'Blood Sugar', icon: Droplet, color: 'var(--color-primary)' },
    { id: 'sleep', name: 'Sleep Tracker', icon: Moon, color: 'var(--color-info)' },
    { id: 'water', name: 'Water Intake', icon: Droplet, color: 'var(--color-info)' },
    { id: 'steps', name: 'Step Counter', icon: Footprints, color: 'var(--color-success)' },
    { id: 'weight', name: 'Weight / BMI', icon: Scale, color: 'var(--color-warning)' }
  ];

  const handleSubmit = async (e, customData = null) => {
    if (e) e.preventDefault();
    setSubmitting(true);

    const payload = customData || {};
    
    if (!customData) {
      if (activeTab === 'bp') {
        if (systolic) payload.systolic = Number(systolic);
        if (diastolic) payload.diastolic = Number(diastolic);
      } else if (activeTab === 'heart' && heartRate) {
        payload.heartRate = Number(heartRate);
      } else if (activeTab === 'sugar' && bloodSugar) {
        payload.bloodSugar = Number(bloodSugar);
        payload.bloodSugarType = bloodSugarType;
      } else if (activeTab === 'sleep' && sleepHours) {
        payload.sleepHours = Number(sleepHours);
        payload.sleepQuality = sleepQuality;
      } else if (activeTab === 'water' && waterIntake) {
        payload.waterIntake = Number(waterIntake);
      } else if (activeTab === 'steps' && stepsCount) {
        payload.stepsCount = Number(stepsCount);
      } else if (activeTab === 'weight' && weight) {
        payload.weight = Number(weight);
      }
      if (notes) payload.notes = notes;
    }

    if (Object.keys(payload).length === 0) {
      alert('Enter at least one parameter value!');
      setSubmitting(false);
      return;
    }

    try {
      await onAddVital(payload);
      // Reset
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setBloodSugar('');
      setSleepHours('');
      setWaterIntake('');
      setStepsCount('');
      setWeight('');
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickWaterLog = (amount) => {
    handleSubmit(null, { waterIntake: amount, notes: 'Quick hydration log' });
  };

  // Classifications
  const getBPDetails = (sys, dia) => {
    if (!sys || !dia) return { text: 'No Logs', color: 'var(--text-muted)', desc: 'Record BP readings to evaluate.' };
    if (sys >= 180 || dia >= 120) return { text: 'Crisis Stage', color: 'var(--color-danger)', desc: 'Hypertensive Crisis. Seek emergency care immediately.' };
    if (sys >= 140 || dia >= 90) return { text: 'Stage 2 Hypertension', color: 'var(--color-danger)', desc: 'High Blood Pressure Stage 2. Contact your doctor.' };
    if (sys >= 130 || dia >= 80) return { text: 'Stage 1 Hypertension', color: 'var(--color-warning)', desc: 'High Blood Pressure Stage 1. Maintain diet and monitor.' };
    if (sys >= 120 && sys < 130 && dia < 80) return { text: 'Elevated BP', color: 'var(--color-warning)', desc: 'Elevated Blood Pressure. Reduce sodium and stress.' };
    return { text: 'Optimal BP', color: 'var(--color-success)', desc: 'Healthy Blood pressure.' };
  };

  const getSugarDetails = (val, type) => {
    if (!val) return { text: 'No Logs', color: 'var(--text-muted)' };
    if (type === 'Fasting') {
      if (val >= 126) return { text: 'Diabetic Fasting Range', color: 'var(--color-danger)' };
      if (val >= 100) return { text: 'Pre-diabetic Fasting', color: 'var(--color-warning)' };
      return { text: 'Normal Fasting Sugar', color: 'var(--color-success)' };
    } else {
      if (val >= 200) return { text: 'Diabetic Range', color: 'var(--color-danger)' };
      if (val >= 140) return { text: 'Pre-diabetic Range', color: 'var(--color-warning)' };
      return { text: 'Normal Sugar Range', color: 'var(--color-success)' };
    }
  };

  const calculateBMI = (wt) => {
    const ht = user?.height || 170; // cm
    if (!wt) return null;
    const bmiVal = (wt / ((ht / 100) ** 2)).toFixed(1);
    
    let text = 'Normal';
    let color = 'var(--color-success)';
    
    if (bmiVal < 18.5) { text = 'Underweight'; color = 'var(--color-info)'; }
    else if (bmiVal >= 30) { text = 'Obese'; color = 'var(--color-danger)'; }
    else if (bmiVal >= 25) { text = 'Overweight'; color = 'var(--color-warning)'; }

    return { bmi: bmiVal, category: text, color };
  };

  const getRecentLogs = (key) => {
    return vitals.filter(v => v[key] !== undefined);
  };

  const formatTimeDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Hydration summary calculations (sum of water logs today)
  const getTodayWater = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const waterLogs = vitals.filter(v => {
      if (!v.timestamp) return false;
      const d = new Date(v.timestamp);
      if (isNaN(d.getTime())) return false;
      const logDate = d.toISOString().split('T')[0];
      return logDate === todayStr && v.waterIntake !== undefined;
    });
    return waterLogs.reduce((acc, curr) => acc + curr.waterIntake, 0);
  };

  const todayWaterSum = getTodayWater();
  const waterTarget = user?.goals?.water || 2000;
  const waterPercent = Math.min(Math.round((todayWaterSum / waterTarget) * 100), 100);

  // Steps summary calculation
  const getTodaySteps = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const stepLogs = vitals.filter(v => {
      if (!v.timestamp) return false;
      const d = new Date(v.timestamp);
      if (isNaN(d.getTime())) return false;
      const logDate = d.toISOString().split('T')[0];
      return logDate === todayStr && v.stepsCount !== undefined;
    });
    return stepLogs.reduce((acc, curr) => acc + curr.stepsCount, 0);
  };

  const todayStepsSum = getTodaySteps();
  const stepsTarget = user?.goals?.steps || 8000;
  const stepsPercent = Math.min(Math.round((todayStepsSum / stepsTarget) * 100), 100);

  // Weight summary details
  const weightLogs = getRecentLogs('weight');
  const latestWeight = weightLogs[0]?.weight || user?.weight || 70;
  const bmiInfo = calculateBMI(latestWeight);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Horizonal Tab bar switcher */}
      <div className="glass-panel" style={{ padding: '12px', overflowX: 'auto', display: 'flex', gap: '8px' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: '1px solid ' + (isActive ? 'var(--color-primary)' : 'var(--border-light)'),
                padding: '10px 18px',
                fontSize: '0.85rem',
                flexShrink: 0
              }}
            >
              <Icon size={16} style={{ color: isActive ? 'white' : tab.color }} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Screen Area */}
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        
        {/* Log Input Column */}
        <div className="grid-span-4">
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '20px' }}>
              Log {tabs.find(t => t.id === activeTab).name}
            </h3>

            <form onSubmit={handleSubmit}>
              
              {/* BP Screen Log Inputs */}
              {activeTab === 'bp' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Systolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      className="form-input"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Diastolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      className="form-input"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Heart rate Input */}
              {activeTab === 'heart' && (
                <div className="form-group">
                  <label className="form-label">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 72"
                    className="form-input"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                  />
                </div>
              )}

              {/* Blood Sugar Input */}
              {activeTab === 'sugar' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Glucose (mg/dL)</label>
                    <input
                      type="number"
                      placeholder="e.g. 95"
                      className="form-input"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-input"
                      value={bloodSugarType}
                      onChange={(e) => setBloodSugarType(e.target.value)}
                      style={{ background: 'rgba(10, 12, 22, 0.8)', border: '1px solid var(--border-light)' }}
                    >
                      <option value="Fasting">Fasting</option>
                      <option value="Post-Prandial">Post-Prandial</option>
                      <option value="Random">Random</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Sleep Input */}
              {activeTab === 'sleep' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hours Slept</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 7.5"
                      className="form-input"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quality</label>
                    <select
                      className="form-input"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value)}
                      style={{ background: 'rgba(10, 12, 22, 0.8)', border: '1px solid var(--border-light)' }}
                    >
                      <option value="Poor">Poor</option>
                      <option value="Fair">Fair</option>
                      <option value="Good">Good</option>
                      <option value="Excellent">Excellent</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Water Intake Input */}
              {activeTab === 'water' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Hydration (ml)</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      className="form-input"
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <button type="button" onClick={() => handleQuickWaterLog(250)} className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>+ 250ml</button>
                    <button type="button" onClick={() => handleQuickWaterLog(500)} className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}>+ 500ml</button>
                  </div>
                </div>
              )}

              {/* Steps Input */}
              {activeTab === 'steps' && (
                <div className="form-group">
                  <label className="form-label">Steps Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    className="form-input"
                    value={stepsCount}
                    onChange={(e) => setStepsCount(e.target.value)}
                  />
                </div>
              )}

              {/* Weight Input */}
              {activeTab === 'weight' && (
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70.5"
                    className="form-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  style={{ height: '60px', resize: 'vertical' }}
                  placeholder="Optional log notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Save Log Entry
              </button>

            </form>
          </div>
        </div>

        {/* Visualizer & Logs Column */}
        <div className="grid-span-8">
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Visualizer gauges and summaries */}
            <div style={{ marginBottom: '24px' }}>
              
              {activeTab === 'heart' && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '16px' }}>Heart Rate Zones</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Resting (50 - 70 bpm)</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Optimal Range</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '60%', height: '100%', background: 'var(--color-success)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Cardio Zone (100 - 130 bpm)</span>
                      <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>Active Training</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '30%', height: '100%', background: 'var(--color-warning)' }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bp' && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '8px' }}>Blood Pressure Classification</h4>
                  {(() => {
                    const logs = getRecentLogs('systolic');
                    const latest = logs[0] || {};
                    const bpClass = getBPDetails(latest.systolic, latest.diastolic);
                    return (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: bpClass.color }}>
                          {latest.systolic ? `${latest.systolic}/${latest.diastolic}` : '--/--'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{bpClass.text}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{bpClass.desc}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'sugar' && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '8px' }}>Blood Glucose Status</h4>
                  {(() => {
                    const logs = getRecentLogs('bloodSugar');
                    const latest = logs[0] || {};
                    const sugarClass = getSugarDetails(latest.bloodSugar, latest.bloodSugarType);
                    return (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: sugarClass.color || 'white' }}>
                          {latest.bloodSugar ? `${latest.bloodSugar} mg/dL` : '--'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                            {latest.bloodSugarType || 'Fasting'} Reading
                          </div>
                          <div style={{ fontSize: '0.80rem', color: sugarClass.color, fontWeight: 600, marginTop: '2px' }}>
                            {sugarClass.text}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'sleep' && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '8px' }}>Sleep Quality Assessment</h4>
                  {(() => {
                    const logs = getRecentLogs('sleepHours');
                    const latest = logs[0] || {};
                    return (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-info)' }}>
                          {latest.sleepHours ? `${latest.sleepHours} hrs` : '--'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                            Sleep Quality: <span style={{ color: 'var(--color-primary)' }}>{latest.sleepQuality || 'Good'}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Target: {user?.goals?.sleep || 8} hrs. Consistent sleep schedules support cognitive recovery.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeTab === 'water' && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '12px' }}>Hydration Target Goal</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                      {/* Interactive visual water filling cup */}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '4px solid var(--border-light)',
                        overflow: 'hidden',
                        position: 'relative',
                        background: 'rgba(255,255,255,0.02)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: `${waterPercent}%`,
                          background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                          transition: 'height 0.8s ease-in-out'
                        }} />
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'white',
                        zIndex: 2
                      }}>
                        {waterPercent}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>
                        {todayWaterSum} / {waterTarget} ml
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        You need {Math.max(waterTarget - todayWaterSum, 0)} ml more to reach today's target.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'steps' && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '12px' }}>Step Tracker Milestones</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                          {todayStepsSum.toLocaleString()} / {stepsTarget.toLocaleString()} steps
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>{stepsPercent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${stepsPercent}%`, height: '100%', background: 'var(--color-success)', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Flame size={12} color="var(--color-warning)" /> Calories
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                          {Math.round(todayStepsSum * 0.04)} kcal
                        </div>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--border-light)' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>
                          {(todayStepsSum * 0.0008).toFixed(2)} km
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'weight' && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '8px' }}>BMI Calculator Indicator</h4>
                  {bmiInfo ? (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: bmiInfo.color }}>
                        {latestWeight} kg
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                          BMI: <span style={{ color: bmiInfo.color }}>{bmiInfo.bmi}</span>
                        </div>
                        <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Weight Category: <span style={{ color: bmiInfo.color, fontWeight: 600 }}>{bmiInfo.category}</span> (Height: {user?.height || 170} cm)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Log a weight entry to calculate BMI.</div>
                  )}
                </div>
              )}

            </div>

            {/* List of recent logs */}
            <div style={{ flex: 1, borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '12px' }}>Historical Log Records</h4>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {(() => {
                  let logKey = 'heartRate';
                  let labelName = 'Pulse Rate';
                  let unit = ' bpm';
                  
                  if (activeTab === 'bp') { logKey = 'systolic'; labelName = 'Blood Pressure'; unit = ''; }
                  else if (activeTab === 'sugar') { logKey = 'bloodSugar'; labelName = 'Blood Glucose'; unit = ' mg/dL'; }
                  else if (activeTab === 'sleep') { logKey = 'sleepHours'; labelName = 'Sleep Time'; unit = ' hrs'; }
                  else if (activeTab === 'water') { logKey = 'waterIntake'; labelName = 'Water Amount'; unit = ' ml'; }
                  else if (activeTab === 'steps') { logKey = 'stepsCount'; labelName = 'Steps'; unit = ' steps'; }
                  else if (activeTab === 'weight') { logKey = 'weight'; labelName = 'Weight'; unit = ' kg'; }

                  const filtered = getRecentLogs(logKey);

                  return filtered.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px' }}>Logged Time</th>
                          <th style={{ padding: '8px' }}>{labelName}</th>
                          {activeTab === 'sugar' && <th style={{ padding: '8px' }}>Type</th>}
                          {activeTab === 'sleep' && <th style={{ padding: '8px' }}>Quality</th>}
                          <th style={{ padding: '8px' }}>Notes</th>
                          <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(vital => (
                          <tr key={vital._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '10px 8px', color: 'white' }}>{formatTimeDate(vital.timestamp)}</td>
                            <td style={{ padding: '10px 8px', color: 'white', fontWeight: 600 }}>
                              {activeTab === 'bp' 
                                ? `${vital.systolic}/${vital.diastolic} mmHg`
                                : `${vital[logKey]}${unit}`
                              }
                            </td>
                            {activeTab === 'sugar' && <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{vital.bloodSugarType}</td>}
                            {activeTab === 'sleep' && <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{vital.sleepQuality}</td>}
                            <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {vital.notes || '--'}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                              <button
                                onClick={() => onDeleteVital(vital._id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex-center" style={{ height: '120px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                      <Clock size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                      <span>No measurement records recorded yet.</span>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
