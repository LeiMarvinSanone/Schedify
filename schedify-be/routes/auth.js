import express from 'express';
import { register, login, changePassword, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
// Forgot password (send reset email)
router.post('/forgot-password', forgotPassword);

// Reset password (set new password)
router.post('/reset-password', resetPassword);
import { verifyToken } from '../middleware/authmiddleware.js';

const router = express.Router();

// Register route (student only — role is forced to 'student' in controller)
router.post('/register', register);

// Login route (all roles — backend determines role from database)
router.post('/login', login);

// Change password route (authenticated users only)
router.put('/change-password', verifyToken, changePassword);

// Get current user data (authenticated users only)
router.get('/me', verifyToken, getMe);

export default router;