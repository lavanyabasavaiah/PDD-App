import React, { useState } from 'react';
import { Pill, Clock, Calendar, Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function MedicationManager({ medications, onAddMedication, onDeleteMedication, onToggleActive }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('20:00');
  const [time3, setTime3] = useState('14:00');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !dosage) {
      alert('Medication name and dosage are required.');
      return;
    }

    setSubmitting(true);
    
    // Build times array based on frequency
    let times = [time1];
    if (frequency === 'Twice Daily') {
      times = [time1, time2];
    } else if (frequency === 'Three Times Daily') {
      times = [time1, time3, time2]; // Morning, Afternoon, Evening
    } else if (frequency === 'As Needed') {
      times = [];
    }

    try {
      await onAddMedication({
        name,
        dosage,
        frequency,
        times
      });
      // Reset form
      setName('');
      setDosage('');
      setFrequency('Daily');
      setTime1('08:00');
      setTime2('20:00');
      setTime3('14:00');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-grid animate-fade-in" style={{ marginTop: 0 }}>
      {/* Schedule Form */}
      <div className="grid-span-4">
        <div className="glass-panel">
          <div className="flex-gap" style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
            <Pill size={22} />
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Schedule Medication</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Medication Name</label>
              <input
                type="text"
                placeholder="e.g. Lisinopril"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Include brand name or generic compound.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Dosage Strength</label>
              <input
                type="text"
                placeholder="e.g. 10mg, 1 tablet, 5ml"
                className="form-input"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                className="form-input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(10, 12, 22, 0.6) url("data:image/svg+xml;utf8,<svg fill=\'%2364748b\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat right 12px center' }}
              >
                <option value="Daily" style={{ background: 'var(--bg-secondary)' }}>Daily</option>
                <option value="Twice Daily" style={{ background: 'var(--bg-secondary)' }}>Twice Daily</option>
                <option value="Three Times Daily" style={{ background: 'var(--bg-secondary)' }}>Three Times Daily</option>
                <option value="Weekly" style={{ background: 'var(--bg-secondary)' }}>Weekly</option>
                <option value="As Needed" style={{ background: 'var(--bg-secondary)' }}>As Needed</option>
              </select>
            </div>

            {frequency !== 'As Needed' && (
              <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <Clock size={14} /> Schedule Intake Hours
                </label>
                
                {frequency === 'Daily' && (
                  <div>
                    <input
                      type="time"
                      className="form-input"
                      value={time1}
                      onChange={(e) => setTime1(e.target.value)}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                )}

                {frequency === 'Twice Daily' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '60px' }}>Dose 1:</span>
                      <input type="time" className="form-input" value={time1} onChange={(e) => setTime1(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '60px' }}>Dose 2:</span>
                      <input type="time" className="form-input" value={time2} onChange={(e) => setTime2(e.target.value)} />
                    </div>
                  </div>
                )}

                {frequency === 'Three Times Daily' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '60px' }}>Morning:</span>
                      <input type="time" className="form-input" value={time1} onChange={(e) => setTime1(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '60px' }}>Noon:</span>
                      <input type="time" className="form-input" value={time3} onChange={(e) => setTime3(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '60px' }}>Night:</span>
                      <input type="time" className="form-input" value={time2} onChange={(e) => setTime2(e.target.value)} />
                    </div>
                  </div>
                )}

                {frequency === 'Weekly' && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Weekly dose scheduled at:</span>
                    <input type="time" className="form-input" value={time1} onChange={(e) => setTime1(e.target.value)} />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={submitting}
            >
              <Plus size={16} />
              {submitting ? 'Creating...' : 'Add to Schedule'}
            </button>
          </form>
        </div>
      </div>

      {/* Medications Schedule List */}
      <div className="grid-span-8">
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-gap" style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
            <Calendar size={22} />
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Medication Dashboard</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px' }}>
            {medications.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {medications.map((med) => (
                  <div key={med._id} className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                      <div className="flex-gap">
                        <div style={{
                          background: med.active ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: med.active ? 'var(--color-primary)' : 'var(--text-muted)',
                          padding: '8px',
                          borderRadius: '8px'
                        }}>
                          <Pill size={18} />
                        </div>
                        <div>
                          <h4 style={{ color: 'white', fontWeight: 600, fontSize: '1.05rem', textDecoration: med.active ? 'none' : 'line-through' }}>
                            {med.name}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {med.dosage}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteMedication(med._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'var(--transition-smooth)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Delete Medication"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      <div>Frequency: <span style={{ color: 'white', fontWeight: 500 }}>{med.frequency}</span></div>
                      {med.times.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', alignItems: 'center' }}>
                          <Clock size={12} color="var(--text-muted)" />
                          <span>Dose Hours:</span>
                          {med.times.map((t, idx) => (
                            <span key={idx} className="badge badge-normal" style={{ fontSize: '0.7rem', padding: '2px 6px', textTransform: 'none', background: 'rgba(16, 185, 129, 0.08)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: med.active ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {med.active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                      <button
                        onClick={() => onToggleActive(med._id, !med.active)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        {med.active ? 'Pause Schedule' : 'Resume Schedule'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-center" style={{ height: '300px', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                <ShieldAlert size={42} style={{ marginBottom: '16px', opacity: 0.4 }} />
                <span>No medications configured. Add your first medicine schedule on the left.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
