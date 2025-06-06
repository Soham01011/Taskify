const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/tasksRoutes');
const groupsRoutes = require('./routes/groupRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    'https://taskify-web.vercel.app', // Add your web app domain
    'exp://localhost:19000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Body parser middleware to parse JSON
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));


// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/tasks', authMiddleware, taskRoutes);

app.use('/api/groups', authMiddleware, groupsRoutes);

// Default route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Taskify API, Webapp coming soon!');
});

// 🔁 DO NOT start the server here when using with Vercel
module.exports = app;
