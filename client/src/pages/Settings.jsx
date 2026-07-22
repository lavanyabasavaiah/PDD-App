import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Sliders, 
  Trash2, 
  Check, 
  Volume2, 
  ShieldAlert, 
  HelpCircle 
} from 'lucide-react';

export default function Settings({ user, onUpdateProfile, onClearDatabase }) {
  const [activeSubTab, setActiveSubTab] = useState('profile'); // profile | settings

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [age, setAge] = useState(user?.age || 35);
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [height, setHeight] = useState(user?.height || 170);
  const [weight, setWeight] = useState(user?.weight || 70);
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(user?.allergies ? user.allergies.join(', ') : '');

  // Settings Configuration
  const [tempUnit, setTempUnit] = useState(user?.settings?.tempUnit || 'C');
  const [weightUnit, setWeightUnit] = useState(user?.settings?.weightUnit || 'kg');
  const [sosTrigger, setSosTrigger] = useState(user?.settings?.sosTrigger || 5);
  const [volume, setVolume] = useState(80);
  const [updating, setUpdating] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const allergyList = allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    try {
      await onUpdateProfile({
        fullName,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        bloodGroup,
        allergies: allergyList
      });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating profile settings.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await onUpdateProfile({
        settings: {
          tempUnit,
          weightUnit,
          sosTrigger: Number(sosTrigger)
        }
      });
      alert('Configurations saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving configuration details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleWipeDatabase = () => {
    const confirmWipe = window.confirm('WARNING: Are you sure you want to clear your vital measurement logs? This cannot be undone.');
    if (confirmWipe) {
      if (onClearDatabase) {
        onClearDatabase();
      } else {
        alert('Simulation: Log database wiped successfully!');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tab selection */}
      <div className="glass-panel" style={{ padding: '12px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveSubTab('profile')}
          className="btn"
          style={{
            background: activeSubTab === 'profile' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
            color: activeSubTab === 'profile' ? 'white' : 'var(--text-secondary)',
            border: '1px solid ' + (activeSubTab === 'profile' ? 'var(--color-primary)' : 'var(--border-light)'),
            flex: 1
          }}
        >
          <User size={16} />
          <span>Edit Medical Profile</span>
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className="btn"
          style={{
            background: activeSubTab === 'settings' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
            color: activeSubTab === 'settings' ? 'white' : 'var(--text-secondary)',
            border: '1px solid ' + (activeSubTab === 'settings' ? 'var(--color-primary)' : 'var(--border-light)'),
            flex: 1
          }}
        >
          <SettingsIcon size={16} />
          <span>System Configurations</span>
        </button>
      </div>

      {/* Profile Editor Tab */}
      {activeSubTab === 'profile' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', color: 'var(--color-primary)' }}>
            <User size={22} />
            <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Edit Medical Characteristics</h3>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-input" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: 'rgba(10,12,22,0.8)', border: '1px solid var(--border-light)' }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" className="form-input" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" className="form-input" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={{ background: 'rgba(10,12,22,0.8)', border: '1px solid var(--border-light)' }}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Allergies (Comma separated)</label>
              <input type="text" className="form-input" placeholder="e.g. Nuts, Penicillin" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
            </div>

            <button type="submit" disabled={updating} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
              {updating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* System Configurations tab */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', color: 'var(--color-primary)' }}>
              <Sliders size={22} />
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Unit & Notification Options</h3>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-row">
                {/* Temp units */}
                <div className="form-group">
                  <label className="form-label">Temperature Unit</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setTempUnit('C')} className="btn" style={{ flex: 1, background: tempUnit === 'C' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)', color: 'white' }}>°C (Celsius)</button>
                    <button type="button" onClick={() => setTempUnit('F')} className="btn" style={{ flex: 1, background: tempUnit === 'F' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)', color: 'white' }}>°F (Fahrenheit)</button>
                  </div>
                </div>

                {/* Weight units */}
                <div className="form-group">
                  <label className="form-label">Weight Unit</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setWeightUnit('kg')} className="btn" style={{ flex: 1, background: weightUnit === 'kg' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)', color: 'white' }}>kg (Kilograms)</button>
                    <button type="button" onClick={() => setWeightUnit('lbs')} className="btn" style={{ flex: 1, background: weightUnit === 'lbs' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)', color: 'white' }}>lbs (Pounds)</button>
                  </div>
                </div>
              </div>

              {/* SOS slider trigger delay */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label">SOS Countdown Trigger</label>
                  <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{sosTrigger} seconds</span>
                </div>
                <input type="range" min="3" max="15" value={sosTrigger} onChange={(e) => setSosTrigger(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
              </div>

              {/* Volume scale */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Volume2 size={14} /> Reminder Alerts Volume</label>
                  <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{volume}%</span>
                </div>
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
              </div>

              <button type="submit" disabled={updating} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {updating ? 'Saving...' : 'Save Configuration Options'}
              </button>

            </form>
          </div>

          {/* Database Wipe Actions */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-danger)' }}>
            <h4 style={{ color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={18} color="var(--color-danger)" /> Advanced Data Maintenance
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Wipe out all local tracking database records. This will reset your trends, steps, blood sugar history, and active insights report summaries.
            </p>
            <button onClick={handleWipeDatabase} className="btn btn-danger" style={{ display: 'inline-flex', gap: '8px' }}>
              <Trash2 size={16} />
              <span>Clear Database Records</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
