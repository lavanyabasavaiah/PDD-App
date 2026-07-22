import Insight from '../models/Insight.js';
import Vital from '../models/Vital.js';
import Medication from '../models/Medication.js';
import { generateGeneralInsight } from '../utils/aiEngine.js';

// Get user's insights history
export const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const insights = await Insight.find({ userId }).sort({ timestamp: -1 });
    res.json(insights);
  } catch (error) {
    console.error('Get Insights Error:', error);
    res.status(500).json({ message: 'Server error fetching insights' });
  }
};

// Get the latest single insight
export const getLatestInsight = async (req, res) => {
  try {
    const userId = req.user.id;
    const insight = await Insight.findOne({ userId }).sort({ timestamp: -1 });
    res.json(insight);
  } catch (error) {
    console.error('Get Latest Insight Error:', error);
    res.status(500).json({ message: 'Server error fetching latest insight' });
  }
};

// Generate an Insight on demand
export const triggerOnDemandInsight = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch vitals sorted ascending by date (for chronological trend evaluation)
    const vitals = await Vital.find({ userId }).sort({ timestamp: 1 });
    
    // Fetch all active medications to calculate compliance
    const medications = await Medication.find({ userId });

    const newInsight = await generateGeneralInsight(userId, vitals, medications);
    res.status(201).json(newInsight);
  } catch (error) {
    console.error('Trigger Insight Error:', error);
    res.status(500).json({ message: 'Server error generating health insights' });
  }
};
