require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const groupRoutes = require('./routes/groups');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Taskify';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/groups', groupRoutes);

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
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(500).json({ status: 'not ready' });
  }
});

// Database connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

module.exports = app;
