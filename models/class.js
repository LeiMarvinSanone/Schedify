const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  professor: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  building: { type: String, required: true },
  day: { type: String },
  notificationSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
