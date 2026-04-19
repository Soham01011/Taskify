/**
 * index.js — Monolithic Express app used for LOCAL development only.
 *
 * On Vercel, traffic is routed to individual functions under api/*.js.
 * Those functions all share the same pooling logic via lib/db.js.
 *
 * This file is NOT listed in vercel.json builds, so it is never deployed
 * as a Vercel function.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { withDB } = require('./lib/db');

const authRoutes          = require('./routes/auth');
const taskRoutes          = require('./routes/tasks');
const groupRoutes         = require('./routes/groups');
const userRoutes          = require('./routes/users');
const notificationRoutes  = require('./routes/notifications');
const ideaRoutes          = require('./routes/ideas');
const ollamaRoutes        = require('./routes/ollama');

const app = express();

app.use(cors());
app.use(express.json());

// Shared DB middleware (same pooling strategy as api/* functions)
app.use(withDB);

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/groups',        groupRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ideas',         ideaRoutes);
app.use('/api/ollama',        ollamaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState
  });
});

// Readiness check (backward compat)
app.get('/api/readyness', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(500).json({ status: 'not ready' });
  }
});

module.exports = app;
