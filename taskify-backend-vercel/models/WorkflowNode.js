const mongoose = require('mongoose');

const WorkflowNodeSchema = new mongoose.Schema({
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true },
  source_type: { type: String, required: true, enum: ['TASK', 'IDEA'] },
  source_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  node_type: { type: String, enum: ['ACTION', 'MILESTONE', 'DECISION'], default: 'ACTION' },
  status: { type: String, enum: ['LOCKED', 'READY', 'IN_PROGRESS', 'DONE', 'SKIPPED'], default: 'LOCKED' },
  assigned_to: [{ type: String }],
  completion_rule: { type: String, enum: ['ALL', 'ANY'], default: 'ALL' },
  completed_by: { type: Map, of: Date, default: {} },
  due_date: { type: Date },
  position_x: { type: Number, default: 0 },
  position_y: { type: Number, default: 0 },
  notes: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

WorkflowNodeSchema.index({ workflow_id: 1, source_type: 1, source_id: 1 }, { unique: true });
module.exports = mongoose.model('WorkflowNode', WorkflowNodeSchema);
