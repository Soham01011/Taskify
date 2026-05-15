const mongoose = require('mongoose');

const WorkflowEdgeSchema = new mongoose.Schema({
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true },
  from_node_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowNode', required: true, index: true },
  to_node_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowNode', required: true, index: true },
  edge_type: { type: String, enum: ['BLOCKS', 'RELATED', 'SOFT_BLOCK'], default: 'BLOCKS' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

WorkflowEdgeSchema.index({ from_node_id: 1, to_node_id: 1 }, { unique: true });

module.exports = mongoose.model('WorkflowEdge', WorkflowEdgeSchema);
