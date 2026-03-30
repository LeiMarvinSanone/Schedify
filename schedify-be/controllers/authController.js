import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// Move transporter outside function (good practice)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register a new user (student or professor only)
// Forgot Password: send reset email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const allowedDomains = ['@sorsu.edu.ph', '@gmail.com'];
  const isAllowed = allowedDomains.some(domain => email.endsWith(domain));
  if (!isAllowed) {
    return res.status(400).json({ message: 'Only sorsu.edu.ph or gmail.com emails are allowed' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

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
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, idNo, department, course, yearLevel, block, expoPushToken } = req.body;

    if (!name || !email || !password || !idNo || !department || !course || !yearLevel || !block) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    const existingId = await User.findOne({ idNo });
    if (existingId) return res.status(400).json({ message: "ID number already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      idNo,
      role: 'student',
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (expoPushToken) {
      user.expoPushToken = expoPushToken;
      await user.save();
    }

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

// Google Auth
export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'ID token is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, picture } = payload;

    // ONLY find existing user — never create new
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        message: 'No account found with this Google email. Please sign up first.' 
      });
    }

    // Save googleId if first time using Google login
    if (!user.googleId) {
      user.googleId = googleId;
      user.picture = picture;
      await user.save();
    }

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
        picture: user.picture,
      }
    });

  } catch (error) {
    console.error('googleAuth error:', error);
    res.status(401).json({ message: 'Invalid Google token', error: error.message });
  }
};

// Complete profile for Google users
export const completeProfile = async (req, res) => {
  try {
    const { idNo, department, course, yearLevel, block } = req.body;

    if (!idNo || !department || !course || !yearLevel || !block) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingId = await User.findOne({ idNo, _id: { $ne: req.user.id } });
    if (existingId) {
      return res.status(400).json({ message: 'ID number already exists' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { idNo, department, course, yearLevel, block },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile completed successfully', user });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update Expo Push Token for logged-in user
export const updatePushToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { expoPushToken } = req.body;
    if (!expoPushToken) {
      return res.status(400).json({ message: 'expoPushToken is required' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { expoPushToken },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Expo push token updated successfully' });
  } catch (error) {
    console.error('updatePushToken error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};