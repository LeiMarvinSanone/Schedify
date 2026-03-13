import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user (student or professor only)
export const register = async (req, res) => {
  try {
    const { name, email, password, idNo, department, course, yearLevel, block, expoPushToken } = req.body;

    if (!name || !email || !password || !idNo || !department || !course || !yearLevel || !block) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    // Check if idNo already exists
    const existingId = await User.findOne({ idNo });
    if (existingId) return res.status(400).json({ message: "ID number already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user — role is NOT accepted from frontend, defaults to 'student'
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      idNo,
      role: 'student', // always student on public register
      department,
      course,
      yearLevel,
      block,
      expoPushToken,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        idNo: newUser.idNo,
        role: newUser.role,
        department: newUser.department,
        course: newUser.course,
        yearLevel: newUser.yearLevel,
        block: newUser.block,
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login user — role is determined by backend, not frontend
export const login = async (req, res) => {
  try {
    const { email, password, expoPushToken } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Save expoPushToken if provided
    if (expoPushToken) {
      user.expoPushToken = expoPushToken;
      await user.save();
    }

    // Role is taken from database, not from request
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        idNo: user.idNo,
        role: user.role,
        department: user.department,
        course: user.course,
        yearLevel: user.yearLevel,
        block: user.block,
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Change password for authenticated user
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get current user data
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      idNo: user.idNo,
      role: user.role,
      department: user.department,
      course: user.course,
      yearLevel: user.yearLevel,
      block: user.block,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};