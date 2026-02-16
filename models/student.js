const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
