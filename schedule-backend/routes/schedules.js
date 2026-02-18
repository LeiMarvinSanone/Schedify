import express from 'express';
const router = express.Router();

import Schedule from '../models/Schedule.js';

/**
 * GET /api/schedules?date=YYYY-MM-DD (optional)
 * Fetches all schedules or schedules for a specific date
 */
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;

    let schedules;

    // If date parameter is provided, filter by date
    if (date) {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ 
          error: 'Invalid date format',
          message: 'Date must be in YYYY-MM-DD format'
        });
      }

      // Validate that it's a valid date
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date',
          message: 'Please provide a valid date'
        });
      }

      schedules = await Schedule.find({ date: date }).sort({ time: 1 });
    } else {
      // No date parameter - return all schedules
      schedules = await Schedule.find().sort({ date: 1, time: 1 });
    }

    res.json(schedules);

  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch schedules'
    });
  }
});

/**
 * POST /api/schedules
 * Creates a new class schedule
 */
router.post('/', async (req, res) => {
  try {
    const { studentId, title, professor, date, time, room, building, day, description, alarms } = req.body;

    // Validate required fields
    if (!studentId || !title || !professor || !date || !time || !room || !building) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'StudentId, title, professor, date, time, room, and building are required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({ 
        error: 'Invalid time format',
        message: 'Time must be in HH:MM format (24-hour)'
      });
    }

    // Validate room and building are not empty
    if (room.trim() === '' || building.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Room and building cannot be empty'
      });
    }

    // Create new schedule
    const schedule = await Schedule.create({
      studentId,
      title,
      professor,
      date,
      time,
      room,
      building,
      day: day || 'Not specified',
      description: description || '',
      alarms: alarms || [30, 15, 5]
    });

    res.status(201).json(schedule);

  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create schedule'
    });
  }
});

/**
 * PUT /api/schedules/:id
 * Updates an existing schedule
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, professor, date, time, room, building, day, description, alarms } = req.body;

    // Find the schedule
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        error: 'Schedule not found',
        message: 'The requested schedule does not exist'
      });
    }

    // Validate date format if provided (YYYY-MM-DD)
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Date must be in YYYY-MM-DD format'
        });
      }
      // Validate that it's a valid date
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date',
          message: 'Please provide a valid date'
        });
      }
      schedule.date = date;
    }

    // Validate time format if provided (HH:MM)
    if (time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        return res.status(400).json({
          error: 'Invalid time format',
          message: 'Time must be in HH:MM format (24-hour)'
        });
      }
      schedule.time = time;
    }

    // Update other fields if provided
    if (title !== undefined) schedule.title = title;
    if (professor !== undefined) schedule.professor = professor;
    if (room !== undefined) schedule.room = room;
    if (building !== undefined) schedule.building = building;
    if (day !== undefined) schedule.day = day;
    if (description !== undefined) schedule.description = description;
    if (alarms !== undefined) schedule.alarms = alarms;

    // Validate room and building are not empty if provided
    if (room !== undefined && room.trim() === '') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Room cannot be empty'
      });
    }
    if (building !== undefined && building.trim() === '') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Building cannot be empty'
      });
    }

    await schedule.save();
    res.json(schedule);

  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update schedule'
    });
  }
});

/**
 * DELETE /api/schedules/:id
 * Deletes a schedule
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the schedule
    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        error: 'Schedule not found',
        message: 'The requested schedule does not exist'
      });
    }

    res.json({
      message: 'Schedule deleted successfully',
      schedule: schedule
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete schedule'
    });
  }
});

export default router;
