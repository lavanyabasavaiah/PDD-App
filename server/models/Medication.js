import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed'],
    default: 'Daily'
  },
  times: {
    type: [String], // Array of scheduled times, e.g. ["08:00", "20:00"]
    default: ["08:00"]
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: false
  },
  active: {
    type: Boolean,
    default: true
  },
  logs: [
    {
      date: {
        type: String, // YYYY-MM-DD
        required: true
      },
      time: {
        type: String, // HH:MM
        required: true
      },
      status: {
        type: String,
        enum: ['taken', 'skipped'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Medication', MedicationSchema);
