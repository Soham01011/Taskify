const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
});

const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  subtasks: [SubtaskSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  alarm_type: { type: String, enum: ['email', 'sms', 'push', 'alarm'], default: 'push' },
  alarm_reminder_time: { type: Date },
  notificationSent: { type: Boolean, default: false },
  recurrence: {
    frequency: { 
      type: String, 
      enum: ['none', 'daily', 'weekly', 'monthly', 'six-months', 'annually'], 
      default: 'none' 
    },
    daysOfWeek: [Number], // 0-6 (Sunday-Saturday) for weekly
    dayOfMonth: Number,   // 1-31 for monthly
    lastWeekend: { type: Boolean, default: false }, // Special case for monthly: last weekend of the month
    timeOfDay: String,    // HH:mm for specific time of day
    originTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' } // Reference to the first task in the series
  },
  syncSent: { type: Boolean, default: false },
}, { 
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  } 
});



module.exports = mongoose.model('Task', TaskSchema);
