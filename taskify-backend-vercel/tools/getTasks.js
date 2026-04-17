const Task = require('../models/Task');

/**
 * Fetch all user tasks and can also apply filters if provided
 * @param {string} userId - The userid to fetch tasks.
 * @param {string} date - Fetch tasks of the particular date (YYYY-MM-DD). Optional
 * @param {string} fromDate - fetch all tasks from that date including it (YYYY-MM-DD). Optional
 * @param {string} toDate - fetch tasks till the date including it (YYYY-MM-DD). Optional 
 */
async function getTasks(userId, date = null, fromDate = null, toDate = null) {
  try {
    let query = { userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (fromDate || toDate) {
      query.dueDate = {};
      if (fromDate) {
        const startFrom = new Date(fromDate);
        startFrom.setHours(0, 0, 0, 0);
        query.dueDate.$gte = startFrom;
      }
      if (toDate) {
        const endTo = new Date(toDate);
        endTo.setHours(23, 59, 59, 999);
        query.dueDate.$lte = endTo;
      }
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });

    // Format the output to be concise for the LLM
    return tasks.map(task => ({
      taskId: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      dueDate: task.dueDate,
      subtasks: task.subtasks.map(sub => ({
        title: sub.title,
        completed: sub.completed
      })),
      recurrence: (task.recurrence && task.recurrence.frequency !== 'none') ? task.recurrence.frequency : null
    }));
  } catch (error) {
    console.error('Error in getTasks tool:', error);
    return { error: error.message };
  }
}

const getTasksDefinition = {
  type: 'function',
  function: {
    name: 'getTasks',
    description: 'Fetch user tasks list with optional date filters. Use this to see what tasks a user has, if they are completed, and their subtasks.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Fetch tasks for a specific date (YYYY-MM-DD).'
        },
        fromDate: {
          type: 'string',
          description: 'Fetch tasks starting from this date (YYYY-MM-DD).'
        },
        toDate: {
          type: 'string',
          description: 'Fetch tasks up to this date (YYYY-MM-DD).'
        }
      }
    }
  }
};

module.exports = {
  getTasks,
  getTasksDefinition
};