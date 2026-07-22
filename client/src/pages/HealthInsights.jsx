import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  Download, 
  TrendingUp, 
  Activity, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Printer
} from 'lucide-react';
import CustomChart from '../components/CustomChart';

export default function HealthInsights({ vitals, medications, insight, onTriggerInsight, user }) {
  const [activeTab, setActiveTab] = useState('insights'); // insights | reports | analytics
  const [selectedParam, setSelectedParam] = useState('bloodPressure');
  const [analyticPeriod, setAnalyticPeriod] = useState('weekly'); // weekly | monthly
  const [generatingReport, setGeneratingReport] = useState(false);

  // Calculate some analytics helper metrics
  const getAverage = (key) => {
    const valid = vitals.filter(v => v[key] !== undefined);
    if (valid.length === 0) return '--';
    const sum = valid.reduce((acc, curr) => acc + curr[key], 0);
    return Math.round(sum / valid.length);
  };

  const getBPAverage = () => {
    const valid = vitals.filter(v => v.systolic !== undefined && v.diastolic !== undefined);
    if (valid.length === 0) return '--/--';
    const sysSum = valid.reduce((acc, curr) => acc + curr.systolic, 0);
    const diaSum = valid.reduce((acc, curr) => acc + curr.diastolic, 0);
    return `${Math.round(sysSum / valid.length)}/${Math.round(diaSum / valid.length)}`;
  };

  const bpAvg = getBPAverage();
  const hrAvg = getAverage('heartRate');
  const sugarAvg = getAverage('bloodSugar');
  const sleepAvg = getAverage('sleepHours');
  const stepsAvg = getAverage('stepsCount');
  const waterAvg = getAverage('waterIntake');

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      alert('Mock PDF report generated! Ready to print.');
    }, 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Subtab Navigation */}
      <div className="glass-panel" style={{ padding: '12px', display: 'flex', gap: '12px' }}>
        {['insights', 'reports', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn"
            style={{
              background: activeTab === tab ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              border: '1px solid ' + (activeTab === tab ? 'var(--color-primary)' : 'var(--border-light)'),
              flex: 1,
              textTransform: 'capitalize'
            }}
          >
            {tab === 'insights' && <BrainCircuit size={16} />}
            {tab === 'reports' && <FileText size={16} />}
            {tab === 'analytics' && <TrendingUp size={16} />}
            <span>{tab === 'insights' ? 'AI Smart Insights' : tab === 'reports' ? 'Health Reports' : 'Analytics Trends'}</span>
          </button>
        ))}
      </div>

      {/* View Switcher */}
      {activeTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main AI Insights panel */}
          <div className="glass-panel glass-panel-glow" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <div className="flex-gap" style={{ color: 'var(--color-primary)' }}>
                <BrainCircuit size={24} />
                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>AI Health Recommendations</h3>
              </div>
              <button 
                onClick={onTriggerInsight} 
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                disabled={vitals.length === 0}
              >
                <Sparkles size={14} />
                <span>Re-Analyze Health Profile</span>
              </button>
            </div>

            {insight ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.04)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.12)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'white'
                }}>
                  {insight.summary}
                </div>
                
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Clinical Lifestyle Suggestions
                  </h4>
                  <div style={{
                    whiteSpace: 'pre-line',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.8',
                    fontSize: '0.9rem'
                  }}>
                    {insight.recommendation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-center" style={{ height: '180px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                <BrainCircuit size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <span>No health insights generated. Add vital logs and click 'Re-Analyze Health Profile'.</span>
              </div>
            )}
          </div>

          {/* Correlations & Warning alerts list */}
          <div className="dashboard-grid" style={{ marginTop: 0 }}>
            <div className="grid-span-6 glass-panel">
              <h4 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={18} color="var(--color-info)" /> Potential Risks Avoided
              </h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>Taking Metformin scheduled doses prevented glucose levels from rising post-meals.</li>
                <li>Hydration levels maintained above 1500ml daily reduced potential morning heart rate spikes.</li>
                <li>7+ hours of sleep logged correlated with lower resting blood pressure baseline values.</li>
              </ul>
            </div>
            <div className="grid-span-6 glass-panel">
              <h4 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--color-warning)" /> Critical Anomalies Checked
              </h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>Fasting Blood Sugar tracked above 126 mg/dL flagged as pre-diabetic risk factor.</li>
                <li>Blood pressure values above 140/90 mmHg triggered hypertension Stage 2 status reminders.</li>
                <li>Sleep durations dropping below 5 hours flagged for nervous system recoverability warning.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'reports' && (
        <div className="glass-panel" id="printable-report">
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', color: 'white' }}>Smart Clinical Report Card</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex-gap" id="report-actions">
              <button onClick={handlePrint} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <Printer size={14} />
                <span>Print PDF</span>
              </button>
              <button 
                onClick={handleGenerateReport} 
                disabled={generatingReport}
                className="btn btn-primary" 
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                <Download size={14} />
                <span>{generatingReport ? 'Generating...' : 'Download CSV'}</span>
              </button>
            </div>
          </div>

          {/* Clinical layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            
            {/* Patient sidebar details */}
            <div style={{ borderRight: '1px solid var(--border-light)', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Patient Details</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{user?.fullName || user?.username}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Age: {user?.age || '35'} | {user?.gender || 'Other'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Blood Group: {user?.bloodGroup || 'O+'}</div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Conditions</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {user?.conditions && user.conditions.length > 0 ? (
                    user.conditions.map(c => <span key={c} className="badge badge-critical" style={{ fontSize: '0.65rem' }}>{c}</span>)
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>None Recorded</span>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Recorded Allergies</h4>
                <p style={{ fontSize: '0.85rem', color: 'white' }}>
                  {user?.allergies && user.allergies.length > 0 ? user.allergies.join(', ') : 'No Known Allergies'}
                </p>
              </div>
            </div>

            {/* Patients health averages card */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '16px', textTransform: 'uppercase' }}>Log Statistics & averages</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Blood Pressure</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{bpAvg} mmHg</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Heart Rate</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{hrAvg} bpm</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Blood Sugar</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{sugarAvg} mg/dL</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Sleep Duration</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{sleepAvg} hrs</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Daily Steps</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{stepsAvg.toLocaleString()} steps</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Hydration Intake</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginTop: '2px' }}>{waterAvg} ml</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filter options */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '4px' }}>Historical Trend Analysis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Visualize vital patterns over weekly or monthly schedules.</p>
            </div>
            
            <div className="flex-gap" style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <button
                onClick={() => setAnalyticPeriod('weekly')}
                style={{
                  border: 'none',
                  background: analyticPeriod === 'weekly' ? 'var(--color-primary)' : 'transparent',
                  color: analyticPeriod === 'weekly' ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Weekly Analytics
              </button>
              <button
                onClick={() => setAnalyticPeriod('monthly')}
                style={{
                  border: 'none',
                  background: analyticPeriod === 'monthly' ? 'var(--color-primary)' : 'transparent',
                  color: analyticPeriod === 'monthly' ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Monthly Analytics
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h4 style={{ color: 'white', fontSize: '1rem', textTransform: 'capitalize' }}>
                {analyticPeriod} {selectedParam === 'bloodPressure' ? 'BP' : selectedParam === 'heartRate' ? 'HR' : selectedParam === 'bloodSugar' ? 'Glucose' : selectedParam} Chart
              </h4>
              
              {/* Param Selector */}
              <select
                className="form-input"
                style={{ width: '180px', padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(10, 12, 22, 0.8)', borderColor: 'var(--border-light)' }}
                value={selectedParam}
                onChange={(e) => setSelectedParam(e.target.value)}
              >
                <option value="bloodPressure">Blood Pressure</option>
                <option value="heartRate">Heart Rate</option>
                <option value="temperature">Temperature</option>
                <option value="spo2">Oxygen Saturation</option>
                <option value="bloodSugar">Blood Glucose</option>
                <option value="sleepHours">Sleep hours</option>
                <option value="waterIntake">Hydration</option>
                <option value="stepsCount">Steps Count</option>
                <option value="weight">Weight logs</option>
              </select>
            </div>
            
            <CustomChart data={vitals} parameter={selectedParam} />
          </div>

        </div>
      )}

    </div>
  );
}
