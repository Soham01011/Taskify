const express = require('express');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/tasksController');
const router = express.Router();

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);


module.exports = router;
