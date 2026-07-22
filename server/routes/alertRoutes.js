import express from 'express';
import { getAlerts, updateAlertStatus, markAllAsRead } from '../controllers/alertController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET api/alerts
// @desc    Retrieve active or filtered alerts
router.get('/', getAlerts);

// @route   PUT api/alerts/read-all
// @desc    Mark all unread alerts as Read
router.put('/read-all', markAllAsRead);

// @route   PUT api/alerts/:id
// @desc    Update a specific alert status (Read / Resolved)
router.put('/:id', updateAlertStatus);

export default router;
