const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { sendPushNotification, sendMultiplePushNotifications } = require('../utils/notificationService');
const verifyToken = require('../middleware/auth');

// Create a new task (with optional subtasks)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, dueDate, subtasks, alarm_type, alarm_reminder_time } = req.body;
    const userId = req.userId;

    let taskDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (taskDueDate < new Date()) {
      return res.status(400).json({ error: 'dueDate cannot be in the past' });
    }

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

    const task = new Task({ 
      userId, 
      title, 
      description, 
      dueDate: taskDueDate, 
      subtasks: processedSubtasks,
      alarm_type,
      alarm_reminder_time: alarm_reminder_time ? alarm_reminder_time :taskDueDate,
      created_at: new Date(),
      updated_at: new Date()
    });
    await task.save();

    // If task is due within 15 mins, trigger immediate notification to all devices
    const fifteenMinsFromNow = new Date(Date.now() + 15 * 60 * 1000);
    if (task.alarm_reminder_time <= fifteenMinsFromNow) {
      try {
        const user = await User.findById(userId);
        if (user && user.pushTokens && user.pushTokens.length > 0) {
          await sendMultiplePushNotifications(
            user.pushTokens,
            'Task Reminder (Near Due)',
            `Your task '${task.title}' is due very soon!`,
            { taskId: task._id, type: 'TASK_DUE_SOON' }
          );
          task.notificationSent = true;
          task.syncSent = true;
          await task.save();
        }
      } catch (notifyError) {
        console.error('Failed to send near-term task notification:', notifyError);
      }
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get tasks with optional pagination and created_at filtering
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { pageNumber, pageSize, created_at } = req.query;

    let query = { userId };

    // Filter by timestamp if provided (tasks created after this time)
    if (created_at) {
      const filterDate = new Date(created_at);
      if (!isNaN(filterDate.getTime())) {
        query.created_at = { $gt: filterDate };
      }
    }

    let tasksQuery = Task.find(query).sort({ created_at: -1 });

    // Handle Pagination
    if (pageNumber && pageSize) {
      const pageNum = parseInt(pageNumber);
      const sizeLimit = parseInt(pageSize);
      const skip = (pageNum - 1) * sizeLimit;
      
      const tasks = await tasksQuery.skip(skip).limit(sizeLimit);
      const totalTasks = await Task.countDocuments(query);

      return res.json({
        tasks,
        pagination: {
          totalTasks,
          currentPage: pageNum,
          pageSize: sizeLimit,
          totalPages: Math.ceil(totalTasks / sizeLimit)
        }
      });
    }

    // Default: return all tasks for the query
    const tasks = await tasksQuery;
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a task
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = { ...req.body };
    
    // If dueDate or alarm_reminder_time is updated, reset notificationSent and syncSent
    if (updateData.dueDate || updateData.alarm_reminder_time) {
      updateData.notificationSent = false;
      updateData.syncSent = false;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark a task as complete
router.patch('/:id/complete', verifyToken, async (req, res) => {
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
router.post('/:id/subtasks', verifyToken, async (req, res) => {
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
router.put('/:taskId/subtasks/:subtaskId', verifyToken, async (req, res) => {
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
router.patch('/:taskId/subtasks/:subtaskId/complete', verifyToken, async (req, res) => {
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

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:taskId/subtasks/:subtaskId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const task = await Task.findOne({ _id: req.params.taskId, userId });
    
    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });
    
    // Use .pull() to remove the subtask by its ID from the array
    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });
    
    task.subtasks.pull(req.params.subtaskId);
    task.updated_at = new Date();
    
    await task.save();
    console.log("Subtask deleted successfully");
    res.json(task);
  } catch (err) {
    console.error("Error in deleting subtask:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
