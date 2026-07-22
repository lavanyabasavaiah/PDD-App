import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  User, 
  FileText, 
  Upload, 
  Phone, 
  Users, 
  ShieldAlert, 
  AlertOctagon, 
  Check,
  RefreshCw,
  Heart
} from 'lucide-react';

export default function UtilityHub({ user, onUpdateProfile, medications }) {
  const [activeTab, setActiveTab] = useState('sos'); // appointments | records | sos | family
  
  // SOS countdown states
  const [countdown, setCountdown] = useState(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosCountdownActive, setSosCountdownActive] = useState(false);

  // Appt States
  const [appointments, setAppointments] = useState([
    { id: '1', doctor: 'Dr. Sarah Connor', spec: 'Cardiologist', clinic: 'City Heart Clinic', date: '2026-06-25', time: '10:00' }
  ]);
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptSpec, setApptSpec] = useState('Cardiologist');
  const [apptClinic, setApptClinic] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');

  // Records States
  const [records, setRecords] = useState([
    { id: '1', title: 'Lipid Panel Report', category: 'Lab Report', date: '2026-05-10', fileName: 'lipid_panel_may2026.pdf' }
  ]);
  const [recTitle, setRecTitle] = useState('');
  const [recCat, setRecCat] = useState('Lab Report');
  const [recDate, setRecDate] = useState('');
  const [recFile, setRecFile] = useState(null);
  const [uploadingRecord, setUploadingRecord] = useState(false);

  // Emergency Contact States
  const [contacts, setContacts] = useState(user?.emergencyContacts || [
    { name: 'Mary Watson', phone: '+1 555-0199', relationship: 'Spouse' }
  ]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState('Spouse');

  // Family Access States
  const [familyInvites, setFamilyInvites] = useState(user?.familyAccess || [
    { email: 'son.doe@example.com', role: 'Viewer', status: 'Active' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [generatedCode, setGeneratedCode] = useState('');

  // Sync contacts and family access back to user profile when modified
  const syncToProfile = async (updatedContacts, updatedFamily) => {
    try {
      await onUpdateProfile({
        emergencyContacts: updatedContacts || contacts,
        familyAccess: updatedFamily || familyInvites
      });
    } catch (err) {
      console.error(err);
    }
  };

  // SOS Countdown Timer effect
  useEffect(() => {
    let timer;
    if (sosCountdownActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (sosCountdownActive && countdown === 0) {
      setSosCountdownActive(false);
      setSosTriggered(true);
      setCountdown(null);
      // Simulate sending notifications
      alert('EMERGENCY SOS BROADCAST SENT to contacts: ' + contacts.map(c => c.name).join(', '));
    }
    return () => clearTimeout(timer);
  }, [countdown, sosCountdownActive]);

  const handleStartSOS = () => {
    setCountdown(user?.settings?.sosTrigger || 5);
    setSosCountdownActive(true);
    setSosTriggered(false);
  };

  const handleAbortSOS = () => {
    setSosCountdownActive(false);
    setCountdown(null);
    setSosTriggered(false);
  };

  // Add Appt
  const handleAddAppt = (e) => {
    e.preventDefault();
    if (!apptDoctor || !apptClinic || !apptDate || !apptTime) {
      alert('Please fill out all appointment details.');
      return;
    }
    const newAppt = {
      id: Date.now().toString(),
      doctor: apptDoctor,
      spec: apptSpec,
      clinic: apptClinic,
      date: apptDate,
      time: apptTime
    };
    setAppointments([...appointments, newAppt]);
    setApptDoctor('');
    setApptClinic('');
    setApptDate('');
    setApptTime('');
  };

  const handleDeleteAppt = (id) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  // Add record
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!recTitle || !recDate) {
      alert('Please add record title and date.');
      return;
    }
    setUploadingRecord(true);
    setTimeout(() => {
      const newRec = {
        id: Date.now().toString(),
        title: recTitle,
        category: recCat,
        date: recDate,
        fileName: recFile ? recFile.name : 'uploaded_report_' + Date.now().toString().slice(-4) + '.pdf'
      };
      setRecords([...records, newRec]);
      setRecTitle('');
      setRecDate('');
      setRecFile(null);
      setUploadingRecord(false);
    }, 1500);
  };

  const handleDeleteRecord = (id) => {
    setRecords(records.filter(r => r.id !== id));
  };

  // Add emergency contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      alert('Contact name and phone number required.');
      return;
    }
    const updated = [...contacts, { name: contactName, phone: contactPhone, relationship: contactRel }];
    setContacts(updated);
    await syncToProfile(updated, null);
    setContactName('');
    setContactPhone('');
  };

  const handleDeleteContact = async (index) => {
    const updated = contacts.filter((_, idx) => idx !== index);
    setContacts(updated);
    await syncToProfile(updated, null);
  };

  // Send family invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const updated = [...familyInvites, { email: inviteEmail, role: inviteRole, status: 'Pending' }];
    setFamilyInvites(updated);
    await syncToProfile(null, updated);
    setInviteEmail('');
    alert(`Invite sent successfully to ${inviteEmail}!`);
  };

  const handleDeleteInvite = async (email) => {
    const updated = familyInvites.filter(f => f.email !== email);
    setFamilyInvites(updated);
    await syncToProfile(null, updated);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Subtab Swapper */}
      <div className="glass-panel" style={{ padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {['sos', 'appointments', 'records', 'family'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn"
            style={{
              background: activeTab === tab ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              border: '1px solid ' + (activeTab === tab ? 'var(--color-primary)' : 'var(--border-light)'),
              flex: 1,
              textTransform: 'capitalize',
              flexShrink: 0
            }}
          >
            {tab === 'sos' && <ShieldAlert size={16} />}
            {tab === 'appointments' && <Calendar size={16} />}
            {tab === 'records' && <FileText size={16} />}
            {tab === 'family' && <Users size={16} />}
            <span>{tab === 'sos' ? 'SOS Portal' : tab}</span>
          </button>
        ))}
      </div>

      {/* SOS Panel Portal */}
      {activeTab === 'sos' && (
        <div className="dashboard-grid" style={{ marginTop: 0 }}>
          
          {/* Big SOS pulsing dialer */}
          <div className="grid-span-6 glass-panel flex-center" style={{ flexDirection: 'column', minHeight: '380px' }}>
            
            {!sosCountdownActive && !sosTriggered && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleStartSOS}
                  className="pulse-glow-danger"
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'var(--color-danger)',
                    border: '8px solid rgba(239, 68, 68, 0.25)',
                    color: 'white',
                    fontSize: '2rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    margin: '0 auto 24px auto'
                  }}
                >
                  SOS
                </button>
                <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '6px' }}>One-Touch Emergency Alarm</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
                  Pressing this button starts a {user?.settings?.sosTrigger || 5}s countdown to notify your emergency contacts.
                </p>
              </div>
            )}

            {sosCountdownActive && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '4px solid var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4.5rem',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: '24px',
                  margin: '0 auto 24px auto',
                  animation: 'pulseDangerGlow 1s infinite'
                }}>
                  {countdown}
                </div>
                <h3 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '8px' }}>Broadcasting SOS Alarm...</h3>
                <button onClick={handleAbortSOS} className="btn btn-secondary" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
                  Abort Cancel
                </button>
              </div>
            )}

            {sosTriggered && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  marginBottom: '24px',
                  margin: '0 auto 24px auto'
                }}>
                  <Check size={48} />
                </div>
                <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '6px' }}>SOS Alerts Broadcasted!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Your active contacts have been messaged.
                </p>
                <button onClick={() => setSosTriggered(false)} className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Reset Portal
                </button>
              </div>
            )}

          </div>

          {/* EMT Medical Card */}
          <div className="grid-span-6 glass-panel" style={{ borderLeft: '4px solid var(--color-danger)' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div className="flex-gap" style={{ color: 'var(--color-danger)' }}>
                <AlertOctagon size={22} />
                <h3 style={{ fontSize: '1.1rem', color: 'white' }}>EMT Emergency Medical Card</h3>
              </div>
              <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>Blood Type: {user?.bloodGroup || 'O+'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{user?.fullName || user?.username}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Chronic Diseases:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {user?.conditions && user.conditions.length > 0 ? (
                    user.conditions.map(c => <span key={c} className="badge badge-critical" style={{ fontSize: '0.65rem' }}>{c}</span>)
                  ) : (
                    <span style={{ color: 'white' }}>No conditions registered.</span>
                  )}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Active Scheduled Medications:</span>
                <div style={{ color: 'white', marginTop: '4px' }}>
                  {medications.filter(m => m.active).map(m => `${m.name} (${m.dosage})`).join(', ') || 'No active meds.'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Registered Allergies:</span>
                <div style={{ color: 'var(--color-danger)', fontWeight: 600, marginTop: '2px' }}>
                  {user?.allergies && user.allergies.length > 0 ? user.allergies.join(', ') : 'No known allergies.'}
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>SOS Emergency Contact:</span>
                {contacts.length > 0 ? (
                  <div style={{ color: 'white', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>{contacts[0].name} ({contacts[0].relationship})</span>
                    <span style={{ color: 'var(--color-primary)' }}>{contacts[0].phone}</span>
                  </div>
                ) : (
                  <div style={{ color: 'white', fontSize: '0.8rem' }}>No emergency contact registered yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Manage Emergency Contacts Form */}
          <div className="grid-span-12 glass-panel" style={{ marginTop: '12px' }}>
            <h4 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} color="var(--color-primary)" /> Manage Emergency Contacts List
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contact Name</label>
                  <input type="text" className="form-input" placeholder="e.g. John Watson" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" placeholder="e.g. +1 555-0100" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Relationship</label>
                  <select className="form-input" value={contactRel} onChange={(e) => setContactRel(e.target.value)} style={{ background: 'rgba(10,12,22,0.8)', border: '1px solid var(--border-light)' }}>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Doctor">Primary Doctor</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Add Contact</button>
              </form>

              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {contacts.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px' }}>Name</th>
                        <th style={{ padding: '8px' }}>Relationship</th>
                        <th style={{ padding: '8px' }}>Phone</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((c, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '10px 8px', color: 'white', fontWeight: 600 }}>{c.name}</td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{c.relationship}</td>
                          <td style={{ padding: '10px 8px', color: 'var(--color-primary)', fontWeight: 600 }}>{c.phone}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                            <button onClick={() => handleDeleteContact(idx)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex-center" style={{ height: '140px', color: 'var(--text-secondary)' }}>No contacts added yet.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Appointments tab */}
      {activeTab === 'appointments' && (
        <div className="dashboard-grid" style={{ marginTop: 0 }}>
          <div className="grid-span-4 glass-panel">
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Schedule Appointment</h4>
            <form onSubmit={handleAddAppt} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Doctor Name</label>
                <input type="text" className="form-input" placeholder="e.g. Dr. House" value={apptDoctor} onChange={(e) => setApptDoctor(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Specialization</label>
                <select className="form-input" value={apptSpec} onChange={(e) => setApptSpec(e.target.value)} style={{ background: 'rgba(10,12,22,0.8)', border: '1px solid var(--border-light)' }}>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Endocrinologist">Endocrinologist</option>
                  <option value="General Practitioner">General Practitioner</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Clinic / Location</label>
                <input type="text" className="form-input" placeholder="e.g. Mercy Hospital" value={apptClinic} onChange={(e) => setApptClinic(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={apptDate} onChange={(e) => setApptDate(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" value={apptTime} onChange={(e) => setApptTime(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Schedule</button>
            </form>
          </div>

          <div className="grid-span-8 glass-panel">
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Upcoming Medical Appointments</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appointments.length > 0 ? (
                appointments.map(appt => (
                  <div key={appt.id} className="med-item">
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ color: 'var(--color-primary)', background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '8px' }}>
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white' }}>{appt.doctor}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {appt.spec} • {appt.clinic}
                        </div>
                      </div>
                    </div>
                    <div className="flex-gap">
                      <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                        <div style={{ color: 'white', fontWeight: 600 }}>{appt.date}</div>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{appt.time}</div>
                      </div>
                      <button onClick={() => handleDeleteAppt(appt.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-center" style={{ height: '200px', color: 'var(--text-secondary)' }}>No scheduled appointments.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div className="dashboard-grid" style={{ marginTop: 0 }}>
          <div className="grid-span-4 glass-panel">
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Upload Medical Record</h4>
            <form onSubmit={handleAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Record Title</label>
                <input type="text" className="form-input" placeholder="e.g. Lipids Panel Test" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={recCat} onChange={(e) => setRecCat(e.target.value)} style={{ background: 'rgba(10,12,22,0.8)', border: '1px solid var(--border-light)' }}>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription Sheet">Prescription Sheet</option>
                  <option value="Vaccination Card">Vaccination Card</option>
                  <option value="Diagnostic Scan">Diagnostic Scan</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Record Date</label>
                <input type="date" className="form-input" value={recDate} onChange={(e) => setRecDate(e.target.value)} />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Select File</label>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setRecFile(e.target.files[0])} style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} />
              </div>

              <button type="submit" disabled={uploadingRecord} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                {uploadingRecord ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Record</span>
                )}
              </button>
            </form>
          </div>

          <div className="grid-span-8 glass-panel">
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Medical Record Library Gallery</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {records.map(rec => (
                <div key={rec.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ color: 'var(--color-primary)', display: 'inline-flex', alignSelf: 'flex-start', padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rec.title}>
                      {rec.title}
                    </div>
                    <span className="badge badge-normal" style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: '4px' }}>{rec.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                    <span>{rec.date}</span>
                    <button onClick={() => handleDeleteRecord(rec.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Family Access Tab */}
      {activeTab === 'family' && (
        <div className="dashboard-grid" style={{ marginTop: 0 }}>
          
          <div className="grid-span-4 glass-panel">
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Invite Family Profile sharing</h4>
            <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Family Member Email</label>
                <input type="email" className="form-input" placeholder="e.g. brother@gmail.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Role Access</label>
                <select className="form-input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ background: 'rgba(10,12,22,0.8)', border: '1px solid var(--border-light)' }}>
                  <option value="Viewer">Viewer (Read-only)</option>
                  <option value="Editor">Editor (Full access)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Send Invite Link</button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Or share unique Invite Code</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input type="text" className="form-input" style={{ textAlign: 'center', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }} readOnly value={generatedCode || 'VT-XXXX'} />
                <button 
                  onClick={() => setGeneratedCode('VT-' + Math.floor(1000 + Math.random() * 9000).toString())}
                  className="btn btn-secondary" 
                  style={{ padding: '8px 12px' }}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="grid-span-8 glass-panel">
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Shared Access Directory</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {familyInvites.length > 0 ? (
                familyInvites.map((fam, idx) => (
                  <div key={idx} className="med-item">
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ color: 'var(--color-primary)', background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '8px' }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'white' }}>{fam.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Role: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{fam.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-gap">
                      <span className={`badge ${fam.status === 'Active' ? 'badge-normal' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {fam.status}
                      </span>
                      <button onClick={() => handleDeleteInvite(fam.email)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-center" style={{ height: '200px', color: 'var(--text-secondary)' }}>No family accounts linked.</div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
