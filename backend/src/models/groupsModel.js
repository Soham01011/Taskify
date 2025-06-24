const mongoose = require('mongoose');

const GroupTaskSchema = new mongoose.Schema({
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
  assignedTo: {
    type: String, // username of group member
    required: true,
    trim: true,
  },
  createdBy: {
    type: String, // username of creator
    required: true,
    trim: true,
  }
}, { timestamps: true });

const MemberSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  creator: {
    type: String,
    required: true,
    trim: true
  },
  members: [MemberSchema],
  tasks: [GroupTaskSchema], // Embedded tasks here
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  methods: {
    isAdmin(username) {
      return this.members.some(member => 
        member.username === username && member.role === 'admin'
      );
    },
    isMember(username) {
      return this.members.some(member => member.username === username);
    }
  }
});

// Middleware to automatically add creator as admin
GroupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.members.push({
      username: this.creator,
      role: 'admin',
      joinedAt: new Date()
    });
  }
  next();
});

GroupSchema.index({ name: 1, creator: 1 }, { unique: true });
GroupSchema.index({ 'members.username': 1 });

GroupSchema.statics.findUserGroups = function(username) {
  return this.find({
    'members.username': username,
    isActive: true
  });
};

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;