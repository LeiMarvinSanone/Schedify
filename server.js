const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const mongoose = require('mongoose');

const Student = require('./models/student');
const Class = require('./models/class');
const schedulesRouter = require('./routes/schedules');

const app = express();

app.use(express.json());

// Mount schedules router
app.use('/api/schedules', schedulesRouter);

// Serve Thunder Client files statically and provide download endpoints
app.use('/thunder', express.static(path.join(__dirname, '.thunder')));

// Simple token storage (in-memory)
const tokens = {};

// Middleware to authenticate requests using Bearer token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid Authorization format' });
  const token = parts[1];
  const studentId = tokens[token];
  if (!studentId) return res.status(401).json({ message: 'Invalid or expired token' });
  req.studentId = studentId;
  next();
}

function saveAuthTokenToEnvironment(token) {
  try {
    const envPath = path.join(__dirname, '.thunder', 'environment-schedule-backend.json');
    if (!fs.existsSync(envPath)) return;
    const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    if (!env.values || !Array.isArray(env.values)) return;
    const updated = env.values.map(v => (v.key === 'auth_token' ? { ...v, value: token } : v));
    env.values = updated;
    fs.writeFileSync(envPath, JSON.stringify(env, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save auth token to environment file:', err.message);
  }
}

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/schedule_db';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Data is persisted in MongoDB using Mongoose models

// POST register new student
app.post('/students', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ message: 'Name, email, and phone are required' });
    const existing = await Student.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const student = await Student.create({ name, email, phone });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Auth: signup - create student and send verification email
app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const existing = await Student.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send verification email
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Schedify account',
      html: `
        <h2>Welcome to Schedify, ${name}!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });

    res.status(201).json({ message: 'Verification email sent. Please check your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth: verify email
app.get('/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const student = await Student.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!student) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark email as verified
    student.emailVerified = true;
    student.verificationToken = undefined;
    student.verificationTokenExpires = undefined;
    await student.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth: login - email and password with verification check
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if email is verified
    if (!student.emailVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      { studentId: student._id, email: student.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    tokens[token] = student._id.toString();
    saveAuthTokenToEnvironment(token);

    res.json({ token, student: { _id: student._id, name: student.name, email: student.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET student by ID
app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to validate time format (HH:MM)
function isValidTimeFormat(time) {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

// Helper function to validate date format (YYYY-MM-DD)
function isValidDateFormat(date) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

// POST create new class
app.post('/classes', authenticateToken, async (req, res) => {
  try {
    const { studentId, title, professor, date, time, room, building, day, alarms } = req.body;
    if (!studentId || !title || !professor || !date || !time || !room || !building) {
      return res.status(400).json({ message: 'StudentId, title, professor, date, time, room, and building are required' });
    }
    if (!isValidTimeFormat(time)) return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24-hour format)' });
    if (!isValidDateFormat(date)) return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    if (room.trim() === '' || building.trim() === '') return res.status(400).json({ message: 'Room and building cannot be empty' });

    if (String(studentId) !== String(req.studentId)) {
      return res.status(403).json({ message: 'Forbidden: cannot create class for another student' });
    }

    const newClass = await Class.create({
      studentId,
      title,
      professor,
      date,
      time,
      room,
      building,
      day: day || 'Not specified',
      alarms: alarms || [30, 15, 5] // default to all three alarms
    });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single class by ID
app.get('/classes/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id).lean();
    if (!classItem) return res.status(404).json({ message: 'Class not found' });
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update class
app.put('/classes/:id', authenticateToken, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ message: 'Class not found' });
    if (String(classItem.studentId) !== String(req.studentId)) return res.status(403).json({ message: 'Forbidden: cannot modify another student\'s class' });

    const { title, professor, date, time, room, building, day } = req.body;
    if (title) classItem.title = title;
    if (professor) classItem.professor = professor;
    if (date) {
      if (!isValidDateFormat(date)) return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
      classItem.date = date;
    }
    if (time) {
      if (!isValidTimeFormat(time)) return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24-hour format)' });
      classItem.time = time;
    }
    if (room) classItem.room = room;
    if (building) classItem.building = building;
    if (day) classItem.day = day;

    await classItem.save();
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE class
app.delete('/classes/:id', authenticateToken, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ message: 'Class not found' });
    if (String(classItem.studentId) !== String(req.studentId)) return res.status(403).json({ message: 'Forbidden: cannot delete another student\'s class' });
    await classItem.deleteOne();
    res.json({ message: 'Class deleted', class: classItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all classes for a specific student
app.get('/student/:studentId/classes', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (String(studentId) !== String(req.studentId)) return res.status(403).json({ message: 'Forbidden: cannot access another student\'s classes' });
    const studentClasses = await Class.find({ studentId }).lean();
    if (!studentClasses || studentClasses.length === 0) return res.status(404).json({ message: 'No classes found for this student' });
    res.json(studentClasses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all classes
app.get('/classes', async (req, res) => {
  try {
    const all = await Class.find().lean();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Endpoints to download the Thunder Client collection and environment
app.get('/thunder/collection', (req, res) => {
  const filePath = path.join(__dirname, '.thunder', 'collection-schedule-backend.json');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).json({ message: 'Collection file not found' });
});

app.get('/thunder/environment', (req, res) => {
  const filePath = path.join(__dirname, '.thunder', 'environment-schedule-backend.json');
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).json({ message: 'Environment file not found' });
});

// Notification check function
async function checkForUpcomingClasses() {
  try {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const allClasses = await Class.find({});
    for (const classItem of allClasses) {
      const [classHour, classMin] = classItem.time.split(':');
      const [currentHour, currentMin] = currentTime.split(':');
      const classTimeInMinutes = parseInt(classHour) * 60 + parseInt(classMin);
      const currentTimeInMinutes = parseInt(currentHour) * 60 + parseInt(currentMin);
      const minutesUntilClass = classTimeInMinutes - currentTimeInMinutes;

      // Check each alarm time
      for (const alarmMinutes of classItem.alarms) {
        if (minutesUntilClass > 0 && minutesUntilClass <= alarmMinutes && !classItem.notificationsSent.includes(alarmMinutes)) {
          const student = await Student.findById(classItem.studentId).lean();
          console.log(`🔔 ALARM: ${student?.name}, your ${classItem.title} class with ${classItem.professor} starts in ${alarmMinutes} minutes! Room: ${classItem.room}, Building: ${classItem.building}`);
          classItem.notificationsSent.push(alarmMinutes);
          await classItem.save();
          break; // Only send one notification per check cycle
        }
      }
    }
  } catch (err) {
    console.error('Notification check failed:', err.message);
  }
}

// Run notification check every 1 minute
setInterval(checkForUpcomingClasses, 60000);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

