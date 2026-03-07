import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin
    const admin = new User({
      name: 'Admin',
      email: 'admin@schedify.com',
      password: hashedPassword,
      idNo: 'ADMIN-0001',
      role: 'admin',
      department: '',
      course: '',
      block: '',
    });

    await admin.save();
    console.log('Admin created successfully!');
    process.exit();

  } catch (error) {
    console.log('Error:', error);
    process.exit();
  }
};

seedAdmin();