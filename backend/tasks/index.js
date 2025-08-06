const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Taskify';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const AUTH_SVC_URL = process.env.AUTH_SVC_URL || 'localhost:3001';

const app = express();
app.use(express.json());

let mongoReady = false;
let authReady = false;

// Middleware to verify JWT token via Auth microservice
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

    const token = authHeader.replace('Bearer ', '');
    // Call Auth microservice to verify token
    const verifyRes = await axios.post(f`http://${AUTH_SVC_URL}/api/auth/verify`, { token });
    if (verifyRes.data && verifyRes.data.valid) {
      req.userId = verifyRes.data.userId;
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Token verification failed' });
  }
}

// Health check route for Kubernetes liveness/readiness probe
app.get('/api/tasks/readyness', async(req, res) => {

  try{
    await axios.get(`http://${AUTH_SVC_URL}/api/auth/verify`, {token: 'test-token'});
    authReady = true;
  }
  catch{
    authReady = false;
  }

  if (
    mongoReady &&
    authReady &&
    PORT &&
    MONGO_URI &&
    JWT_SECRET &&
    JWT_EXPIRES_IN &&
    REFRESH_TOKEN_EXPIRES_IN
  ) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(500).json({ status: 'not ready' });
  }
});

// Subtask schema
const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, // UTC date/time
});

// Task schema
const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, // UTC date/time
  subtasks: [SubtaskSchema],
});

const Task = mongoose.model('Task', TaskSchema);

// Create a new task (with optional subtasks)
app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { title, description, dueDate, subtasks } = req.body;
    const userId = req.userId; // Get userId from verified token

    // Set dueDate to 24 hours from now if not provided
    let taskDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Check if dueDate is in the past
    if (taskDueDate < new Date()) {
      return res.status(400).json({ error: 'dueDate cannot be in the past' });
    }

    // Handle subtasks dueDate logic
    let processedSubtasks = [];
    if (Array.isArray(subtasks)) {
      processedSubtasks = subtasks.map(sub => {
        let subDueDate = sub.dueDate ? new Date(sub.dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        if (subDueDate < new Date()) {
          throw new Error('Subtask dueDate cannot be in the past');
        }
        return { ...sub, dueDate: subDueDate };
      });
    }

    const task = new Task({ userId, title, description, dueDate: taskDueDate, subtasks: processedSubtasks });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks for a user
app.get('/api/tasks', verifyToken, async (req, res) => {
  const userId = req.userId; // Get userId from verified token
  const tasks = await Task.find({ userId });
  res.json(tasks);
});

// Update a task
app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Get userId from verified token
    // Only allow update if the task belongs to the user
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark a task as complete
app.patch('/api/tasks/:id/complete', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      { completed: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a subtask to a task
app.post('/api/tasks/:id/subtasks', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, dueDate } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    task.subtasks.push({ title, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a subtask
app.put('/api/tasks/:taskId/subtasks/:subtaskId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const task = await Task.findOne({ _id: req.params.taskId, userId });
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });
    subtask.set(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark a subtask as complete
app.patch('/api/tasks/:taskId/subtasks/:subtaskId/complete', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const task = await Task.findOne({ _id: req.params.taskId, userId });
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });
    subtask.completed = true;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    mongoReady = true;
    app.listen(PORT, () => console.log(`Tasks service running on port ${PORT}`));
  })
  .catch(err => {
    mongoReady = false;
    console.error('MongoDB connection error:', err);
  });