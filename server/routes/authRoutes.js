import express from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', login);

// @route   POST api/auth/forgot-password
// @desc    Request password reset OTP email
router.post('/forgot-password', forgotPassword);

// @route   POST api/auth/reset-password
// @desc    Reset password using OTP code
router.post('/reset-password', resetPassword);

// @route   GET api/auth/profile
// @desc    Get current user profile
router.get('/profile', auth, getProfile);

// @route   PUT api/auth/profile
// @desc    Update user profile (age, gender, chronic diseases)
router.put('/profile', auth, updateProfile);

export default router;
