const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  subjects: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  subjects: {
    type: [String],
    default: [],
  },
  subtasks: {
    type: [SubtaskSchema],
    default: [],
  },
  group: {
    type: String,
    default: 'personal',
    trim: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
