const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { sendMultiplePushNotifications } = require('../utils/notificationService');
const { calculateNextDueDate, calculateInitialDueDate } = require('../utils/taskRecurrence');
const verifyToken = require('../middleware/auth');

// Create a new task (with optional subtasks)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, dueDate, subtasks, alarm_type, alarm_reminder_time, recurrence } = req.body;
    const userId = req.userId;
    console.log("user : ",userId ,"Created Task :",title, description, "Due Date :", dueDate, "Subtasks :", subtasks, "Alarm Type :", alarm_type, "Alarm Reminder Time :", alarm_reminder_time, "Recurrence :", recurrence)
    let taskDueDate;
    
    if (recurrence && recurrence.frequency !== 'none') {
      // If recurring, calculate the first occurrence
      taskDueDate = calculateInitialDueDate(recurrence);
    } else {
      // For normal tasks, use provided dueDate or default to tomorrow
      taskDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

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

    const taskData = { 
      userId, 
      title, 
      description, 
      dueDate: taskDueDate, 
      subtasks: processedSubtasks,
      alarm_type,
      alarm_reminder_time: alarm_reminder_time ? new Date(alarm_reminder_time) : taskDueDate,
      created_at: new Date(),
      updated_at: new Date(),
      recurrence
    };

    const task = new Task(taskData);
    
    // Set originTaskId if recurring
    if (recurrence && recurrence.frequency !== 'none') {
      task.recurrence.originTaskId = task._id;
    }

    await task.save();

    // Trigger immediate silent sync to all devices so they can schedule local notifications
    try {
      const user = await User.findById(userId);
      if (user && user.pushTokens && user.pushTokens.length > 0) {
        await sendMultiplePushNotifications(
          user.pushTokens,
          null, // No title = Silent
          null, // No body = Silent
          { 
            taskId: task._id.toString(), 
            type: 'TASK_SYNC', 
            title: task.title, 
            dueDate: task.dueDate.toISOString(),
            alarmTime: task.alarm_reminder_time ? task.alarm_reminder_time.toISOString() : task.dueDate.toISOString()
          }
        );
        // We don't set notificationSent here because that's for the visible 'Due Now' fallback
        task.syncSent = true;
        await task.save();
      }
    } catch (notifyError) {
      console.error('Failed to send task sync notification:', notifyError);
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
    
    // Trigger immediate silent sync on update
    try {
      const user = await User.findById(userId);
      if (user && user.pushTokens && user.pushTokens.length > 0) {
        await sendMultiplePushNotifications(
          user.pushTokens,
          null, // No title = Silent
          null, // No body = Silent
          { 
            taskId: task._id.toString(), 
            type: 'TASK_SYNC', 
            title: task.title, 
            dueDate: task.dueDate.toISOString(),
            alarmTime: task.alarm_reminder_time ? task.alarm_reminder_time.toISOString() : task.dueDate.toISOString()
          }
        );
        task.syncSent = true;
        await task.save();
      }
    } catch (notifyError) {
      console.error('Failed to send task sync notification on update:', notifyError);
    }

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

    // If it's a recurring task, create the next occurrence
    if (task.recurrence && task.recurrence.frequency !== 'none') {
      const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrence);
      
      if (nextDueDate) {
        // Prepare next task
        // We reset subtasks but keep their titles
        const nextSubtasks = task.subtasks.map(sub => ({
          title: sub.title,
          completed: false,
          dueDate: nextDueDate // We can adjust this if subtasks have their own offsets, but for now simple
        }));

        const nextTask = new Task({
          userId: task.userId,
          title: task.title,
          description: task.description,
          dueDate: nextDueDate,
          subtasks: nextSubtasks,
          alarm_type: task.alarm_type,
          alarm_reminder_time: nextDueDate, // Default to nextDueDate
          recurrence: {
            ...task.recurrence.toObject(),
            originTaskId: task.recurrence.originTaskId || task._id
          },
          created_at: new Date(),
          updated_at: new Date()
        });

        await nextTask.save();

        // Trigger silent sync for the next task
        try {
          const user = await User.findById(userId);
          if (user && user.pushTokens && user.pushTokens.length > 0) {
            await sendMultiplePushNotifications(
              user.pushTokens,
              null,
              null,
              { 
                taskId: nextTask._id.toString(), 
                type: 'TASK_SYNC', 
                title: nextTask.title, 
                dueDate: nextTask.dueDate.toISOString(),
                alarmTime: nextTask.alarm_reminder_time ? nextTask.alarm_reminder_time.toISOString() : nextTask.dueDate.toISOString()
              }
            );
            nextTask.syncSent = true;
            await nextTask.save();
          }
        } catch (syncError) {
          console.error('Failed to sync next recurring task:', syncError);
        }
      }
    }

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
    task.subtasks.push({ title, dueDate: dueDate ? new Date(dueDate) : undefined });
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

// ─── Weekly Evaluation ────────────────────────────────────────────────────────
// GET /api/tasks/weekly-evaluation
//
// Rules:
//  • Evaluates completed calendar weeks (Mon 00:00 – Sun 23:59 UTC).
//  • Unlimited views: users can check their evaluation as many times as they want.
//  • The current in-progress week is never evaluated (only completed past weeks).
//  • Optional query param `weeksAgo` (default: 1) allows viewing previous weeks.
//
// Helpers ─────────────────────────────────────────────────────────────────────
// Returns the Monday 00:00:00 UTC of the ISO week that contains `date`.
function getWeekStart(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sun … 6 = Sat
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday = 0
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

// Returns a stable string key for the week, e.g. "2026-W36" (ISO 8601 compliant)
function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

router.get('/weekly-evaluation', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    // ── Use client-supplied UTC time ───────────────────────────────────────
    // Lambda functions can run in any AWS region, so server `new Date()` may
    // reflect a region clock. The frontend must send its current UTC time so
    // week boundaries are computed from the user's perspective.
    if (!req.query.clientTime) {
      return res.status(400).json({
        error: 'Missing required query param: clientTime (ISO 8601 UTC string, e.g. new Date().toISOString())'
      });
    }
    const now = new Date(req.query.clientTime);
    if (isNaN(now.getTime())) {
      return res.status(400).json({ error: 'Invalid clientTime. Must be a valid ISO 8601 UTC string.' });
    }
    // Drift guard: reject if client time is more than 24 h away from server time
    const serverNow = new Date();
    if (Math.abs(now - serverNow) > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'clientTime is too far from server time. Max allowed drift is 24 hours.' });
    }

    // ── Determine which previous week to evaluate ──────────────────────────
    // weeksAgo = 1 (default) evaluates the immediately preceding completed week.
    // weeksAgo = 2 evaluates 2 weeks ago, etc.
    // Current in-progress week (weeksAgo = 0) is never evaluated.
    const weeksAgoParam = req.query.weeksAgo || req.query.weekOffset;
    const weeksAgo = weeksAgoParam !== undefined ? parseInt(weeksAgoParam, 10) : 1;

    if (isNaN(weeksAgo) || weeksAgo < 1) {
      return res.status(400).json({
        error: 'Invalid weeksAgo parameter. Evaluation is only available for completed past weeks (weeksAgo must be an integer >= 1).'
      });
    }

    const thisWeekMonday = getWeekStart(now);
    const targetWeekMonday = new Date(thisWeekMonday);
    targetWeekMonday.setUTCDate(targetWeekMonday.getUTCDate() - (weeksAgo * 7));

    const targetWeekSunday = new Date(targetWeekMonday);
    targetWeekSunday.setUTCDate(targetWeekSunday.getUTCDate() + 7);
    targetWeekSunday.setTime(targetWeekSunday.getTime() - 1);

    const weekKey = isoWeekKey(targetWeekMonday);

    // ── Fetch tasks due in the evaluated week ──────────────────────────────
    const tasks = await Task.find({
      userId,
      dueDate: { $gte: targetWeekMonday, $lte: targetWeekSunday }
    }).lean();

    // ── Aggregate metrics ──────────────────────────────────────────────────
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed);
    const incompleteTasks = tasks.filter(t => !t.completed);
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks.length / totalTasks) * 100)
      : 0;

    // Overdue = not completed AND dueDate is in the past
    const overdueTasks = incompleteTasks.filter(t => new Date(t.dueDate) < now);

    // On-time = completed before or by its dueDate (updated_at as proxy)
    const onTimeTasks = completedTasks.filter(
      t => t.updated_at && new Date(t.updated_at) <= new Date(t.dueDate)
    );

    // Subtask stats
    const totalSubtasks = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
    const completedSubtasks = tasks.reduce(
      (acc, t) => acc + (t.subtasks?.filter(s => s.completed).length || 0), 0
    );

    // Daily breakdown Mon–Sun
    const dailyBreakdown = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(targetWeekMonday);
      day.setUTCDate(day.getUTCDate() + i);
      const key = day.toISOString().split('T')[0]; // YYYY-MM-DD
      dailyBreakdown[key] = { due: 0, completed: 0 };
    }
    for (const task of tasks) {
      const key = new Date(task.dueDate).toISOString().split('T')[0];
      if (dailyBreakdown[key]) {
        dailyBreakdown[key].due += 1;
        if (task.completed) dailyBreakdown[key].completed += 1;
      }
    }

    // Recurring vs one-off
    const recurringCount = tasks.filter(
      t => t.recurrence?.frequency && t.recurrence.frequency !== 'none'
    ).length;

    // Most productive day
    let mostProductiveDay = null;
    let maxCompletions = 0;
    for (const [day, stats] of Object.entries(dailyBreakdown)) {
      if (stats.completed > maxCompletions) {
        maxCompletions = stats.completed;
        mostProductiveDay = day;
      }
    }

    res.json({
      week: weekKey,
      weeks_ago: weeksAgo,
      evaluation_window: {
        from: targetWeekMonday.toISOString(),
        to: targetWeekSunday.toISOString()
      },
      summary: {
        total_tasks: totalTasks,
        completed: completedTasks.length,
        incomplete: incompleteTasks.length,
        overdue: overdueTasks.length,
        on_time: onTimeTasks.length,
        completion_rate_percent: completionRate,
        recurring_tasks: recurringCount,
        one_off_tasks: totalTasks - recurringCount
      },
      subtasks: {
        total: totalSubtasks,
        completed: completedSubtasks,
        completion_rate_percent: totalSubtasks > 0
          ? Math.round((completedSubtasks / totalSubtasks) * 100)
          : 0
      },
      daily_breakdown: dailyBreakdown,
      insights: {
        most_productive_day: mostProductiveDay,
        most_productive_day_completions: maxCompletions
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

