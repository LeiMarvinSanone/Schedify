import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Register a new user (student or professor only)
// Forgot Password: send reset email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  // Only allow sorsu.edu.ph or gmail.com emails
  const allowedDomains = ['@sorsu.edu.ph', '@gmail.com'];
  const isAllowed = allowedDomains.some(domain => email.endsWith(domain));
  if (!isAllowed) {
    return res.status(400).json({ message: 'Only sorsu.edu.ph or gmail.com emails are allowed' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Configure nodemailer (example with Gmail, use env vars in production)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Schedify Password Reset',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\nIf you did not request this, ignore this email.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Reset Password: set new password
export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
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