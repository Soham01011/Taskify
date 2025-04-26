const Task = require("../models/Task");

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
    const { title, description, dueDate, priority, subjects } = req.body;

    const newTask = new Task({
      username: req.user.username, // coming from authMiddleware (attached user)
      title,
      description,
      dueDate,
      priority,
      subjects: subjects?.length ? subjects : [],
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

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
