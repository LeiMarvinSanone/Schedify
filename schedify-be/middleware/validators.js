import { body, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// Register validation
export const validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('idNo')
    .notEmpty().withMessage('ID number is required'),
  body('department')
    .notEmpty().withMessage('Department is required'),
  body('course')
    .notEmpty().withMessage('Course is required'),
  body('yearLevel')
    .notEmpty().withMessage('Year level is required'),
  body('block')
    .notEmpty().withMessage('Block is required'),
];

// Login validation
export const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Change password validation
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Reset password validation
export const validateResetPassword = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('token')
    .notEmpty().withMessage('Token is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Create schedule validation
export const validateCreateSchedule = [
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['Class Schedules', 'Events', 'Suspension']).withMessage('Invalid schedule type'),
  body('subjects')
    .isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('subjects.*.name')
    .notEmpty().withMessage('Subject name is required'),
  body('subjects.*.day')
    .notEmpty().withMessage('Subject day is required'),
  body('subjects.*.timeRange')
    .notEmpty().withMessage('Subject time range is required'),
];