require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const groupRoutes = require('./routes/groups');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const ideaRoutes = require('./routes/ideas');

const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Taskify';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to handle DB Connection for Serverless Lambdas
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Inject the DB Connection requirement before handling ANY route
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ideas', ideaRoutes);

// Health check / Readiness
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState
  });
});

// Backward compatibility or combined readiness check
app.get('/api/readyness', (req, res) => {
  if (mongoose.connection.readyState === 1 || isConnected) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(500).json({ status: 'not ready' });
  }
});

module.exports = app;
