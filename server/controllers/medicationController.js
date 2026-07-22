import Medication from '../models/Medication.js';

// Add new medication schedule
export const addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, times, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!name || !dosage) {
      return res.status(400).json({ message: 'Name and dosage are required' });
    }

    const newMedication = new Medication({
      userId,
      name,
      dosage,
      frequency: frequency || 'Daily',
      times: times || ['08:00'],
      startDate: startDate || new Date(),
      endDate,
      active: true
    });

    await newMedication.save();
    res.status(201).json(newMedication);
  } catch (error) {
    console.error('Add Medication Error:', error);
    res.status(500).json({ message: 'Server error saving medication' });
  }
};

// Get all user medications
export const getMedications = async (req, res) => {
  try {
    const userId = req.user.id;
    const medications = await Medication.find({ userId }).sort({ createdAt: -1 });
    res.json(medications);
  } catch (error) {
    console.error('Get Medications Error:', error);
    res.status(500).json({ message: 'Server error fetching medications' });
  }
};

// Log medication adherence (taken/skipped)
export const logMedicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, status } = req.body; // status: 'taken' or 'skipped'
    const userId = req.user.id;

    if (!date || !time || !status) {
      return res.status(400).json({ message: 'Date, time, and status are required' });
    }

    const medication = await Medication.findOne({ _id: id, userId });
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Check if a log entry already exists for this date and time
    const existingLogIndex = medication.logs.findIndex(
      log => log.date === date && log.time === time
    );

    if (existingLogIndex > -1) {
      // Update existing log
      medication.logs[existingLogIndex].status = status;
      medication.logs[existingLogIndex].timestamp = new Date();
    } else {
      // Push new log entry
      medication.logs.push({
        date,
        time,
        status,
        timestamp: new Date()
      });
    }

    await medication.save();
    res.json(medication);
  } catch (error) {
    console.error('Log Medication Error:', error);
    res.status(500).json({ message: 'Server error logging medication status' });
  }
};

// Update medication details or toggle active status
export const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const medication = await Medication.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    console.error('Update Medication Error:', error);
    res.status(500).json({ message: 'Server error updating medication' });
  }
};

// Delete a medication schedule
export const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const medication = await Medication.findOneAndDelete({ _id: id, userId });
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Delete Medication Error:', error);
    res.status(500).json({ message: 'Server error deleting medication' });
  }
};
