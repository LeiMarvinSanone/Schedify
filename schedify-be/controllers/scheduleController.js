import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

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