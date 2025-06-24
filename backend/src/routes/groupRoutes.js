const express = require('express');
const router = express.Router();
const { 
  createGroup, 
  getGroups, 
  updateGroup, 
  deleteGroup,
  addMember,
  createGroupTask,
  getGroupTasks,
  markGroupTaskComplete
} = require('../controllers/groupController');

// Group management
router.post('/', createGroup);
router.get('/', getGroups);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Member management
router.post('/:id/members', addMember);

// Task management
router.post('/:id/tasks', createGroupTask);
router.get('/:id/tasks', getGroupTasks);
router.put('/:id/tasks/:taskId/complete', markGroupTaskComplete);

module.exports = router;