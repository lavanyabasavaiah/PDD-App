import express from 'express';
import { addVital, getVitalsHistory, deleteVital } from '../controllers/vitalController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   POST api/vitals
// @desc    Add a new vital record and trigger AI analysis
router.post('/', addVital);

// @route   GET api/vitals
// @desc    Get vitals log history
router.get('/', getVitalsHistory);

// @route   DELETE api/vitals/:id
// @desc    Delete a specific vital log
router.delete('/:id', deleteVital);

export default router;
