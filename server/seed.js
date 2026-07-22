import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Vital from './models/Vital.js';
import Medication from './models/Medication.js';
import Alert from './models/Alert.js';
import Insight from './models/Insight.js';
import { analyzeNewVital } from './utils/aiEngine.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/vitaltrack';

async function seed() {
  console.log('Connecting to database for seeding...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Clear existing databases
  console.log('Clearing old collections...');
  await User.deleteMany({});
  await Vital.deleteMany({});
  await Medication.deleteMany({});
  await Alert.deleteMany({});
  await Insight.deleteMany({});

  // 1. Create Demo User
  console.log('Creating demo user...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const demoUser = new User({
    username: 'demo_patient',
    email: 'demo@vitaltrack.com',
    password: hashedPassword,
    age: 48,
    gender: 'Male',
    conditions: ['Hypertension (High BP)']
  });
  await demoUser.save();
  console.log(`Demo User created. Username: demo_patient, Password: password123`);

  // 2. Create Medications
  console.log('Adding scheduled medications...');
  
  // Calculate timestamps for the past 7 days
  const now = new Date();
  const getPastDateStr = (daysAgo) => {
    const d = new Date(now);
    d.setDate(now.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const lisinopril = new Medication({
    userId: demoUser._id,
    name: 'Lisinopril (BP Medication)',
    dosage: '10mg',
    frequency: 'Daily',
    times: ['08:00'],
    startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    active: true,
    logs: [
      { date: getPastDateStr(6), time: '08:00', status: 'taken' },
      { date: getPastDateStr(5), time: '08:00', status: 'taken' },
      { date: getPastDateStr(4), time: '08:00', status: 'taken' },
      { date: getPastDateStr(3), time: '08:00', status: 'taken' },
      { date: getPastDateStr(2), time: '08:00', status: 'taken' },
      { date: getPastDateStr(1), time: '08:00', status: 'skipped' }, // Skipped yesterday
      { date: getPastDateStr(0), time: '08:00', status: 'skipped' }  // Skipped today
    ]
  });

  const omega3 = new Medication({
    userId: demoUser._id,
    name: 'Omega-3 Fish Oil',
    dosage: '1000mg',
    frequency: 'Daily',
    times: ['20:00'],
    startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    active: true,
    logs: [
      { date: getPastDateStr(6), time: '20:00', status: 'taken' },
      { date: getPastDateStr(5), time: '20:00', status: 'taken' },
      { date: getPastDateStr(4), time: '20:00', status: 'taken' },
      { date: getPastDateStr(3), time: '20:00', status: 'taken' },
      { date: getPastDateStr(2), time: '20:00', status: 'taken' },
      { date: getPastDateStr(1), time: '20:00', status: 'taken' }
    ]
  });

  await lisinopril.save();
  await omega3.save();
  console.log('Medications seeded successfully.');

  // 3. Create historical vitals
  console.log('Seeding vital history logs...');
  const vitalsData = [
    { daysAgo: 6, systolic: 118, diastolic: 76, heartRate: 68, temperature: 36.5, spo2: 98, respiratoryRate: 15 },
    { daysAgo: 5, systolic: 120, diastolic: 78, heartRate: 70, temperature: 36.6, spo2: 97, respiratoryRate: 16 },
    { daysAgo: 4, systolic: 122, diastolic: 80, heartRate: 72, temperature: 36.5, spo2: 98, respiratoryRate: 15 },
    { daysAgo: 3, systolic: 128, diastolic: 82, heartRate: 74, temperature: 36.7, spo2: 97, respiratoryRate: 16 },
    { daysAgo: 2, systolic: 134, diastolic: 86, heartRate: 80, temperature: 37.0, spo2: 96, respiratoryRate: 17 }, // BP starting to rise
    { daysAgo: 1, systolic: 142, diastolic: 92, heartRate: 86, temperature: 37.4, spo2: 96, respiratoryRate: 18 }  // First day skipping medication, BP hits hypertension
  ];

  const savedVitals = [];
  for (const v of vitalsData) {
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - v.daysAgo);
    
    const vital = new Vital({
      userId: demoUser._id,
      ...v,
      timestamp,
      notes: v.daysAgo === 1 ? 'Feeling slightly lightheaded.' : ''
    });
    
    await vital.save();
    savedVitals.push(vital);
  }

  // 4. Log today's vital log (which triggers the AI alert rules)
  console.log("Logging today's vital log and triggering AI engine check...");
  const todayVital = new Vital({
    userId: demoUser._id,
    systolic: 148,
    diastolic: 95,
    heartRate: 92,
    temperature: 37.8,
    spo2: 95,
    respiratoryRate: 19,
    notes: 'Mild headache. BP is trending higher.',
    timestamp: now
  });
  await todayVital.save();

  // Run AI analysis on today's vital (passing historical ones)
  const history = [...savedVitals].reverse(); // newest first
  const medications = [lisinopril, omega3];
  
  const alerts = await analyzeNewVital(todayVital, demoUser, history, medications);
  console.log(`AI Engine completed. Generated ${alerts.length} health alerts.`);

  // 5. Generate AI Insight Report
  console.log('Generating AI Insight report...');
  
  // Combine all vitals
  const allVitals = [...savedVitals, todayVital].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate average BP, HR, SpO2
  const avgSys = Math.round(allVitals.reduce((acc, v) => acc + v.systolic, 0) / allVitals.length);
  const avgDia = Math.round(allVitals.reduce((acc, v) => acc + v.diastolic, 0) / allVitals.length);
  const avgHR = Math.round(allVitals.reduce((acc, v) => acc + v.heartRate, 0) / allVitals.length);
  
  const demoInsight = new Insight({
    userId: demoUser._id,
    summary: `Your average Blood Pressure over the last 7 days is ${avgSys}/${avgDia} mmHg (Hypertension Stage 2). A clear upward trend is observed, culminating in a BP reading of 148/95 mmHg today. This cardiac strain matches consecutive skips in your Lisinopril medication.`,
    recommendation: `• CORRELATION NOTICE: Your BP has climbed 30 mmHg in direct alignment with skipping your morning Lisinopril doses for the last two days. Resume your daily schedule immediately.\n• Monitor your heart rate (currently averaging ${avgHR} bpm). If you continue to experience a mild headache or dizziness, consult your healthcare provider.\n• Reduce sodium intake to under 1,500mg/day and engage in 10-15 minutes of quiet relaxation breathing.`,
    analysisType: 'On-Demand',
    timestamp: now
  });
  
  await demoInsight.save();
  console.log('AI Insight report saved.');

  console.log('Database seeding complete. Shutting down connection...');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
