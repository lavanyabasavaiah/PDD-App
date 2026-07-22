import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vital',
    required: false
  },
  type: {
    type: String,
    enum: ['Blood Pressure', 'Heart Rate', 'Temperature', 'Oxygen', 'Medication', 'General'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical'],
    default: 'Warning'
  },
  status: {
    type: String,
    enum: ['Unread', 'Read', 'Resolved'],
    default: 'Unread'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Alert', AlertSchema);
