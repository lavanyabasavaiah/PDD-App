import mongoose from 'mongoose';

const InsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  recommendation: {
    type: String,
    required: true
  },
  analysisType: {
    type: String,
    enum: ['Daily', 'Weekly', 'On-Demand'],
    default: 'On-Demand'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Insight', InsightSchema);
