const { stringify } = require("uuid");
const Task = require("../models/taskModel");

const Group = require("../models/groupsModel");

// Get all tasks or a single task by ID
const getTasks = async (req, res) => {
  try {
    // Personal tasks
    const personalTasks = await Task.find({ username: req.user.username, completed: false });

    // Group tasks assigned to the user
    const groups = await Group.findUserGroups(req.user.username);
    let groupTasks = [];
    groups.forEach(group => {
      if (Array.isArray(group.tasks)) {
        group.tasks.forEach(task => {
          if (task.assignedTo === req.user.username && !task.completed) {
            groupTasks.push({
              ...task.toObject(),
              groupName: group.name,
              groupId: group._id,
              groupTaskId: task._id // Correct reference to the task's _id
            });
          }
        });
      }
    });

    // Combine and sort all tasks by due date (nulls last)
    const allTasks = [...personalTasks, ...groupTasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return res.status(200).json(allTasks);
  } catch (error) {
    console.error("Error fetching task(s):", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, subjects, group, subtasks } = req.body;
    console.log("Create task request body:", req.body);
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
      // Check if dueDate is in the past
      if (dueDateObj < now) {
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
    const { taskId } = req.params;
    const { subtaskTitle } = req.body; // We'll send subtask title instead of ID
    
    const task = await Task.findOne({ 
      _id: taskId,
      username: req.user.username // Ensure user owns the task
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (subtaskTitle) {
      // Find and update subtask by title
      const subtask = task.subtasks.find(st => st.title === subtaskTitle);
      if (!subtask) {
        return res.status(404).json({ message: 'Subtask not found' });
      }
      subtask.completed = true;
      // Don't mark main task as completed
    } else {
      // Mark main task and all subtasks as completed
      task.completed = true;
      task.subtasks.forEach(subtask => {
        subtask.completed = true;
      });
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
