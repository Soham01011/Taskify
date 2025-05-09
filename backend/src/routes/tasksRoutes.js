const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, markComplete } = require('../controllers/tasksController');
const router = express.Router();

// Basic CRUD routes
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Split the complete routes into two separate routes
router.put('/complete/:taskId', markComplete); // For main task completion
router.put('/complete/:taskId/subtask/:subtaskId', markComplete); // For subtask completion

module.exports = router;
