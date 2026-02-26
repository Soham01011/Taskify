const mongoose = require('mongoose');

const GroupTaskSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  username: { type: String, required: false },
  task: { type: String, required: true },
  duedate: { type: Date, required: false },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('GroupTask', GroupTaskSchema);
