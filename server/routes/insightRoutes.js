import express from 'express';
import { getInsights, getLatestInsight, triggerOnDemandInsight } from '../controllers/insightController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET api/insights
// @desc    Retrieve user's historical AI insights
router.get('/', getInsights);

// @route   GET api/insights/latest
// @desc    Retrieve latest AI insight report
router.get('/latest', getLatestInsight);

// @route   POST api/insights/analyze
// @desc    Trigger AI engine trend analysis on-demand
router.post('/analyze', triggerOnDemandInsight);

export default router;
