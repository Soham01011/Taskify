const Task = require("../models/taskModel");

// Get all tasks or a single task by ID
const getTasks = async (req, res) => {
  try {
    const { username } = req.params;

    if (username) {
      if (username !== req.user.username) {
        return res
          .status(403)
          .json({ message: "Unauthorized access to tasks" });
      }

      const tasks = await Task.find({
        username: username,
        completed: false, // Only incomplete tasks
      });

      return res.status(200).json(tasks);
    } else {
      const tasks = await Task.find({
        username: req.user.username,
        completed: false,
      });

      return res.status(200).json(tasks);
    }
  } catch (error) {
    console.error("Error fetching task(s):", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, subjects, group, subtasks } = req.body;
    console.log("Request body:", req.body);
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Parse dueDate to a Date object if it exists
    let dueDateObj = null;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      
      // Get current time in IST
      const now = new Date();
      const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

      // Check if dueDate is in the past
      if (dueDateObj < istNow) {
        return res.status(400).json({ message: "Cannot set a due date/time in the past." });
      }
    }

    // Create the new task
    const newTask = new Task({
      username: req.user.username,
      title,
      description: description || '',
      dueDate: dueDateObj,
      priority: priority || 'medium',
      subjects: subjects || [],
      group: group || 'personal',
      subtasks: subtasks || []
    });

    const savedTask = await newTask.save();
    return res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// Update an existing task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If 'dueDate' is being updated, validate it
    if (updates.dueDate) {
      const dueDateObj = new Date(updates.dueDate);
      const now = new Date();
      const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // add 5.5 hours to current UTC time

      if (dueDateObj < istNow) {
        return res.status(400).json({ message: "Cannot set due date/time in the past." });
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, username: req.user.username }, // Only allow updating user's own tasks
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      username: req.user.username,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const markComplete = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if this is a subtask completion
    if (req.path.includes('/subtask/')) {
      const subtask = task.subtasks.id(subtaskId);
      if (!subtask) {
        return res.status(404).json({ message: 'Subtask not found' });
      }
      subtask.completed = true;
    } else {
      // Main task completion
      task.completed = true;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error in markComplete:', error);
    res.status(500).json({ message: 'Error updating task completion status' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
};
