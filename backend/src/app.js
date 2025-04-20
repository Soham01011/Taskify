const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();

// Body parser middleware to parse JSON
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/tasks', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Default route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Taskify API');
});

// 🔁 DO NOT start the server here when using with Vercel
module.exports = app;
