import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';

// CREATE schedule (admin only)
export const createSchedule = async (req, res) => {
  try {
    const {
      type,
      department,
      course,
      yearLevel,
      block,
      semester,
      tag,
      subjects,
    } = req.body;

    // Ensure each subject includes 'building' if provided
    const subjectsWithBuilding = Array.isArray(subjects)
      ? subjects.map(sub => ({
          name: sub.name,
          day: sub.day,
          timeRange: sub.timeRange,
          room: sub.room,
          building: sub.building || '',
        }))
      : [];

    const newSchedule = new Schedule({
      type,
      department,
      course,
      yearLevel,
      block,
      semester,
      tag,
      subjects: subjectsWithBuilding,
      createdBy: req.user.id,
    });

    await newSchedule.save();

    res.status(201).json({ message: "Schedule created successfully", schedule: newSchedule });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET all schedules (filtered by user's role, course, block + search)
export const getSchedules = async (req, res) => {
  try {
    const { search } = req.query;

    // Build search filter
    const searchFilter = search ? {
      $or: [
        { type: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { yearLevel: { $regex: search, $options: 'i' } },
        { block: { $regex: search, $options: 'i' } },
        { semester: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } },
        { 'subjects.name': { $regex: search, $options: 'i' } },
        { 'subjects.day': { $regex: search, $options: 'i' } },
        { 'subjects.room': { $regex: search, $options: 'i' } },
      ]
    } : {};

    // Admin sees all schedules
    if (req.user.role === 'admin') {
      const schedules = await Schedule.find(searchFilter);
      return res.status(200).json(schedules);
    }

    // Fetch full user details from database
    const user = await User.findById(req.user.id);

    const userFields = {
      department: user.department,
      course: user.course,
      yearLevel: user.yearLevel,
      block: user.block,
    };

    const targetFields = ['department', 'course', 'yearLevel', 'block'];

    const tagFilter = {
      $or: [
        { tag: 'whole-university' },
        {
          $and: targetFields.map((field) => {
            const value = userFields[field];
            return {
              $or: [
                { [field]: { $exists: false } },
                { [field]: null },
                { [field]: '' },
                { [field]: value },
              ],
            };
          }),
        },
      ],
    };

    // Combine tag filter and search filter
    const finalFilter = search ? {
      $and: [tagFilter, searchFilter]
    } : tagFilter;

    const schedules = await Schedule.find(finalFilter);
    res.status(200).json(schedules);

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET single schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    res.status(200).json(schedule);

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// UPDATE schedule (admin only)
export const updateSchedule = async (req, res) => {
  try {
    // Ensure subjects include 'building' if provided
    let updateBody = { ...req.body };
    if (Array.isArray(req.body.subjects)) {
      updateBody.subjects = req.body.subjects.map(sub => ({
        name: sub.name,
        day: sub.day,
        timeRange: sub.timeRange,
        room: sub.room,
        building: sub.building || '',
      }));
    }
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      updateBody,
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ message: "Schedule not found" });

    res.status(200).json({ message: "Schedule updated successfully", schedule: updated });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE schedule (admin only)
export const deleteSchedule = async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Schedule not found" });

    res.status(200).json({ message: "Schedule deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// BULK IMPORT schedules (admin only)
export const importSchedules = async (req, res) => {
  try {
    // Accepts JSON array of schedules
    const schedules = req.body.schedules;
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ message: 'No schedules provided.' });
    }

    // Validate and save each schedule
    const results = [];
    for (const sched of schedules) {
      // Basic validation
      if (!sched.name || !sched.day || !sched.timeRange || !sched.room || !sched.department || !sched.tag) {
        results.push({ status: 'error', schedule: sched, message: 'Missing required fields.' });
        continue;
      }
      // Create schedule document
      const newSchedule = new Schedule({
        type: 'Class Schedules',
        department: sched.department,
        course: sched.course || '',
        yearLevel: sched.yearLevel || '',
        block: sched.block || '',
        semester: sched.semester || '',
        tag: sched.tag,
        subjects: [{
          name: sched.name,
          day: sched.day,
          timeRange: sched.timeRange,
          room: sched.room,
          building: sched.building || '',
        }],
        createdBy: req.user.id,
      });
      await newSchedule.save();
      results.push({ status: 'success', schedule: newSchedule });
    }
    res.status(201).json({ message: 'Import completed.', results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// CSV import dependencies
const upload = multer({ dest: 'uploads/' });

// CSV import handler (Express middleware)
export const importSchedulesCSV = [
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const schedules = [];
    const errors = [];
    let hasError = false;
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeRegex = /^\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?$/; // e.g. 08:00 or 08:00 - 10:00
    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (row) => {
        // Check for empty strings and required fields
        const requiredFields = ['name', 'day', 'timeRange', 'room', 'department', 'tag'];
        for (const field of requiredFields) {
          if (!row[field] || typeof row[field] !== 'string' || row[field].trim() === '') {
            errors.push({ status: 'error', row, message: `Missing or empty required field: ${field}` });
            hasError = true;
            return;
          }
        }
        // Validate day
        if (!validDays.includes(row.day.trim())) {
          errors.push({ status: 'error', row, message: `Invalid day: ${row.day}` });
          hasError = true;
          return;
        }
        // Validate time format
        if (!timeRegex.test(row.timeRange.trim())) {
          errors.push({ status: 'error', row, message: `Invalid time format: ${row.timeRange}` });
          hasError = true;
          return;
        }
        schedules.push({
          type: 'Class Schedules',
          department: row.department,
          course: row.course || '',
          yearLevel: row.yearLevel || '',
          block: row.block || '',
          semester: row.semester || '',
          tag: row.tag,
          subjects: [{
            name: row.name,
            day: row.day,
            timeRange: row.timeRange,
            room: row.room,
            building: row.building || '',
          }],
          createdBy: req.user.id,
        });
      })
      .on('end', async () => {
        fs.unlinkSync(req.file.path); // Clean up uploaded file
        if (hasError) {
          return res.status(400).json({ message: 'CSV import failed. One or more rows are invalid.', errors });
        }
        try {
          const results = [];
          for (const sched of schedules) {
            const newSchedule = new Schedule(sched);
            await newSchedule.save();
            results.push({ status: 'success', schedule: newSchedule });
          }
          res.status(201).json({ message: 'CSV import completed.', results });
        } catch (error) {
          res.status(500).json({ message: 'Server error', error });
        }
      })
      .on('error', (err) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'CSV parse error', error: err.message });
      });
  }
];