const Task = require('../models/Task');
const User = require('../models/User');
const { sendMultiplePushNotifications } = require('../utils/notificationService');
const { generateScheduleDates } = require('../utils/taskRecurrence');

/**
 * Create a new task for the user (or bulk normal tasks if recurrence is 'schedule')
 * @param {string} userId - The userid to create the task for.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} datetime - ISO datetime string.
 * @param {string} recurrence - Optional recurrence frequency (none, daily, weekly, monthly, schedule).
 * @param {string} [startDate] - Start date-time in ISO format (e.g. 2026-10-20T17:00:00.000Z).
 * @param {string} [endDate] - End date-time in ISO format (e.g. 2026-10-24T17:00:00.000Z).
 */
async function createTask(userId, title, description, datetime, recurrence = 'none', startDate = null, endDate = null) {
  try {
    if (recurrence === 'schedule' || recurrence === 'scheduled' || (startDate && endDate)) {
      const scheduleStartDate = startDate || datetime;
      const scheduleEndDate = endDate;

      if (!scheduleStartDate || !scheduleEndDate) {
        return { error: 'startDate and endDate are required for schedule recurrence' };
      }

      const dates = generateScheduleDates(scheduleStartDate, scheduleEndDate);
      const tasksToCreate = dates.map(d => ({
        userId,
        title,
        description,
        dueDate: d,
        recurrence: { frequency: 'none' },
        timeSlots: [{ hours: 0, minutes: 30 }],
        created_at: new Date(),
        updated_at: new Date()
      }));

      const createdTasks = await Task.insertMany(tasksToCreate);

      // Trigger silent sync
      try {
        const user = await User.findById(userId);
        if (user && user.pushTokens && user.pushTokens.length > 0) {
          for (const st of createdTasks) {
            await sendMultiplePushNotifications(
              user.pushTokens,
              null, null,
              {
                taskId: st._id.toString(),
                type: 'TASK_SYNC',
                title: st.title,
                dueDate: st.dueDate.toISOString()
              }
            );
          }
          await Task.updateMany(
            { _id: { $in: createdTasks.map(t => t._id) } },
            { $set: { syncSent: true } }
          );
        }
      } catch (syncError) {
        console.error('Failed to sync scheduled tasks:', syncError);
      }

      return {
        message: `${createdTasks.length} normal tasks scheduled and created successfully`,
        tasks: createdTasks.map(t => ({ taskId: t._id, title: t.title, dueDate: t.dueDate }))
      };
    }

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
    description: 'Create a new task for the user, or multiple daily tasks if scheduling an event across dates.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the task.' },
        description: { type: 'string', description: 'Detailed description of the task.' },
        datetime: { type: 'string', description: 'The due date and time in ISO format (YYYY-MM-DDTHH:mm).' },
        recurrence: { 
          type: 'string', 
          enum: ['none', 'daily', 'weekly', 'monthly', 'schedule'],
          default: 'none',
          description: 'Recurrence frequency. Use "schedule" when scheduling across multiple dates.' 
        },
        startDate: { type: 'string', description: 'Start date-time in ISO format for schedule recurrence (e.g. 2026-10-20T17:00:00.000Z).' },
        endDate: { type: 'string', description: 'End date-time in ISO format for schedule recurrence (e.g. 2026-10-24T17:00:00.000Z).' }
      },
      required: ['title']
    }
  }
};

module.exports = {
  createTask,
  createTaskDefinition
};
