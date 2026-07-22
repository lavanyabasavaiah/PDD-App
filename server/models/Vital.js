import mongoose from 'mongoose';

const VitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  systolic: {
    type: Number, // BP Systolic (mmHg)
    required: false
  },
  diastolic: {
    type: Number, // BP Diastolic (mmHg)
    required: false
  },
  heartRate: {
    type: Number, // bpm
    required: false
  },
  temperature: {
    type: Number, // °C
    required: false
  },
  spo2: {
    type: Number, // % (blood oxygen saturation)
    required: false
  },
  respiratoryRate: {
    type: Number, // breaths/min
    required: false
  },
  bloodSugar: {
    type: Number, // mg/dL
    required: false
  },
  bloodSugarType: {
    type: String,
    enum: ['Fasting', 'Post-Prandial', 'Random'],
    required: false
  },
  sleepHours: {
    type: Number, // hours
    required: false
  },
  sleepQuality: {
    type: String, // Poor, Fair, Good, Excellent
    required: false
  },
  waterIntake: {
    type: Number, // ml
    required: false
  },
  stepsCount: {
    type: Number, // count
    required: false
  },
  weight: {
    type: Number, // kg
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Vital', VitalSchema);

