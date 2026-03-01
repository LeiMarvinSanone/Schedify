import mongoose from 'mongoose';

// User schema for all roles: student, professor, admin
const userSchema = new mongoose.Schema({

  // Basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  idNo: { type: String, required: true, unique: true },

  // Role-based access
  role: {
    type: String,
    enum: ['student', 'professor', 'admin'],
    default: 'student'
  },

  // Academic info (for tag-based filtering)
  department: { type: String },
  course: { type: String },
  block: { type: String },

  // For Expo push notifications
  expoPushToken: { type: String },

}, { timestamps: true }); // automatically adds createdAt and updatedAt

// Export the model
export default mongoose.model('User', userSchema);