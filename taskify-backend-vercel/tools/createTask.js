const Task = require('../models/Task');
const User = require('../models/User');
const { sendMultiplePushNotifications } = require('../utils/notificationService');

/**
 * Create a new task for the user
 * @param {string} userId - The userid to create the task for.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} datetime - ISO datetime string.
 * @param {string} recurrence - Optional recurrence frequency (none, daily, weekly, monthly).
 */
async function createTask(userId, title, description, datetime, recurrence = 'none') {
  try {
    const taskDueDate = datetime ? new Date(datetime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Simple validation
    if (isNaN(taskDueDate.getTime())) {
      return { error: 'Invalid datetime format. ISO string expected.' };
    }

    const taskData = {
      userId,
      title,
      description,
      dueDate: taskDueDate,
      recurrence: { frequency: recurrence },
      created_at: new Date(),
      updated_at: new Date()
    };

    const task = new Task(taskData);
    await task.save();

    // Trigger silent sync to user devices (optional but good for consistency with your API)
    try {
      const user = await User.findById(userId);
      if (user && user.pushTokens && user.pushTokens.length > 0) {
        await sendMultiplePushNotifications(
          user.pushTokens,
          null, null,
          { 
            taskId: task._id.toString(), 
            type: 'TASK_SYNC', 
            title: task.title, 
            dueDate: task.dueDate.toISOString() 
          }
        );
      }
    } catch (syncError) {
      console.error('Failed to sync task after creation:', syncError);
    }

    return { 
      message: 'Task created successfully', 
      taskId: task._id, 
      title: task.title, 
      dueDate: task.dueDate 
    };
  } catch (error) {
    console.error('Error in createTask tool:', error);
    return { error: error.message };
  }
}

const createTaskDefinition = {
  type: 'function',
  function: {
    name: 'createTask',
    description: 'Create a new task for the user.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the task.' },
        description: { type: 'string', description: 'Detailed description of the task.' },
        datetime: { type: 'string', description: 'The due date and time in ISO format (YYYY-MM-DDTHH:mm).' },
        recurrence: { 
          type: 'string', 
          enum: ['none', 'daily', 'weekly', 'monthly'],
          default: 'none',
          description: 'How often the task repeats.' 
        }
      },
      required: ['title', 'datetime']
    }
  }
};

module.exports = {
  createTask,
  createTaskDefinition
};
