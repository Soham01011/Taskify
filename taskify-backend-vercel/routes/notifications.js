const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const GroupTask = require('../models/GroupTask');
const User = require('../models/User');

// This endpoint should be triggered by a Cron Job every minute
// For Vercel: https://vercel.com/docs/cron-jobs
router.get('/cron/process-due-tasks', async (req, res) => {
  // Check if the request is from Vercel Cron
  if (process.env.NODE_ENV === 'production' && !req.headers['x-vercel-cron']) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const now = new Date();
    
    const messages = [];
    const tasksToUpdate = [];
    const groupTasksToUpdate = [];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Process Individual Tasks (Immediate and Future Sync)
    const pendingTasks = await Task.find({
      completed: false,
      $or: [
        { notificationSent: false, alarm_reminder_time: { $lte: now } }, // Due now
        { syncSent: false, alarm_reminder_time: { $gt: now, $lte: tomorrow } } // Due in next 24h
      ]
    });

    for (const task of pendingTasks) {
      try {
        const user = await User.findById(task.userId);
        if (user && user.pushTokens && user.pushTokens.length > 0) {
          const isDueNow = task.alarm_reminder_time <= now;
          
          for (const token of user.pushTokens) {
            const message = {
              to: token,
              sound: 'default',
              data: { 
                taskId: task._id.toString(), 
                type: isDueNow ? 'TASK_DUE' : 'TASK_SYNC',
                title: task.title,
                dueDate: task.dueDate.toISOString(),
                alarmTime: task.alarm_reminder_time ? task.alarm_reminder_time.toISOString() : task.dueDate.toISOString()
              }
            };

            // Only add visible text if it's due now
            if (isDueNow) {
              message.title = 'Task Reminder';
              message.body = `Your task '${task.title}' is due now!`;
            } else {
              // Silent notification for future sync
              message._contentAvailable = true; 
            }

            messages.push(message);
          }
          
          if (isDueNow) task.notificationSent = true;
          task.syncSent = true;
          tasksToUpdate.push(task);
        }
      } catch (err) {
        console.error(`Error preparing task ${task._id}:`, err);
      }
    }

    // 2. Process Group Tasks (Immediate and Future Sync)
    const pendingGroupTasks = await GroupTask.find({
      completed: false,
      userId: { $ne: null },
      $or: [
        { notificationSent: false, duedate: { $lte: now } },
        { syncSent: false, duedate: { $gt: now, $lte: tomorrow } }
      ]
    }).populate('groupId');

    for (const gTask of pendingGroupTasks) {
      try {
        const user = await User.findById(gTask.userId);
        if (user && user.pushTokens && user.pushTokens.length > 0) {
          const isDueNow = gTask.duedate <= now;
          const groupName = gTask.groupId ? gTask.groupId.name : 'a group';

          for (const token of user.pushTokens) {
            const message = {
              to: token,
              sound: 'default',
              data: { 
                taskId: gTask._id.toString(), 
                groupId: gTask.groupId ? gTask.groupId._id.toString() : null,
                type: isDueNow ? 'GROUP_TASK_DUE' : 'GROUP_TASK_SYNC',
                task: gTask.task,
                dueDate: gTask.duedate.toISOString()
              }
            };

            if (isDueNow) {
              message.title = 'Group Task Reminder';
              message.body = `Your task '${gTask.task}' in group '${groupName}' is due now!`;
            } else {
              message._contentAvailable = true;
            }

            messages.push(message);
          }
          
          if (isDueNow) gTask.notificationSent = true;
          gTask.syncSent = true;
          groupTasksToUpdate.push(gTask);
        }
      } catch (err) {
        console.error(`Error preparing group task ${gTask._id}:`, err);
      }
    }

    // 3. Send all notifications in bulk
    if (messages.length > 0) {
      console.log(`Sending ${messages.length} total notifications in bulk...`);
      const sdk = await import('expo-server-sdk');
      const Expo = sdk.Expo;
      const expoClient = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
      const chunks = expoClient.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expoClient.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error('Error sending chunk in cron:', error);
        }
      }
    }

    // 4. Save updates to DB
    await Promise.all([
      ...tasksToUpdate.map(t => t.save()),
      ...groupTasksToUpdate.map(gt => gt.save())
    ]);

    res.json({ 
      status: 'success', 
      tasksProcessed: tasksToUpdate.length, 
      groupTasksProcessed: groupTasksToUpdate.length 
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
