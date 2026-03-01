import Schedule from '../models/Schedule.js';
import User from '../models/user.js';

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

    const newSchedule = new Schedule({
      type,
      department,
      course,
      yearLevel,
      block,
      semester,
      tag,
      subjects,
      createdBy: req.user.id,
    });

    await newSchedule.save();

    res.status(201).json({ message: "Schedule created successfully", schedule: newSchedule });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET all schedules (filtered by user's role, course, block)
export const getSchedules = async (req, res) => {
  try {
    // Admin sees all schedules
    if (req.user.role === 'admin') {
      const schedules = await Schedule.find();
      return res.status(200).json(schedules);
    }

    // Fetch full user details from database
    const user = await User.findById(req.user.id);

    const schedules = await Schedule.find({
      $or: [
        { tag: 'whole-university' },
        { department: user.department },
        { course: user.course },
        { block: user.block },
      ]
    });

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
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
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