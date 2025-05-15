const express = require('express');
const { getTasks, createTask, updateTask, deleteTask, markComplete } = require('../controllers/tasksController');
const router = express.Router();

// Basic CRUD routes
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Single route for both task and subtask completion
router.put('/complete/:taskId', markComplete);

module.exports = router;
