import React, { useState } from 'react';
import { HeartPulse, History, Trash2, Calendar, FileText } from 'lucide-react';

export default function VitalsEntry({ vitals, onAddVital, onDeleteVital }) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const vitalData = {};
    if (systolic) vitalData.systolic = Number(systolic);
    if (diastolic) vitalData.diastolic = Number(diastolic);
    if (heartRate) vitalData.heartRate = Number(heartRate);
    if (temperature) vitalData.temperature = Number(temperature);
    if (spo2) vitalData.spo2 = Number(spo2);
    if (respiratoryRate) vitalData.respiratoryRate = Number(respiratoryRate);
    if (notes) vitalData.notes = notes;

    if (Object.keys(vitalData).length === 0) {
      alert("Please enter at least one health parameter!");
      setSubmitting(false);
      return;
    }

    try {
      await onAddVital(vitalData);
      // Reset form on success
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setTemperature('');
      setSpo2('');
      setRespiratoryRate('');
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-grid animate-fade-in" style={{ marginTop: 0 }}>
      {/* Vitals Entry Form */}
      <div className="grid-span-4">
        <div className="glass-panel">
          <div className="flex-gap" style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
            <HeartPulse size={22} />
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Log Vitals</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">BP Systolic <span style={{ textTransform: 'lowercase', color: 'var(--text-muted)' }}>(mmHg)</span></label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  className="form-input"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  min="60"
                  max="250"
                />
              </div>
              <div className="form-group">
                <label className="form-label">BP Diastolic <span style={{ textTransform: 'lowercase', color: 'var(--text-muted)' }}>(mmHg)</span></label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  className="form-input"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  min="40"
                  max="150"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Heart Rate <span style={{ textTransform: 'lowercase', color: 'var(--text-muted)' }}>(bpm)</span></label>
                <input
                  type="number"
                  placeholder="e.g. 72"
                  className="form-input"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  min="30"
                  max="220"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Temperature <span style={{ textTransform: 'lowercase', color: 'var(--text-muted)' }}>(°C)</span></label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 36.8"
                  className="form-input"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  min="32"
                  max="43"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Blood Oxygen <span style={{ textTransform: 'lowercase', color: 'var(--text-muted)' }}>(SpO2 %)</span></label>
                <input
                  type="number"
                  placeholder="e.g. 98"
                  className="form-input"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  min="50"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Respiration Rate <span style={{ textTransform: 'lowercase', color: 'var(--text-muted)' }}>(bpm)</span></label>
                <input
                  type="number"
                  placeholder="e.g. 16"
                  className="form-input"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  min="6"
                  max="50"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Session Notes</label>
              <textarea
                placeholder="How are you feeling? Any symptoms?"
                className="form-input"
                style={{ height: '80px', resize: 'vertical' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Record Vital Details'}
            </button>
          </form>
        </div>
      </div>

      {/* Vitals History Table */}
      <div className="grid-span-8">
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-gap" style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
            <History size={22} />
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Measurement History</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px' }}>
            {vitals.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 500 }}>Time / Date</th>
                    <th style={{ padding: '12px 8px', fontWeight: 500 }}>Blood Pressure</th>
                    <th style={{ padding: '12px 8px', fontWeight: 500 }}>Pulse</th>
                    <th style={{ padding: '12px 8px', fontWeight: 500 }}>Temp</th>
                    <th style={{ padding: '12px 8px', fontWeight: 500 }}>SpO2</th>
                    <th style={{ padding: '12px 8px', fontWeight: 500 }}>Resp</th>
                    <th style={{ padding: '12px 8px', fontWeight: 500 }}>Notes</th>
                    <th style={{ padding: '12px 8px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((vital) => (
                    <tr key={vital._id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                      <td style={{ padding: '14px 8px', color: 'white', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          {formatDate(vital.timestamp)}
                        </div>
                      </td>
                      <td style={{ padding: '14px 8px', color: 'white' }}>
                        {vital.systolic ? `${vital.systolic}/${vital.diastolic} mmHg` : '--'}
                      </td>
                      <td style={{ padding: '14px 8px', color: 'white' }}>
                        {vital.heartRate ? `${vital.heartRate} bpm` : '--'}
                      </td>
                      <td style={{ padding: '14px 8px', color: 'white' }}>
                        {vital.temperature ? `${vital.temperature}°C` : '--'}
                      </td>
                      <td style={{ padding: '14px 8px', color: 'white' }}>
                        {vital.spo2 ? `${vital.spo2}%` : '--'}
                      </td>
                      <td style={{ padding: '14px 8px', color: 'white' }}>
                        {vital.respiratoryRate ? `${vital.respiratoryRate} bpm` : '--'}
                      </td>
                      <td style={{ padding: '14px 8px', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {vital.notes ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={vital.notes}>
                            <FileText size={12} />
                            {vital.notes}
                          </div>
                        ) : '--'}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => onDeleteVital(vital._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex-center" style={{ height: '300px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                <History size={42} style={{ marginBottom: '16px', opacity: 0.4 }} />
                <span>Your measurement log is empty. Save your first vital reading on the left.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
