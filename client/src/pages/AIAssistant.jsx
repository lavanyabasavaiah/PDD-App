import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  BrainCircuit, 
  Send, 
  Sparkles, 
  CheckSquare, 
  Activity, 
  ShieldAlert, 
  Info,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function AIAssistant({ vitals, user, setCurrentPage }) {
  const [activeSubTab, setActiveSubTab] = useState('chat'); // chat | symptoms
  
  // Chat States
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your VitalTrack AI Medical Assistant. How can I help you check your health metrics today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Symptom Checker states
  const [symptomStep, setSymptomStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomDuration, setSymptomDuration] = useState('2-3 days');
  const [symptomSeverity, setSymptomSeverity] = useState('Moderate');
  const [checkerResult, setCheckerResult] = useState(null);

  const symptomOptions = [
    { id: 'chest_pain', label: 'Chest Pain or Pressure' },
    { id: 'shortness_breath', label: 'Shortness of Breath' },
    { id: 'fever', label: 'High Fever (>38°C)' },
    { id: 'headache', label: 'Severe Headache' },
    { id: 'cough', label: 'Persistent Dry Cough' },
    { id: 'fatigue', label: 'Extreme Fatigue' },
    { id: 'dizziness', label: 'Dizziness or Lightheadedness' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle AI Chat Queries
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const query = userInput;
    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    // Get latest vitals context
    const latestVital = vitals[0] || {};
    
    // Simulate AI response delay
    setTimeout(() => {
      let responseText = "I understand you have a question. Based on your health profile, it is always recommended to check in with a doctor for specific diagnostics.";
      const lower = query.toLowerCase();

      if (lower.includes('bp') || lower.includes('blood pressure')) {
        if (latestVital.systolic) {
          const sys = latestVital.systolic;
          const dia = latestVital.diastolic;
          let rating = "Optimal";
          if (sys >= 140 || dia >= 90) rating = "High (Stage 2 Hypertension)";
          else if (sys >= 120 || dia >= 80) rating = "Elevated";

          responseText = `Your latest recorded Blood Pressure is ${sys}/${dia} mmHg, which is classified as ${rating}. ` + 
                         `If you are experiencing headaches, dizziness, or blurry vision, please consult a practitioner. Keep sodium low and take scheduled hypertension medicines.`;
        } else {
          responseText = "You haven't recorded any blood pressure values recently. You can head over to the Vitals Tracker to log your systolic/diastolic levels.";
        }
      } else if (lower.includes('heart') || lower.includes('pulse') || lower.includes('bpm')) {
        if (latestVital.heartRate) {
          responseText = `Your latest recorded resting pulse is ${latestVital.heartRate} bpm. A normal resting rate is between 60 to 100 bpm. ` +
                         `Your current reading is stable. If it spikes above 120 bpm at rest, or if you feel palpitations, record details and contact care.`;
        } else {
          responseText = "There are no pulse logs in your database yet. Let me know if you would like me to show you how to log heart rate values.";
        }
      } else if (lower.includes('oxygen') || lower.includes('spo2')) {
        if (latestVital.spo2) {
          responseText = `Your blood oxygen level is measured at ${latestVital.spo2}%. Normal levels range from 95% to 100%. ` + 
                         (latestVital.spo2 < 95 ? "This is slightly low. Ensure you practice deep breathing exercises." : "This is in the healthy optimal range.");
        } else {
          responseText = "Your oxygen saturation level has not been logged. Consider recording a reading if you have an oximeter.";
        }
      } else if (lower.includes('sugar') || lower.includes('glucose') || lower.includes('diabetes')) {
        if (latestVital.bloodSugar) {
          responseText = `Your latest blood sugar reading is ${latestVital.bloodSugar} mg/dL (${latestVital.bloodSugarType || 'Fasting'}). ` +
                         (latestVital.bloodSugar >= 126 ? "This is in the high/diabetic range. Please consult an endocrinologist." : "This is currently within the standard range.");
        } else {
          responseText = "You haven't logged blood sugar readings. Tracking fasting glucose can help spot pre-diabetic tendencies.";
        }
      } else if (lower.includes('fever') || lower.includes('temp') || lower.includes('temperature')) {
        if (latestVital.temperature) {
          responseText = `Your last temperature reading was ${latestVital.temperature}°C. Standard human temperature ranges from 36.5°C to 37.5°C. ` +
                         (latestVital.temperature >= 38.0 ? "You have a mild fever. Ensure hydration and rest." : "Your body temperature is normal.");
        } else {
          responseText = "No temperature records found in your dashboard logs.";
        }
      } else if (lower.includes('hello') || lower.includes('hi')) {
        responseText = `Hello ${user?.fullName || user?.username || ''}! I'm looking at your health records. Is there a specific metric (blood pressure, sugar, sleep, pulse) you want to talk about?`;
      } else if (lower.includes('sleep') || lower.includes('tired')) {
        const sleepLogs = vitals.filter(v => v.sleepHours !== undefined);
        if (sleepLogs.length > 0) {
          const avgSleep = (sleepLogs.reduce((a, c) => a + c.sleepHours, 0) / sleepLogs.length).toFixed(1);
          responseText = `Your logged sleep averages ${avgSleep} hours. The recommended target is 7-9 hours per night. ` +
                         (avgSleep < 6.5 ? "You seem to be sleep-deprived lately. Rest is critical for heart recovery." : "You are maintaining healthy sleep cycles.");
        } else {
          responseText = "I don't have sleep logs to analyze. Try logging your hours slept in the trackers panel.";
        }
      }

      setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      setIsTyping(false);
    }, 1500);
  };

  // Process Symptom checker Questionnaire
  const handleSymptomSubmit = () => {
    // Determine Triage
    let tier = 'Self-Care';
    let action = 'Rest and hydrate. Track your temperature and blood pressure every 4 hours. If symptoms persist beyond 5 days, book a clinic visit.';
    let icon = Info;
    let color = 'var(--color-success)';

    const hasCritical = selectedSymptoms.includes('chest_pain') || selectedSymptoms.includes('shortness_breath');
    const isSevere = symptomSeverity === 'Severe';

    if (hasCritical && isSevere) {
      tier = 'EMERGENCY WARNING';
      action = 'URGENT: Your symptoms indicate potential cardiovascular or respiratory distress. Press the emergency SOS button immediately or call emergency services (911).';
      icon = ShieldAlert;
      color = 'var(--color-danger)';
    } else if (hasCritical || isSevere) {
      tier = 'Urgent Care Required';
      action = 'Warning: We suggest contacting a telehealth advisor or booking a same-day doctor appointment. Do not engage in strenuous physical activity.';
      icon = AlertTriangle;
      color = 'var(--color-warning)';
    } else if (selectedSymptoms.includes('fever') && symptomDuration === '1 week+') {
      tier = 'Doctor Consultation Recommended';
      action = 'A persistent fever lasting over a week requires checking by a general practitioner to rule out bacterial infections.';
      icon = Calendar;
      color = 'var(--color-info)';
    }

    setCheckerResult({
      tier,
      action,
      symptoms: selectedSymptoms.map(s => symptomOptions.find(o => o.id === s).label),
      severity: symptomSeverity,
      duration: symptomDuration,
      icon,
      color
    });
    setSymptomStep(5);
  };

  const resetSymptomChecker = () => {
    setSymptomStep(1);
    setSelectedSymptoms([]);
    setSymptomDuration('2-3 days');
    setSymptomSeverity('Moderate');
    setCheckerResult(null);
  };

  const handleSymptomSelect = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Subtab selection */}
      <div className="glass-panel" style={{ padding: '12px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveSubTab('chat')}
          className="btn"
          style={{
            background: activeSubTab === 'chat' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
            color: activeSubTab === 'chat' ? 'white' : 'var(--text-secondary)',
            border: '1px solid ' + (activeSubTab === 'chat' ? 'var(--color-primary)' : 'var(--border-light)'),
            flex: 1
          }}
        >
          <MessageSquare size={16} />
          <span>AI Health Assistant Chat</span>
        </button>
        <button
          onClick={() => setActiveSubTab('symptoms')}
          className="btn"
          style={{
            background: activeSubTab === 'symptoms' ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
            color: activeSubTab === 'symptoms' ? 'white' : 'var(--text-secondary)',
            border: '1px solid ' + (activeSubTab === 'symptoms' ? 'var(--color-primary)' : 'var(--border-light)'),
            flex: 1
          }}
        >
          <CheckSquare size={16} />
          <span>Symptom Checker Triage</span>
        </button>
      </div>

      {/* Main View Area */}
      {activeSubTab === 'chat' ? (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
          
          {/* Chat header */}
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div className="flex-gap">
              <BrainCircuit size={22} color="var(--color-primary)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'white', lineHeight: 1 }}>AI Clinical Copilot</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>Always active</span>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>References latest vital records</span>
          </div>

          {/* Bubbles log */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '4px', marginBottom: '16px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender === 'ai' ? 'ai' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Sparkles size={14} style={{ animation: 'spin 2s linear infinite' }} />
                <span>AI clinical assistant is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input form */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ask about blood pressure, sugar logs, sleep metrics..."
              className="form-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }} disabled={isTyping || !userInput.trim()}>
              <Send size={16} />
            </button>
          </form>

        </div>
      ) : (
        // Symptom Checker View
        <div className="glass-panel">
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckSquare size={22} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.15rem', color: 'white' }}>Clinical Symptom Triage Checker</h3>
          </div>

          {symptomStep === 1 && (
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Step 1: Select symptoms you are experiencing</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {symptomOptions.map(opt => {
                  const isSelected = selectedSymptoms.includes(opt.id);
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => handleSymptomSelect(opt.id)}
                      style={{
                        padding: '12px 16px',
                        background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
                        border: '1px solid ' + (isSelected ? 'var(--color-primary)' : 'var(--border-light)'),
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <span style={{ color: isSelected ? 'white' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500 }}>
                        {opt.label}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // handled by div click
                        style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                      />
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => setSymptomStep(2)} 
                className="btn btn-primary" 
                disabled={selectedSymptoms.length === 0}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Continue to Duration
              </button>
            </div>
          )}

          {symptomStep === 2 && (
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Step 2: How long have you felt these symptoms?</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {['1 day or less', '2-3 days', '4-7 days', '1 week+'].map(dur => (
                  <label 
                    key={dur} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      background: symptomDuration === dur ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
                      border: '1px solid ' + (symptomDuration === dur ? 'var(--color-primary)' : 'var(--border-light)'),
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: symptomDuration === dur ? 'white' : 'var(--text-secondary)',
                      fontWeight: symptomDuration === dur ? 600 : 500
                    }}
                  >
                    <input 
                      type="radio" 
                      name="duration" 
                      checked={symptomDuration === dur}
                      onChange={() => setSymptomDuration(dur)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>{dur}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setSymptomStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                <button onClick={() => setSymptomStep(3)} className="btn btn-primary" style={{ flex: 2 }}>Continue to Severity</button>
              </div>
            </div>
          )}

          {symptomStep === 3 && (
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Step 3: Grade the intensity of the discomfort</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {['Mild', 'Moderate', 'Severe'].map(sev => (
                  <label 
                    key={sev} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      background: symptomSeverity === sev ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
                      border: '1px solid ' + (symptomSeverity === sev ? 'var(--color-primary)' : 'var(--border-light)'),
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: symptomSeverity === sev ? 'white' : 'var(--text-secondary)',
                      fontWeight: symptomSeverity === sev ? 600 : 500
                    }}
                  >
                    <input 
                      type="radio" 
                      name="severity" 
                      checked={symptomSeverity === sev}
                      onChange={() => setSymptomSeverity(sev)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>{sev}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setSymptomStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                <button onClick={handleSymptomSubmit} className="btn btn-primary" style={{ flex: 2 }}>Run Assessment Report</button>
              </div>
            </div>
          )}

          {symptomStep === 5 && checkerResult && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              {(() => {
                const Icon = checkerResult.icon;
                return (
                  <div style={{ color: checkerResult.color, display: 'inline-flex', padding: '16px', background: checkerResult.color + '1a', borderRadius: '50%', marginBottom: '16px' }}>
                    <Icon size={44} />
                  </div>
                );
              })()}
              <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '8px' }}>{checkerResult.tier}</h3>
              
              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', margin: '20px auto', maxWidth: '440px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Evaluated symptoms:</strong> {checkerResult.symptoms.join(', ')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Duration:</strong> {checkerResult.duration} | <strong>Intensity:</strong> {checkerResult.severity}
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '10px', fontSize: '0.9rem', color: 'white', lineHeight: 1.5 }}>
                  {checkerResult.action}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', maxWidth: '440px', margin: '0 auto' }}>
                <button onClick={resetSymptomChecker} className="btn btn-secondary" style={{ flex: 1 }}>Run Again</button>
                {checkerResult.tier.includes('EMERGENCY') ? (
                  <button onClick={() => setCurrentPage('sos')} className="btn btn-danger" style={{ flex: 2 }}>
                    Trigger SOS Alert
                  </button>
                ) : (
                  <button onClick={() => setCurrentPage('dashboard')} className="btn btn-primary" style={{ flex: 2 }}>
                    Return to Dashboard
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
