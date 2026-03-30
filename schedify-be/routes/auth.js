import express from 'express';
import { register, login, changePassword, getMe, forgotPassword, resetPassword, googleAuth, completeProfile, updatePushToken } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authmiddleware.js';
import {
  validate,
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
} from '../middleware/validators.js';

const router = express.Router();

// Register route (student only — role is forced to 'student' in controller)
router.post('/register', validateRegister, validate, register);

// Login route (all roles — backend determines role from database)
router.post('/login', validateLogin, validate, login);

// Change password route (authenticated users only)
router.put('/change-password', verifyToken, validateChangePassword, validate, changePassword);

// Get current user data (authenticated users only)
router.get('/me', verifyToken, getMe);

// Forgot password (send reset email)
router.post('/forgot-password', validateForgotPassword, validate, forgotPassword);

// Reset password (set new password)
router.post('/reset-password', validateResetPassword, validate, resetPassword);

// Google Auth
router.post('/google', googleAuth);

// Complete profile for Google users
router.put('/complete-profile', verifyToken, completeProfile);

// Update Expo Push Token
router.put('/update-push-token', verifyToken, updatePushToken);

export default router;