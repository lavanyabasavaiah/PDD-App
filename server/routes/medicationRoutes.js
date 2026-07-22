import express from 'express';
import { 
  addMedication, 
  getMedications, 
  logMedicationStatus, 
  updateMedication, 
  deleteMedication 
} from '../controllers/medicationController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   POST api/medications
// @desc    Add a medication schedule
router.post('/', addMedication);

// @route   GET api/medications
// @desc    Get user's medications
router.get('/', getMedications);

// @route   POST api/medications/:id/log
// @desc    Record compliance logs (taken/skipped)
router.post('/:id/log', logMedicationStatus);

// @route   PUT api/medications/:id
// @desc    Modify medication schedule details
router.put('/:id', updateMedication);

// @route   DELETE api/medications/:id
// @desc    Delete a medication schedule
router.delete('/:id', deleteMedication);

export default router;
