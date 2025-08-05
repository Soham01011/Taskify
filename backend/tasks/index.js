const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Subtask schema
const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, // UTC date/time
});

// Task schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, // UTC date/time
  subtasks: [SubtaskSchema],
});

const Task = mongoose.model('Task', TaskSchema);

// Create a new task (with optional subtasks)
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, dueDate, subtasks } = req.body;
    const task = new Task({ title, description, dueDate, subtasks });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark a task as complete
app.patch('/api/tasks/:id/complete', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { completed: true }, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a subtask to a task
app.post('/api/tasks/:id/subtasks', async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.subtasks.push({ title, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a subtask
app.put('/api/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
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
app.patch('/api/tasks/:taskId/subtasks/:subtaskId/complete', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
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
const PORT = process.env.PORT || 4000;
mongoose.connect('mongodb://localhost:27017/taskify-tasks')
  .then(() => app.listen(PORT, () => console.log(`Tasks service running on port ${PORT}`)))
  .catch(err => console.error('MongoDB connection error:', err));