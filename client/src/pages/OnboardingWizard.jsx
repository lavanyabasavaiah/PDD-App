import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  Brain, 
  Bell, 
  Shield, 
  Camera, 
  Check, 
  Lock, 
  ArrowRight,
  Activity,
  User,
  Footprints as StepsIcon,
  Moon,
  Droplets,
  Scale
} from 'lucide-react';

export default function OnboardingWizard({ 
  stage: initialStage = 'splash', 
  user, 
  token,
  onComplete,
  onCancel,
  onVerifyOTP
}) {
  const [stage, setStage] = useState(initialStage);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(true);

  // Profile Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState(user?.age || '30');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [selectedPhoto, setSelectedPhoto] = useState(''); // avatar selection or base64
  const [allergies, setAllergies] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  
  // Goals State
  const [stepsGoal, setStepsGoal] = useState(8000);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [weightGoal, setWeightGoal] = useState(70);

  // Permissions State
  const [permNotifications, setPermNotifications] = useState(false);
  const [permCamera, setPermCamera] = useState(false);
  const [permFitness, setPermFitness] = useState(false);

  const predefinedAvatars = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Missy'
  ];

  const commonConditions = [
    'Hypertension',
    'Type 2 Diabetes',
    'Asthma',
    'Heart Disease',
    'High Cholesterol',
    'Thyroid Disorder',
    'None'
  ];

  // Splash Timer
  useEffect(() => {
    if (stage === 'splash') {
      const timer = setTimeout(() => {
        setStage('intro');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    // Simulate/Call API
    if (onVerifyOTP) {
      onVerifyOTP(code);
    } else {
      // Simulation success
      setStage('create-profile');
    }
  };

  const handleConditionToggle = (cond) => {
    if (cond === 'None') {
      setSelectedConditions(['None']);
      return;
    }
    const filtered = selectedConditions.filter(c => c !== 'None');
    if (filtered.includes(cond)) {
      setSelectedConditions(filtered.filter(c => c !== cond));
    } else {
      setSelectedConditions([...filtered, cond]);
    }
  };

  const handleSaveWizard = async () => {
    const allergyList = allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [];
    const conditionList = selectedConditions.filter(c => c !== 'None');

    const profileData = {
      fullName,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      bloodGroup,
      allergies: allergyList,
      conditions: conditionList,
      goals: {
        steps: Number(stepsGoal),
        sleep: Number(sleepGoal),
        water: Number(waterGoal),
        weight: Number(weightGoal)
      },
      profilePhoto: selectedPhoto || predefinedAvatars[0],
      settings: {
        tempUnit: 'C',
        weightUnit: 'kg',
        sosTrigger: 5
      },
      onboardingComplete: true
    };

    try {
      await onComplete(profileData);
    } catch (err) {
      console.error('Failed to complete onboarding profile update', err);
    }
  };

  // Render Splash Screen
  if (stage === 'splash') {
    return (
      <div className="flex-center animate-fade-in" style={{
        height: '100vh',
        width: '100vw',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
      }}>
        <div className="pulse-glow-danger" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '24px',
          borderRadius: '50%',
          marginBottom: '20px',
          animation: 'pulseGlow 1.8s infinite ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <HeartPulse size={72} color="var(--color-primary)" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>
          VitalTrack
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem', fontWeight: 500 }}>
          AI Intelligent Health Companion
        </p>
        <button 
          onClick={() => setStage('intro')}
          className="btn btn-secondary"
          style={{ marginTop: '40px', padding: '8px 18px', fontSize: '0.85rem' }}
        >
          Skip Intro
        </button>
      </div>
    );
  }

  // Render App Intro
  if (stage === 'intro') {
    return (
      <div className="flex-center animate-fade-in" style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--bg-primary)',
        padding: '20px'
      }}>
        <div className="glass-panel glass-panel-glow" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '12px' }}>Welcome to VitalTrack</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Empower your health journey with real-time analytics, automated medication logging, prescription scanner, and AI clinical support.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <Activity size={18} />
              </div>
              <div>
                <h4 style={{ color: 'white', fontSize: '0.95rem' }}>Automated Vital Logging</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track blood pressure, oxygen, blood sugar, steps and weight in one hub.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--color-info)', background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '8px' }}>
                <Brain size={18} />
              </div>
              <div>
                <h4 style={{ color: 'white', fontSize: '0.95rem' }}>AI Intelligent Monitor</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Detect anomalous health trends and read custom diagnostic suggestions.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setStage('onboarding1')} 
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Render Onboarding slide 1
  if (stage === 'onboarding1') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>
            <Activity size={64} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>Track Vitals & Activity</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
            Monitor key metrics like Heart Rate, Blood Sugar, Blood Pressure, Sleep quality, hydration levels, and daily Steps easily.
          </p>

          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Heart Rate</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>72 bpm (Normal)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Blood Pressure</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>120/80 mmHg (Normal)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStage('intro')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
            <button onClick={() => setStage('onboarding2')} className="btn btn-primary" style={{ flex: 2 }}>Next Slide</button>
          </div>
        </div>
      </div>
    );
  }

  // Render Onboarding slide 2
  if (stage === 'onboarding2') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-info)', marginBottom: '20px' }}>
            <Brain size={64} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>AI Smart Health Monitor</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
            Get personalized warnings on health anomalies. The system correlates medical metrics with your current active prescription details.
          </p>

          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Trend Alarm</div>
            <p style={{ color: 'white', fontSize: '0.85rem', lineHeight: 1.4 }}>Elevated blood pressure observed after skipping Lisinopril medication.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStage('onboarding1')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
            <button onClick={() => setStage('onboarding3')} className="btn btn-primary" style={{ flex: 2 }}>Next Slide</button>
          </div>
        </div>
      </div>
    );
  }

  // Render Onboarding slide 3
  if (stage === 'onboarding3') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>
            <Bell size={64} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px' }}>Medication Reminders</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
            Set alerts for medications. Avoid missing doses with custom timers, log skipped/taken adherence, and scan prescriptions to add.
          </p>

          <div className="glass-panel" style={{ background: 'rgba(99,102,241,0.05)', padding: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Atorvastatin</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>10mg • Daily • 09:00 PM</div>
            </div>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>Reminder Set</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStage('onboarding2')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
            <button 
              onClick={() => {
                if (token) {
                  setStage('create-profile');
                } else if (onCancel) {
                  onCancel(); // return to register/login
                } else {
                  setStage('otp');
                }
              }} 
              className="btn btn-primary" 
              style={{ flex: 2 }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Screen
  if (stage === 'otp') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: 'var(--color-primary)'
          }}>
            <Lock size={24} />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '8px' }}>Security Code</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
            We've sent a 6-digit confirmation code to your email. Enter the code below to verify.
          </p>

          <form onSubmit={handleVerifyOtpSubmit}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="form-input"
                  style={{
                    width: '45px',
                    height: '50px',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            {otpError && (
              <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: '16px' }}>
                {otpError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>
              Verify Account
            </button>
          </form>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Didn't receive code?{' '}
            <button 
              onClick={() => {
                setOtpSent(true);
                alert('Verification OTP resent!');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Profile Screen
  if (stage === 'create-profile') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', marginBottom: '12px' }}>
              <User size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'white' }}>Create Profile</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Let's configure your basic health dimensions</p>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              className="form-input" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)} 
            />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Age</label>
              <input 
                type="number" 
                className="form-input" 
                value={age}
                onChange={(e) => setAge(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Gender</label>
              <select 
                className="form-input" 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ background: 'rgba(10, 12, 22, 0.8)', border: '1px solid var(--border-light)' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Height (cm)</label>
              <input 
                type="number" 
                className="form-input" 
                value={height}
                onChange={(e) => setHeight(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Weight (kg)</label>
              <input 
                type="number" 
                className="form-input" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)} 
              />
            </div>
          </div>

          <button 
            onClick={() => setStage('upload-photo')} 
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={!fullName}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Upload Profile Photo Screen
  if (stage === 'upload-photo') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>Profile Picture</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Choose a preset avatar or drag a photo here</p>

          {/* Photo circle frame */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            <img 
              src={selectedPhoto || predefinedAvatars[0]} 
              alt="Profile avatar" 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--color-primary)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
              }}
            />
            <label style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              background: 'var(--color-primary)',
              borderRadius: '50%',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              <Camera size={16} color="white" />
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setSelectedPhoto(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Avatar selector */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            {predefinedAvatars.map((url, idx) => (
              <img 
                key={idx}
                src={url} 
                alt="Avatar preset" 
                onClick={() => setSelectedPhoto(url)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: selectedPhoto === url ? '2px solid var(--color-primary)' : '2px solid transparent',
                  opacity: selectedPhoto === url ? 1 : 0.6,
                  transition: 'var(--transition-smooth)'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStage('create-profile')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
            <button onClick={() => setStage('health-setup')} className="btn btn-primary" style={{ flex: 2 }}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  // Health Setup Screen
  if (stage === 'health-setup') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px', textAlign: 'center' }}>Health Conditions</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' }}>Select any pre-existing chronic conditions and record allergies</p>

          <div className="form-group">
            <label className="form-label">Blood Type</label>
            <select 
              className="form-input" 
              value={bloodGroup} 
              onChange={(e) => setBloodGroup(e.target.value)}
              style={{ background: 'rgba(10, 12, 22, 0.8)', border: '1px solid var(--border-light)' }}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '12px' }}>Chronic Conditions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {commonConditions.map(cond => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleConditionToggle(cond)}
                    style={{
                      border: 'none',
                      background: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                      border: '1px solid ' + (isSelected ? 'var(--color-primary)' : 'var(--border-light)')
                    }}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Allergies</label>
            <input 
              type="text" 
              placeholder="e.g. Peanuts, Penicillin (Comma separated)" 
              className="form-input" 
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setStage('upload-photo')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
            <button onClick={() => setStage('goals')} className="btn btn-primary" style={{ flex: 2 }}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  // Goal Selection Screen
  if (stage === 'goals') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px', textAlign: 'center' }}>Daily Health Goals</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '28px', textAlign: 'center' }}>Configure your daily target levels to gauge your health score</p>

          {/* Steps Goal */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StepsIcon size={14} color="var(--color-primary)" /> Step Goal
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{stepsGoal.toLocaleString()} steps</span>
            </div>
            <input 
              type="range" 
              min="3000" 
              max="20000" 
              step="500" 
              value={stepsGoal}
              onChange={(e) => setStepsGoal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
          </div>

          {/* Sleep Goal */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Moon size={14} color="var(--color-info)" /> Sleep Goal
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{sleepGoal} hours</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="10" 
              step="0.5" 
              value={sleepGoal}
              onChange={(e) => setSleepGoal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-info)' }}
            />
          </div>

          {/* Water Goal */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={14} color="var(--color-info)" /> Water Goal
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{waterGoal} ml</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="5000" 
              step="250" 
              value={waterGoal}
              onChange={(e) => setWaterGoal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-info)' }}
            />
          </div>

          {/* Weight Target */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={14} color="var(--color-warning)" /> Target Weight
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{weightGoal} kg</span>
            </div>
            <input 
              type="range" 
              min="40" 
              max="150" 
              step="1" 
              value={weightGoal}
              onChange={(e) => setWeightGoal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-warning)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button onClick={() => setStage('health-setup')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
            <button onClick={() => setStage('permissions')} className="btn btn-primary" style={{ flex: 2 }}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  // Permissions Screen
  if (stage === 'permissions') {
    return (
      <div className="flex-center animate-fade-in" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '460px', width: '100%' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px', textAlign: 'center' }}>App Permissions</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '28px', textAlign: 'center' }}>Grant necessary services to activate AI reminders and scanning logs</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            {/* Notifications */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left', maxWidth: '80%' }}>
                <h4 style={{ color: 'white', fontSize: '0.9rem' }}>Enable Notifications</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Needed for pill reminders, health alerts, and daily updates.</p>
              </div>
              <input 
                type="checkbox" 
                checked={permNotifications} 
                onChange={(e) => setPermNotifications(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
              />
            </div>

            {/* Camera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left', maxWidth: '80%' }}>
                <h4 style={{ color: 'white', fontSize: '0.9rem' }}>Access Camera</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Required for prescription scanning and uploading clinical records.</p>
              </div>
              <input 
                type="checkbox" 
                checked={permCamera} 
                onChange={(e) => setPermCamera(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
              />
            </div>

            {/* Fitness Integration */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left', maxWidth: '80%' }}>
                <h4 style={{ color: 'white', fontSize: '0.9rem' }}>Sync Fitness Activities</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Required to synchronize step counts and sleep cycles automatically.</p>
              </div>
              <input 
                type="checkbox" 
                checked={permFitness} 
                onChange={(e) => setPermFitness(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStage('goals')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
            <button 
              onClick={handleSaveWizard} 
              className="btn btn-primary" 
              style={{ flex: 2, justifyContent: 'center' }}
            >
              <span>Finish Setup</span>
              <Check size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
