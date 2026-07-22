import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Pill, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function PrescriptionScanner({ onAddMedication, setCurrentPage }) {
  const [scanState, setScanState] = useState('idle'); // idle | scanning | completed
  const [extractedMeds, setExtractedMeds] = useState([]);
  const [fileName, setFileName] = useState('');

  // Simulated scan process
  const startMockScan = (name) => {
    setFileName(name);
    setScanState('scanning');
    
    setTimeout(() => {
      setExtractedMeds([
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', times: ['08:00'] },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily', times: ['20:00'] },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily', times: ['08:00', '20:00'] }
      ]);
      setScanState('completed');
    }, 3000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      startMockScan(file.name);
    } else {
      alert('Please upload an image file of the prescription!');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      startMockScan(file.name);
    }
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...extractedMeds];
    updated[index][field] = value;
    setExtractedMeds(updated);
  };

  const handleTimeChange = (medIndex, timeIndex, value) => {
    const updated = [...extractedMeds];
    updated[medIndex].times[timeIndex] = value;
    setExtractedMeds(updated);
  };

  const handleAddMed = (index) => {
    const med = extractedMeds[index];
    const updatedTimes = med.times.filter(Boolean);
    onAddMedication({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      times: updatedTimes.length > 0 ? updatedTimes : ['08:00']
    });
    // Remove from scanner list
    setExtractedMeds(extractedMeds.filter((_, idx) => idx !== index));
    alert(`${med.name} scheduled successfully!`);
  };

  const handleAddAll = async () => {
    for (const med of extractedMeds) {
      await onAddMedication({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        times: med.times.filter(Boolean)
      });
    }
    setExtractedMeds([]);
    setScanState('idle');
    setFileName('');
    alert('All scanned medications successfully scheduled!');
    setCurrentPage('medications');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Upload Zone & Scanning Animation */}
      {scanState === 'idle' && (
        <div 
          className="glass-panel glass-panel-glow" 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            borderStyle: 'dashed',
            borderWidth: '2px',
            textAlign: 'center',
            padding: '48px 24px',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('scan-file-input').click()}
        >
          <input 
            type="file" 
            id="scan-file-input" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileInputChange}
          />
          <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: '16px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', marginBottom: '16px' }}>
            <Upload size={36} />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '8px' }}>Scan Medical Prescription</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '350px', margin: '0 auto 16px auto' }}>
            Drag and drop your clinical prescription sheet image here or click to select from your disk
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports PNG, JPEG, and WebP</span>
        </div>
      )}

      {scanState === 'scanning' && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '24px' }}>
            <div className="pulse-glow" style={{
              animation: 'pulseGlow 1.5s infinite ease-in-out',
              background: 'rgba(6,182,212,0.1)',
              padding: '20px',
              borderRadius: '50%',
              color: 'var(--color-info)'
            }}>
              <Camera size={40} />
            </div>
            {/* Visual scan light line */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '-20%',
              width: '140%',
              height: '2px',
              background: 'var(--color-info)',
              boxShadow: '0 0 10px var(--color-info)',
              animation: 'pulseGlow 2s infinite ease'
            }} />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '8px' }}>Processing Prescription Image</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Running AI OCR character recognition on: <span style={{ color: 'white', fontWeight: 600 }}>{fileName}</span>
          </p>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', color: 'var(--color-info)', fontSize: '0.8rem', fontWeight: 600 }}>
            <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Parsing schedule slots & dosage indicators...</span>
          </div>
        </div>
      )}

      {/* Scanned Results Panel */}
      {scanState === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <div className="flex-between">
              <div className="flex-gap" style={{ color: 'var(--color-success)' }}>
                <Check size={20} />
                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Scan Completed Successfully</h3>
              </div>
              <button 
                onClick={() => { setScanState('idle'); setExtractedMeds([]); }}
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                Scan Another
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
              We've identified 3 medications. Review the scheduled fields and click save to load them.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {extractedMeds.map((med, index) => (
              <div key={index} className="glass-panel" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  
                  <div style={{ color: 'var(--color-primary)', background: 'rgba(99,102,241,0.1)', padding: '12px', borderRadius: '12px' }}>
                    <Pill size={24} />
                  </div>

                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                    {/* Drug Name input */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Drug Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={med.name} 
                        onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                      />
                    </div>

                    {/* Dosage input */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Dosage</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={med.dosage} 
                        onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                      />
                    </div>

                    {/* Frequency input */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Frequency</label>
                      <select 
                        className="form-input" 
                        value={med.frequency}
                        onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                        style={{ background: 'rgba(10, 12, 22, 0.8)', border: '1px solid var(--border-light)' }}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Twice Daily">Twice Daily</option>
                        <option value="Three Times Daily">Three Times Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="As Needed">As Needed</option>
                      </select>
                    </div>

                    {/* Scheduled Times */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Reminder Times</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {med.times.map((time, tIdx) => (
                          <input 
                            key={tIdx}
                            type="time" 
                            className="form-input"
                            style={{ padding: '6px', fontSize: '0.8rem' }}
                            value={time}
                            onChange={(e) => handleTimeChange(index, tIdx, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Add action */}
                  <button 
                    onClick={() => handleAddMed(index)}
                    className="btn btn-primary"
                    style={{ padding: '10px 18px', fontSize: '0.85rem', alignSelf: 'center' }}
                  >
                    <span>Schedule</span>
                  </button>

                </div>
              </div>
            ))}
          </div>

          {extractedMeds.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setScanState('idle'); setExtractedMeds([]); }}
                className="btn btn-secondary"
              >
                Clear Results
              </button>
              <button 
                onClick={handleAddAll}
                className="btn btn-primary"
                style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
              >
                <Sparkles size={16} />
                <span>Save All Scanned</span>
              </button>
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
              <AlertCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ color: 'var(--text-secondary)' }}>All scanned prescription meds have been scheduled.</p>
              <button 
                onClick={() => setCurrentPage('medications')}
                className="btn btn-primary" 
                style={{ marginTop: '16px' }}
              >
                Go to Medications Manager
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
