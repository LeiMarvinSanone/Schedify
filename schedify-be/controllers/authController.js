import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user (student or professor only)
export const register = async (req, res) => {
  try {
    const { name, email, password, idNo, department, course, block, expoPushToken } = req.body;

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
        role: newUser.role,
        department: newUser.department,
        course: newUser.course,
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
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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
        role: user.role,
        department: user.department,
        course: user.course,
        block: user.block,
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};