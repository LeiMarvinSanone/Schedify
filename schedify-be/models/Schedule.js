import mongoose from 'mongoose';

// Sub-schema for each subject
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "Programming"
  day: { type: String, required: true },         // e.g. "Monday"
  timeRange: { type: String, required: true },   // e.g. "8:00am - 10:00am"
  room: { type: String },                        // e.g. "Lab 1"
});

const scheduleSchema = new mongoose.Schema({

  // Type of post
  type: {
    type: String,
    enum: ['Class Schedules', 'Events', 'Suspension'],
    required: true
  },

  // Academic info
  department: { type: String },                  // e.g. "CICT"
  course: { type: String },                      // e.g. "BSIT"
  yearLevel: { type: String },                   // e.g. "1st Year"
  block: { type: String },                       // e.g. "2A"
  semester: { type: String },                    // e.g. "First Semester 2025-2026"

  // Target audience tag (auto-generated from above)
  tag: { type: String },                         // e.g. "BSIT 2A"

  // Subjects list (for Class Schedules)
  subjects: [subjectSchema],

  // Who created this (admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);