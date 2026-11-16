// models/cronStatus.js – records each cron execution status
const mongoose = require('mongoose');

const CronStatusSchema = new mongoose.Schema({
  // When the cron job ran (UTC)
  runAt: { type: Date, default: () => new Date(), required: true },
  // Number of tasks deleted in this run
  deletedCount: { type: Number, required: true },
  // Optional array of deleted task IDs (if you choose to record them)
  deletedTaskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    // Optional array of deleted user IDs (if you want to track which users' tasks were removed)
  deletedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Any additional info you might want to store
  info: { type: mongoose.Schema.Types.Mixed },
});

module.exports = mongoose.model('CronStatus', CronStatusSchema);
