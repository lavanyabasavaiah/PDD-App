import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: 35
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other'
  },
  conditions: {
    type: [String],
    default: []
  },
  fullName: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 170
  },
  weight: {
    type: Number,
    default: 70
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  allergies: {
    type: [String],
    default: []
  },
  emergencyContacts: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, required: true }
    }
  ],
  familyAccess: [
    {
      email: { type: String, required: true },
      role: { type: String, enum: ['Viewer', 'Editor'], default: 'Viewer' },
      status: { type: String, enum: ['Pending', 'Active'], default: 'Pending' }
    }
  ],
  goals: {
    steps: { type: Number, default: 8000 },
    sleep: { type: Number, default: 8 },
    water: { type: Number, default: 2000 },
    weight: { type: Number, default: 70 }
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  settings: {
    tempUnit: { type: String, enum: ['C', 'F'], default: 'C' },
    weightUnit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
    sosTrigger: { type: Number, default: 5 }
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', UserSchema);

