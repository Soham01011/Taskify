const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, required: true, enum: ['PERSONAL', 'GROUP'] },
  owner_id: { type: String, required: true, index: true },
  created_by: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'], default: 'ACTIVE' },
  sort_order: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

WorkflowSchema.index({ owner_id: 1, type: 1 });
WorkflowSchema.index({ created_by: 1 });

module.exports = mongoose.model('Workflow', WorkflowSchema);
