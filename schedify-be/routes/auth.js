import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Register route (student only — role is forced to 'student' in controller)
router.post('/register', register);

// Login route (all roles — backend determines role from database)
router.post('/login', login);

export default router;