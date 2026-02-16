const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  professor: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  time: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  day: {
    type: String,
    default: 'Not specified'
  },
  description: {
    type: String,
    default: ''
  },
  alarms: {
    type: [Number],
    default: [30, 15, 5]
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);