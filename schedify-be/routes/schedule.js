import express from 'express';
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import { verifyToken, requireAdmin } from '../middleware/authmiddleware.js';

const router = express.Router();

// Admin only — create schedule
router.post('/', verifyToken, requireAdmin, createSchedule);

// Admin only — update schedule
router.put('/:id', verifyToken, requireAdmin, updateSchedule);

// Admin only — delete schedule
router.delete('/:id', verifyToken, requireAdmin, deleteSchedule);

// Authenticated users — get all schedules (filtered)
router.get('/', verifyToken, getSchedules);

// Authenticated users — get single schedule
router.get('/:id', verifyToken, getScheduleById);

export default router;