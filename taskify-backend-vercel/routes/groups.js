const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const Group = require('../models/Group');
const GroupTask = require('../models/GroupTask');
const User = require('../models/User');
const { sendMultiplePushNotifications } = require('../utils/notificationService');
const { calculateInitialDueDate } = require('../utils/taskRecurrence');
const verifyToken = require('../middleware/auth');

// Fetch all groups for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [{ adminId: req.userId }, { members: req.userId }]
    })
      .populate('members', 'username')
      .populate('adminId', 'username')
      .lean();
    
    // Fetch and attach tasks
    const groupIds = groups.map(g => g._id);
    const tasks = await GroupTask.find({ groupId: { $in: groupIds } }).populate('userId', 'username');

    groups.forEach(group => {
      group.tasks = tasks.filter(t => t.groupId.equals(group._id));
    });

    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create a new group (admin is the creator)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, duedate, members } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name required' });

    const group = new Group({
      name,
      description,
      duedate,
      adminId: req.userId,
      members: members || []
    });
    await group.save();
    await group.populate([
      { path: 'members', select: 'username' },
      { path: 'adminId', select: 'username' }
    ]);
    const groupJson = group.toJSON();
    groupJson.tasks = [];
    res.status(201).json(groupJson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update group task (admin or group member)
router.put('/:groupId/tasks/:taskId', verifyToken, async (req, res) => {
  try {
    const groupId = new ObjectId(req.params.groupId);
    const taskId = new ObjectId(req.params.taskId);
    const userId = new ObjectId(req.userId);

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMember = group.members.some(memberId => memberId.equals(userId));
    if (!group.adminId.equals(userId) && !isMember) {
      return res.status(403).json({ error: 'Only admin or group members can update tasks' });
    }

    const task = await GroupTask.findOne({ _id: taskId, groupId: groupId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { 
      userId: newUserId, 
      username, 
      task: taskName, 
      duedate, 
      completed,
      description,
      subtasks,
      recurrence,
      alarm_type,
      alarm_reminder_time
    } = req.body;

    const oldUserId = task.userId;
    if (newUserId) task.userId = newUserId;
    if (username) task.username = username;
    if (taskName) task.task = taskName;
    if (description !== undefined) task.description = description;
    if (subtasks !== undefined) task.subtasks = subtasks;
    if (recurrence !== undefined) task.recurrence = recurrence;
    if (alarm_type !== undefined) task.alarm_type = alarm_type;
    if (alarm_reminder_time !== undefined) task.alarm_reminder_time = alarm_reminder_time;

    if (duedate) {
      task.duedate = new Date(duedate);
      task.notificationSent = false;
      task.syncSent = false;
    }
    if (newUserId && (!oldUserId || oldUserId.toString() !== newUserId.toString())) {
      task.notificationSent = false;
      task.syncSent = false;
    }
    if (typeof completed === 'boolean') task.completed = completed;

    await task.save();

    // Send notification if a new user is assigned or the task name changed
    if (newUserId && (!oldUserId || oldUserId.toString() !== newUserId.toString())) {
      try {
        const assignedUser = await User.findById(newUserId);
        if (assignedUser && assignedUser.pushTokens && assignedUser.pushTokens.length > 0) {
          await sendMultiplePushNotifications(
            assignedUser.pushTokens,
            'Task Assigned',
            `Task assigned to them in group '${group.name}': ${task.task}`,
            { 
              taskId: task._id, 
              groupId: group._id, 
              type: 'GROUP_TASK_ASSIGNED', 
              dueDate: task.duedate, 
              userId: newUserId,
              task: task.task,
              description: task.description,
              subtasks: task.subtasks,
              recurrence: task.recurrence,
              alarm_type: task.alarm_type,
              alarm_reminder_time: task.alarm_reminder_time
            }
          );
          task.syncSent = true;
          await task.save();
        }
      } catch (notifyError) {
        console.error('Failed to send assignment notification:', notifyError);
      }
    }
    await task.populate('userId', 'username');
    res.status(200).json({ message: 'Task updated successfully', updatedTask: task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a group (admin only)
router.delete('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.adminId.toString() !== req.userId) return res.status(403).json({ error: 'Only admin can delete group' });

    await GroupTask.deleteMany({ groupId: group._id });
    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add user to group (admin only)
router.post('/:groupId/members', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: 'Invalid userId' });
    if (group.adminId.toString() !== req.userId) return res.status(403).json({ error: 'Only admin can add members' });

    if (!group.members) group.members = [];
    if (!group.members.includes(userId)) group.members.push(userId);
    await group.save();
    await group.populate([
      { path: 'members', select: 'username' },
      { path: 'adminId', select: 'username' }
    ]);
    const tasks = await GroupTask.find({ groupId: group._id }).populate('userId', 'username');
    const groupJson = group.toJSON();
    groupJson.tasks = tasks;
    res.json(groupJson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove user from group (admin only)
router.delete('/:groupId/members/:userId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.adminId.toString() !== req.userId) return res.status(403).json({ error: 'Only admin can remove members' });

    group.members = group.members.filter(m => m.toString() !== req.params.userId);
    await group.save();
    await group.populate([
      { path: 'members', select: 'username' },
      { path: 'adminId', select: 'username' }
    ]);
    const tasks = await GroupTask.find({ groupId: group._id }).populate('userId', 'username');
    const groupJson = group.toJSON();
    groupJson.tasks = tasks;
    res.json(groupJson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch group details
router.get('/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'username')
      .populate('adminId', 'username');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    const tasks = await GroupTask.find({ groupId: group._id }).populate('userId', 'username');
    const groupJson = group.toJSON();
    groupJson.tasks = tasks;
    res.json(groupJson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch group members
router.get('/:groupId/members', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'username');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group.members || []);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign task to member (admin or group member)
router.post('/:groupId/tasks', verifyToken, async (req, res) => {
  try {
    const { 
      userId, 
      username, 
      task, 
      duedate,
      description,
      subtasks,
      recurrence,
      alarm_type,
      alarm_reminder_time
    } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    const isMember = group.members.some(memberId => memberId.toString() === req.userId);
    if (group.adminId.toString() !== req.userId && !isMember) {
      return res.status(403).json({ error: 'Only admin or group members can assign tasks' });
    }

    // Determine task due date
    let taskDueDate;
    if (recurrence && recurrence.frequency !== 'none') {
      taskDueDate = calculateInitialDueDate(recurrence);
    } else {
      taskDueDate = duedate ? new Date(duedate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    // Check if duedate cannot be in the past
    if (taskDueDate < new Date()) {
      return res.status(400).json({ error: 'duedate cannot be in the past' });
    }

    // Prepare task fields
    const taskData = {
      groupId: group._id,
      task,
      description,
      subtasks: subtasks || [],
      recurrence,
      duedate: taskDueDate
    };
    if (userId) taskData.userId = userId;
    if (username) taskData.username = username;
    if (alarm_type) taskData.alarm_type = alarm_type;
    taskData.alarm_reminder_time = alarm_reminder_time ? new Date(alarm_reminder_time) : taskDueDate;

    const newTask = new GroupTask(taskData);

    // Set originTaskId if recurring
    if (recurrence && recurrence.frequency !== 'none') {
      newTask.recurrence.originTaskId = newTask._id;
    }

    await newTask.save();
    
    // Send notification if assigned to a user
    if (userId) {
      try {
        const assignedUser = await User.findById(userId);
        if (assignedUser && assignedUser.pushTokens && assignedUser.pushTokens.length > 0) {
          await sendMultiplePushNotifications(
            assignedUser.pushTokens,
            'Task Assigned',
            `Task assigned to them in group '${group.name}': ${task}`,
            { 
              taskId: newTask._id, 
              groupId: group._id, 
              type: 'GROUP_TASK_ASSIGNED', 
              dueDate: newTask.duedate, 
              userId: userId,
              task: newTask.task,
              description: newTask.description,
              subtasks: newTask.subtasks,
              recurrence: newTask.recurrence,
              alarm_type: newTask.alarm_type,
              alarm_reminder_time: newTask.alarm_reminder_time
            }
          );
          
          // Also set syncSent since the visible notification carries the data
          newTask.syncSent = true;
          await newTask.save();
        }
      } catch (notifyError) {
        console.error('Failed to send assignment notification:', notifyError);
      }
    }
    
    await group.populate([
      { path: 'members', select: 'username' },
      { path: 'adminId', select: 'username' }
    ]);
    const tasks = await GroupTask.find({ groupId: group._id }).populate('userId', 'username');
    const groupJson = group.toJSON();
    groupJson.tasks = tasks;

    res.json(groupJson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
