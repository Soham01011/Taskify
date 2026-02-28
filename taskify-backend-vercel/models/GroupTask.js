const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
});

const GroupTaskSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  username: { type: String, required: false },
  task: { type: String, required: true }, // For group tasks, this is the title/task name
  description: String,
  duedate: { type: Date, required: false },
  subtasks: [SubtaskSchema],
  completed: { type: Boolean, default: false },
  notificationSent: { type: Boolean, default: false },
  syncSent: { type: Boolean, default: false },
  alarm_type: { type: String, enum: ['email', 'sms', 'push', 'alarm'], default: 'push' },
  alarm_reminder_time: { type: Date },
  recurrence: {
    frequency: { 
      type: String, 
      enum: ['none', 'daily', 'weekly', 'monthly', 'six-months', 'annually'], 
      default: 'none' 
    },
    daysOfWeek: [Number],
    dayOfMonth: Number,
    lastWeekend: { type: Boolean, default: false },
    timeOfDay: String,
    originTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupTask' }
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('GroupTask', GroupTaskSchema);
