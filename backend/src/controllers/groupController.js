const Group = require('../models/groupsModel');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const group = new Group({
      name,
      description,
      creator: req.user.username,
      members: members ? members.map(username => ({ username })) : []
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Error creating group' });
  }
};

// Get all groups for a user
const getGroups = async (req, res) => {
  try {
    const groups = await Group.findUserGroups(req.user.username)
      .populate('tasks')
      .sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

// Update group details (admin only)
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user.username)) {
      return res.status(403).json({ message: 'Only admins can update group details' });
    }

    const { name, description, members } = req.body;
    
    if (name) group.name = name;
    if (description) group.description = description;
    if (members) {
      // Keep existing admins
      const admins = group.members.filter(m => m.role === 'admin');
      group.members = [
        ...admins,
        ...members.map(username => ({ username, role: 'member' }))
      ];
    }

    await group.save();
    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Error updating group' });
  }
};

// Delete group (admin only)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user.username)) {
      return res.status(403).json({ message: 'Only admins can delete groups' });
    }

    // Soft delete by marking inactive
    group.isActive = false;
    await group.save();
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Error deleting group' });
  }
};

// Add member to group (admin only)
const addMember = async (req, res) => {
  try {
    const { username } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user.username)) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    if (group.isMember(username)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push({ username });
    await group.save();
    
    res.json(group);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Error adding member' });
  }
};

// Create task in group
const createGroupTask = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (!group.isMember(req.user.username)) {
      return res.status(403).json({ message: 'Only group members can create tasks' });
    }

    const { title, description, dueDate, priority, assignedTo } = req.body;

    // Verify assignee is a group member
    if (!assignedTo || !group.isMember(assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must be a group member' });
    }

    const newTask = {
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      assignedTo,
      createdBy: req.user.username,
      completed: false
    };

    group.tasks.push(newTask);
    await group.save();

    // Return the newly added task (last in array)
    res.status(201).json(group.tasks[group.tasks.length - 1]);
  } catch (error) {
    console.error('Error creating group task:', error);
    res.status(500).json({ message: 'Error creating group task' });
  }
};

// Get all tasks in a group
const getGroupTasks = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('tasks');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isMember(req.user.username)) {
      return res.status(403).json({ message: 'Only group members can view tasks' });
    }

    res.json(group.tasks);
  } catch (error) {
    console.error('Error fetching group tasks:', error);
    res.status(500).json({ message: 'Error fetching group tasks' });
  }
};

const markGroupTaskComplete = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isMember(req.user.username)) {
      return res.status(403).json({ message: 'Only group members can update tasks' });
    }

    const task = group.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.completed) {
      return res.status(400).json({ message: 'Task is already completed' });
    }

    task.completed = true;
    await group.save();

    res.json(task);
  } catch (error) {
    console.error('Error marking task complete:', error);
    res.status(500).json({ message: 'Error marking task complete' });
  }
};

module.exports = {
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  addMember,
  createGroupTask,
  getGroupTasks,
  markGroupTaskComplete
};