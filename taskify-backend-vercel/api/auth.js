require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const authRoutes = require('../routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure DB is connected before every request
app.use(withDB);

// Mount only this function's routes
app.use('/api/auth', authRoutes);

// Health check (useful for Vercel deployment logs)
app.get('/health', (req, res) => res.json({ status: 'ok', fn: 'auth' }));

module.exports = app;
