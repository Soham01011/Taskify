const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const { ObjectId } = mongoose.Types;

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Taskify';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '5h'
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const AUTH_SVC_URL = process.env.AUTH_SVC_URL || 'localhost:3001';

const app = express();
app.use(express.json());

let mongoReady = false;
let authReady = false;

mongoose.connect(MONGO_URI)
  .then(() => {
    mongoReady = true;
    app.listen(PORT, () => console.log(`Tasks service running on port ${PORT}`));
  })
  .catch(err => {
    mongoReady = false;
    console.error('MongoDB connection error:', err);
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  refreshToken: {
    type: String,
    default: null
  }
});

const TaskAssignmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  task: { type: String, required: true },
  duedate: { type: Date, required: true },
  completed: { type: Boolean, default: false }
});

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  duedate: { type: Date },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [TaskAssignmentSchema]
});

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
    const token = authHeader.replace('Bearer ', '');
    // Call Auth microservice to verify token
    const verifyRes = await axios.post(`http://${AUTH_SVC_URL}/api/auth/verify`, { token });
    if (verifyRes.data && verifyRes.data.userId) {
      req.userId = verifyRes.data.userId;
      console.log('Token verified:', req.userId);
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Token verification failed' });
  }
};

app.get('/api/groups/readyness', async (req, res) => {
  try {
    const response = await axios.post(`http://${AUTH_SVC_URL}/api/auth/verify`, { token: 'test-token' });
    authReady = true;
  } catch (error) {
    if (error.response) {
      // Log the error response object

      if ([400 ,401, 403, 402, 404, 405].includes(error.response.status)) {
        authReady = true;
      } else {
        authReady = false;
      }
    } else {
      // Log network or other errors
      console.log('Auth verify error:', error.message);
      authReady = false;
    }
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
    res.status(500).json({
      status: 'not ready',
      mongoReady,
      authReady,
      PORT,
      MONGO_URI,
      JWT_SECRET,
      JWT_EXPIRES_IN,
      REFRESH_TOKEN_EXPIRES_IN
    });
  }
});

/*
   This a groups microservice that handles group-related operations.
   The tasks performed by this service include:
   - Creating, updating, and deleting groups
   - Adding and removing users from groups
   - Fetching group details and members
   - Verifying user permissions for group operations
   - Ensuring secure communication with the Auth microservice for user authentication
   - Providing readiness and health check endpoints for service monitoring
   - Using MongoDB for data persistence and Express.js for the API framework
   - Utilizing Axios for HTTP requests to the Auth microservice
   - The admin of the group can manage group members and tasks
   - The admin can assign tasks to members with a duedate
   - the admin can create the groups with userId's as members
*/

const Group = mongoose.model('Group', GroupSchema);

// Create a new group (admin is the creator)
app.post('/api/groups', verifyToken, async (req, res) => {
  try {
    const { name, description, duedate, members , tasks} = req.body;
    if (!name) return res.status(400).json({ error: 'Group name required' });

    // members: [{ userId, username }]
    const group = new Group({
      name,
      description,
      duedate,
      adminId: req.userId,
      members: members || [],
      tasks: tasks || []
    });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update group details (admin only)

app.put('/api/groups/:groupId/tasks/:taskId', verifyToken, async (req, res) => {
  try {
    const groupId = new ObjectId(req.params.groupId);
    const taskId = new ObjectId(req.params.taskId);
    const userId = new ObjectId(req.userId); // Admin's user ID

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (!group.adminId.equals(userId)) {
      return res.status(403).json({ error: 'Only admin can update tasks' });
    }

    const task = group.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { userId: newUserId, username, task: taskName, duedate, completed } = req.body;

    if (newUserId) task.userId = newUserId;
    if (username) task.username = username;
    if (taskName) task.task = taskName;
    if (duedate) task.duedate = new Date(duedate);
    if (typeof completed === 'boolean') task.completed = completed;

    await group.save();
    res.status(200).json({ message: 'Task updated successfully', updatedTask: task });

  } catch (err) {
    console.error('[Group Task Update Error]:', err);
    res.status(400).json({ error: err.message });
  }
});


// Delete a group (admin only)
app.delete('/api/groups/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.adminId !== req.userId) return res.status(403).json({ error: 'Only admin can delete group' });

    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add user to group (admin only)
app.post('/api/groups/:groupId/members', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: 'Invalid userId' });
    if (group.adminId.toString() !== req.userId) return res.status(403).json({ error: 'Only admin can add members' });

    if (!group.members) group.members = [];
    if (!group.members.includes(userId)) group.members.push(userId);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove user from group (admin only)
app.delete('/api/groups/:groupId/members/:userId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.adminId.toString() !== req.userId) return res.status(403).json({ error: 'Only admin can remove members' });

    group.members = group.members.filter(
      m => m.toString() !== req.params.userId
    );
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch group details
app.get('/api/groups/:groupId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch group members
app.get('/api/groups/:groupId/members', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group.members || []);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign task to member (admin only)
app.post('/api/groups/:groupId/tasks', verifyToken, async (req, res) => {
  try {
    const { userId, username, task, duedate } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.adminId !== req.userId) return res.status(403).json({ error: 'Only admin can assign tasks' });

    group.tasks.push({ userId, username, task, duedate });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});