import Vital from '../models/Vital.js';
import User from '../models/User.js';
import Medication from '../models/Medication.js';
import { analyzeNewVital } from '../utils/aiEngine.js';

// Add a Vital entry
export const addVital = async (req, res) => {
  try {
    const {
      systolic,
      diastolic,
      heartRate,
      temperature,
      spo2,
      respiratoryRate,
      bloodSugar,
      bloodSugarType,
      sleepHours,
      sleepQuality,
      waterIntake,
      stepsCount,
      weight,
      notes,
      timestamp
    } = req.body;

    const userId = req.user.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create vital document
    const newVital = new Vital({
      userId,
      systolic,
      diastolic,
      heartRate,
      temperature,
      spo2,
      respiratoryRate,
      bloodSugar,
      bloodSugarType,
      sleepHours,
      sleepQuality,
      waterIntake,
      stepsCount,
      weight,
      notes,
      timestamp: timestamp || new Date()
    });

    await newVital.save();

    // Fetch user's vitals history for trend analysis (excluding the newly created one)
    const history = await Vital.find({ 
      userId, 
      _id: { $ne: newVital._id } 
    })
    .sort({ timestamp: -1 })
    .limit(10);

    // Fetch active medications
    const medications = await Medication.find({ userId, active: true });

    // Run AI analysis
    const alerts = await analyzeNewVital(newVital, user, history, medications);

    res.status(201).json({
      message: 'Vital recorded successfully',
      vital: newVital,
      alerts
    });
  } catch (error) {
    console.error('Add Vital Error:', error);
    res.status(500).json({ message: 'Server error recording vital' });
  }
};

// Get Vitals History
export const getVitalsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 100;
    
    const vitals = await Vital.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
      
    res.json(vitals);
  } catch (error) {
    console.error('Get Vitals History Error:', error);
    res.status(500).json({ message: 'Server error fetching vitals' });
  }
};

// Delete a Vital Log
export const deleteVital = async (req, res) => {
  try {
    const vital = await Vital.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!vital) {
      return res.status(404).json({ message: 'Vital record not found' });
    }
    res.json({ message: 'Vital record deleted successfully' });
  } catch (error) {
    console.error('Delete Vital Error:', error);
    res.status(500).json({ message: 'Server error deleting record' });
  }
};
