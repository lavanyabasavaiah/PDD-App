import React, { useState } from 'react';
import { User, ShieldAlert, Check, Sparkles, Edit3, Mail, Heart, Calendar, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function MedicalProfile({ user, onUpdateProfile }) {
  // Navigation tabs inside profile
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [age, setAge] = useState(user?.age || 35);
  const [gender, setGender] = useState(user?.gender || 'Other');
  const [conditions, setConditions] = useState(user?.conditions || []);
  const [customCondition, setCustomCondition] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  const availableConditions = [
    'Hypertension (High BP)',
    'Diabetes (Type 1 or 2)',
    'Asthma / COPD',
    'Coronary Artery Disease',
    'Chronic Kidney Disease',
    'High Cholesterol',
    'Arrhythmia'
  ];

  const handleToggleCondition = (cond) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter(c => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customCondition && !conditions.includes(customCondition)) {
      setConditions([...conditions, customCondition]);
      setCustomCondition('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setSaving(false);
      return;
    }

    try {
      const updateData = {
        username,
        email,
        age: Number(age),
        gender,
        conditions
      };

      if (password) {
        updateData.password = password;
      }

      await onUpdateProfile(updateData);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setIsEditMode(false); // return to view mode
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-grid animate-fade-in" style={{ marginTop: 0 }}>
      {/* Top Banner Message */}
      {(success || error) && (
        <div className="grid-span-12" style={{ marginBottom: '-8px' }}>
          {success && (
            <div className="flex-gap animate-fade-in" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              padding: '14px 18px',
              color: 'var(--color-success)',
              fontSize: '0.9rem'
            }}>
              <Check size={18} />
              <span>Profile and demographic details updated successfully. AI is now calibrated with your updated settings!</span>
            </div>
          )}
          {error && (
            <div className="flex-gap animate-fade-in" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              padding: '14px 18px',
              color: 'var(--color-danger)',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Main card */}
      <div className="grid-span-7">
        {!isEditMode ? (
          /* ================= VIEW MODE (PATIENT MEDICAL ID CARD) ================= */
          <div className="glass-panel" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Glowing accents */}
            <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '120px',
              height: '120px',
              background: 'var(--color-primary-glow)',
              filter: 'blur(40px)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div className="flex-gap" style={{ color: 'var(--color-primary)' }}>
                <Heart size={22} className="pulse-glow-danger" style={{ animationDuration: '3s' }} />
                <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Digital Patient Medical ID</h3>
              </div>
              <button 
                onClick={() => {
                  setUsername(user?.username || '');
                  setEmail(user?.email || '');
                  setAge(user?.age || 35);
                  setGender(user?.gender || 'Other');
                  setConditions(user?.conditions || []);
                  setIsEditMode(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', gap: '6px' }}
              >
                <Edit3 size={14} />
                Edit Profile
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                color: 'white',
                fontSize: '1.8rem',
                fontWeight: 700
              }}>
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h4 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>{user?.username}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Mail size={12} />
                  {user?.email}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Patient ID: <code style={{ color: 'var(--color-info)', background: 'rgba(6, 182, 212, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>{user?.id}</code>
                </span>
              </div>
            </div>

            {/* Medical Vitals Calibration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                background: 'rgba(10, 12, 22, 0.4)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age Calibration</span>
                <strong style={{ display: 'block', color: 'white', fontSize: '1.8rem', margin: '6px 0', fontFamily: 'var(--font-heading)' }}>{user?.age} yrs</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calibrates HR and Temp baselines</span>
              </div>
              <div style={{
                background: 'rgba(10, 12, 22, 0.4)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Gender</span>
                <strong style={{ display: 'block', color: 'white', fontSize: '1.8rem', margin: '6px 0', fontFamily: 'var(--font-heading)' }}>{user?.gender}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Guides statistical cardiovascular risk</span>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Active Chronic Conditions</label>
              {user?.conditions && user.conditions.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {user.conditions.map(c => (
                    <span 
                      key={c} 
                      className="badge badge-normal" 
                      style={{ 
                        textTransform: 'none', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px dashed var(--border-light)',
                  borderRadius: '10px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={16} color="var(--color-success)" />
                  <span>No pre-existing chronic conditions listed. AI baseline metrics set to Standard Patient Profile.</span>
                </div>
              )}
            </div>

            {/* Footer stamp */}
            <div style={{
              marginTop: '40px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                Registered Patient
              </span>
              <span>VitalTrack Smart Health Card</span>
            </div>
          </div>
        ) : (
          /* ================= EDIT MODE (PATIENT PROFILE EDITOR) ================= */
          <div className="glass-panel" style={{ height: '100%' }}>
            <div className="flex-gap" style={{ marginBottom: '20px', color: 'var(--color-primary)' }}>
              <User size={22} />
              <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Edit Patient Profile</h3>
            </div>

            <form onSubmit={handleSave}>
              {/* Account details section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-light)',
                padding: '18px',
                borderRadius: '10px',
                marginBottom: '24px'
              }}>
                <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Credentials</h4>
                
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Password (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Leave blank to keep current"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Medical demographics section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-light)',
                padding: '18px',
                borderRadius: '10px',
                marginBottom: '24px'
              }}>
                <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medical Baseline Specs</h4>

                <div className="form-group">
                  <label className="form-label">User Age</label>
                  <input
                    type="number"
                    placeholder="Age in years"
                    className="form-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="1"
                    max="120"
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Used by the AI Engine to calibrate standard baseline cardiac and respiratory zones.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Birth Gender</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {['Male', 'Female', 'Other'].map(g => (
                      <label key={g} className="flex-gap" style={{ cursor: 'pointer', color: 'white' }}>
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={gender === g}
                          onChange={(e) => setGender(e.target.value)}
                          style={{
                            accentColor: 'var(--color-primary)',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '12px' }}>Chronic Conditions (Select all that apply)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {availableConditions.map(cond => {
                      const isChecked = conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleToggleCondition(cond)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid',
                            borderColor: isChecked ? 'var(--color-primary)' : 'var(--border-light)',
                            borderRadius: '8px',
                            background: isChecked ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                            color: isChecked ? 'white' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          <span>{cond}</span>
                          {isChecked && <Check size={16} color="var(--color-primary)" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Conditions */}
                <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                  <label className="form-label">Other Conditions</label>
                  <div className="flex-gap">
                    <input
                      type="text"
                      placeholder="Type and press add..."
                      className="form-input"
                      value={customCondition}
                      onChange={(e) => setCustomCondition(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      className="btn btn-secondary"
                      style={{ padding: '10px 16px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* AI Calibration Details */}
      <div className="grid-span-5">
        <div className="glass-panel" style={{ height: '100%', background: 'linear-gradient(135deg, rgba(22, 28, 54, 0.55), rgba(16, 20, 38, 0.7))' }}>
          <div className="flex-gap" style={{ marginBottom: '20px', color: 'var(--color-info)' }}>
            <Sparkles size={22} />
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>AI Diagnostic Calibration</h3>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>
              VitalTrack's built-in AI rules engine runs mathematical filters on cardiac telemetry, core temperature anomalies, and oxygen saturation charts.
            </p>
            <p>
              To prevent misdiagnosis, the thresholds for alerts adjust contextually depending on demographic layers:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <ShieldAlert size={18} color="var(--color-info)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>Vitals Base Levels</h4>
                  <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>Cardiac zones, heart rates, and respiratory expectations can vary as a function of physical development and age.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <ShieldAlert size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>Comorbidity Cross-checking</h4>
                  <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>If "Hypertension" is selected in your profile, the AI engine triggers warning logs when BP exceeds 130/80 (Standard clinical threshold for Stage 1 Hypertension in pre-diagnosed patients).</p>
                </div>
              </div>
            </div>

            {conditions.length > 0 && (
              <div>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Calibrated Comorbidities
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {conditions.map(c => (
                    <span key={c} className="badge badge-normal" style={{ textTransform: 'none', background: 'rgba(99,102,241,0.1)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
