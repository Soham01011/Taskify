const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Workflow = require('../models/Workflow');
const WorkflowNode = require('../models/WorkflowNode');
const WorkflowEdge = require('../models/WorkflowEdge');
const Task = require('../models/Task');
const Idea = require('../models/idea');

// Helper to check for cycles
async function wouldCreateCycle(workflowId, fromNodeId, toNodeId) {
  let visited = new Set();
  let queue = [toNodeId.toString()];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === fromNodeId.toString()) {
      return true;
    }
    if (visited.has(current)) continue;
    visited.add(current);

    const childrenEdges = await WorkflowEdge.find({
      workflow_id: workflowId,
      from_node_id: current
    });

    for (let edge of childrenEdges) {
      queue.push(edge.to_node_id.toString());
    }
  }
  return false;
}

// Helper to handle status cascade
async function cascadeStatus(workflowId, nodeId, newStatus, oldStatus) {
  if (newStatus === 'DONE') {
    // Check children and potentially unlock them
    const childrenEdges = await WorkflowEdge.find({ workflow_id: workflowId, from_node_id: nodeId });
    for (const edge of childrenEdges) {
      const childId = edge.to_node_id;
      // Get all parents of the child
      const parentEdges = await WorkflowEdge.find({ workflow_id: workflowId, to_node_id: childId });
      let allParentsDone = true;
      for (const pEdge of parentEdges) {
        const parentNode = await WorkflowNode.findById(pEdge.from_node_id);
        if (!parentNode || parentNode.status !== 'DONE') {
          allParentsDone = false;
          break;
        }
      }
      if (allParentsDone) {
        await WorkflowNode.findByIdAndUpdate(childId, { status: 'READY' });
      }
    }
  } else if (oldStatus === 'DONE' && newStatus !== 'DONE') {
    // Lock children
    const childrenEdges = await WorkflowEdge.find({ workflow_id: workflowId, from_node_id: nodeId });
    for (const edge of childrenEdges) {
      const childId = edge.to_node_id;
      const child = await WorkflowNode.findById(childId);
      if (child && child.status === 'READY') {
        child.status = 'LOCKED';
        await child.save();
      }
    }
  }
}

// Helper to sync task completion
async function syncTaskCompletion(node) {
  if (node.source_type === 'TASK') {
    const isCompleted = node.status === 'DONE';
    let task = await Task.findById(node.source_id);
    if (task) {
      task.completed = isCompleted;
      await task.save();
    } else {
      task = await Task.findOne({ 'subtasks._id': node.source_id });
      if (task) {
        const subtask = task.subtasks.id(node.source_id);
        if (subtask) {
          subtask.completed = isCompleted;
          await task.save();
        }
      }
    }
  }
}

// 1. Workflow CRUD
// Create a new workflow
router.post('/', async (req, res) => {
  try {
    const { name, description, type, owner_id } = req.body;
    // Assuming created_by is provided in body or auth. Let's assume body for simplicity (like other routes might do if auth middleware isn't present here yet. Actually, how does the user auth work? Check `req.user`?)
    const created_by = req.body.userId || owner_id; // temporary fallback
    const workflow = new Workflow({
      name,
      description,
      type,
      owner_id,
      created_by
    });
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflows
router.get('/', async (req, res) => {
  try {
    const { type, owner_id } = req.query;
    const query = {};
    if (type) query.type = type;
    if (owner_id) query.owner_id = owner_id;
    const workflows = await Workflow.find(query).sort({ sort_order: 1, created_at: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await WorkflowNode.deleteMany({ workflow_id: req.params.id });
    await WorkflowEdge.deleteMany({ workflow_id: req.params.id });
    await Workflow.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Node CRUD within a Workflow
router.post('/:id/nodes', async (req, res) => {
  try {
    const { 
      source_type, 
      source_id, 
      new_task_data, 
      new_idea_data, 
      due_date, 
      assigned_to, 
      completion_rule, 
      notes,
      position_x,
      position_y,
      node_type,
      status
    } = req.body;
    let actualSourceId = source_id;

    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    if (!actualSourceId) {
      if (source_type === 'TASK' && new_task_data) {
        if (!new_task_data.userId) new_task_data.userId = req.body.userId || workflow.created_by;
        const task = new Task(new_task_data);
        await task.save();
        actualSourceId = task._id;
      } else if (source_type === 'IDEA' && new_idea_data) {
        if (!new_idea_data.userId) new_idea_data.userId = req.body.userId || workflow.created_by;
        const idea = new Idea(new_idea_data);
        await idea.save();
        actualSourceId = idea._id;
      }
    }

    const node = new WorkflowNode({
      workflow_id: req.params.id,
      source_type,
      source_id: actualSourceId,
      due_date,
      assigned_to,
      completion_rule,
      notes,
      position_x,
      position_y,
      node_type,
      status
    });

    // Check if it's a root node
    const parentEdges = await WorkflowEdge.find({ workflow_id: req.params.id, to_node_id: node._id });
    if (parentEdges.length === 0) {
        node.status = 'READY';
    }

    await node.save();
    res.status(201).json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/nodes', async (req, res) => {
  try {
    const nodes = await WorkflowNode.find({ workflow_id: req.params.id });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/nodes/:nodeId', async (req, res) => {
  try {
    const node = await WorkflowNode.findById(req.params.nodeId);
    if (!node) return res.status(404).json({ error: 'Node not found' });
    res.json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/nodes/:nodeId', async (req, res) => {
  try {
    const node = await WorkflowNode.findByIdAndUpdate(req.params.nodeId, req.body, { new: true });
    
    if (node && req.body.status !== undefined) {
      await syncTaskCompletion(node);
    }
    
    res.json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/nodes/:nodeId', async (req, res) => {
  try {
    // Delete associated edges first
    await WorkflowEdge.deleteMany({
      workflow_id: req.params.id,
      $or: [{ from_node_id: req.params.nodeId }, { to_node_id: req.params.nodeId }]
    });
    await WorkflowNode.findByIdAndDelete(req.params.nodeId);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Edge CRUD
router.post('/:id/edges', async (req, res) => {
  try {
    const { from_node_id, to_node_id, edge_type } = req.body;
    
    // Cycle check
    const hasCycle = await wouldCreateCycle(req.params.id, from_node_id, to_node_id);
    if (hasCycle) {
      return res.status(400).json({ error: 'Adding this edge would create a cycle' });
    }

    const edge = new WorkflowEdge({
      workflow_id: req.params.id,
      from_node_id,
      to_node_id,
      edge_type
    });
    await edge.save();

    // Since to_node_id now has a parent, it should be LOCKED if it was READY (unless parents are all DONE)
    const toNode = await WorkflowNode.findById(to_node_id);
    if (toNode && toNode.status === 'READY') {
      const parent = await WorkflowNode.findById(from_node_id);
      if (parent && parent.status !== 'DONE') {
        toNode.status = 'LOCKED';
        await toNode.save();
      }
    }

    res.status(201).json(edge);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Edge already exists' });
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/edges', async (req, res) => {
  try {
    const edges = await WorkflowEdge.find({ workflow_id: req.params.id });
    res.json(edges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/edges/:edgeId', async (req, res) => {
  try {
    const edge = await WorkflowEdge.findById(req.params.edgeId);
    if (!edge) return res.status(404).json({ error: 'Edge not found' });
    const toNodeId = edge.to_node_id;

    await WorkflowEdge.findByIdAndDelete(req.params.edgeId);

    // After deleting edge, maybe children unlock
    // Get all remaining parents of toNodeId
    const remainingEdges = await WorkflowEdge.find({ workflow_id: req.params.id, to_node_id: toNodeId });
    let allParentsDone = true;
    for (let e of remainingEdges) {
      const parentNode = await WorkflowNode.findById(e.from_node_id);
      if (!parentNode || parentNode.status !== 'DONE') {
        allParentsDone = false;
        break;
      }
    }

    if (allParentsDone) {
      await WorkflowNode.findByIdAndUpdate(toNodeId, { status: 'READY' });
    }

    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Node Status Update
router.patch('/:id/nodes/:nodeId/status', async (req, res) => {
  try {
    const { status, user_id } = req.body;
    const node = await WorkflowNode.findById(req.params.nodeId);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    const oldStatus = node.status;
    let newStatus = status;

    if (node.completion_rule === 'ALL' && user_id && status === 'DONE') {
      node.completed_by.set(user_id, new Date());
      let allDone = true;
      for (const assignedUser of node.assigned_to) {
        if (!node.completed_by.has(assignedUser)) {
          allDone = false;
          break;
        }
      }
      if (allDone) {
        newStatus = 'DONE';
      } else {
        newStatus = oldStatus; // Wait for others
      }
    } else {
      // ANY or single user
    }

    node.status = newStatus;
    await node.save();

    if (oldStatus !== newStatus) {
      await cascadeStatus(req.params.id, req.params.nodeId, newStatus, oldStatus);
      await syncTaskCompletion(node);
    }

    res.json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Full DAG Fetch
router.get('/:id/dag', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    const nodes = await WorkflowNode.find({ workflow_id: req.params.id }).lean();
    const edges = await WorkflowEdge.find({ workflow_id: req.params.id }).lean();

    // Hydrate nodes with source data
    for (let node of nodes) {
      if (node.source_type === 'TASK') {
        node.source_data = await Task.findById(node.source_id).lean();
      } else if (node.source_type === 'IDEA') {
        node.source_data = await Idea.findById(node.source_id).lean();
      }
    }

    res.json({ workflow, nodes, edges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Validate
router.get('/:id/validate', async (req, res) => {
  try {
    const nodes = await WorkflowNode.find({ workflow_id: req.params.id });
    const edges = await WorkflowEdge.find({ workflow_id: req.params.id });
    
    let warnings = [];

    // Timeline conflicts
    for (const edge of edges) {
      const parent = nodes.find(n => n._id.toString() === edge.from_node_id.toString());
      const child = nodes.find(n => n._id.toString() === edge.to_node_id.toString());

      if (parent && child && parent.due_date && child.due_date) {
        if (new Date(child.due_date) < new Date(parent.due_date)) {
          warnings.push({
            type: 'TIMELINE_CONFLICT',
            node_id: child._id,
            message: `Node '${child._id}' is blocked by '${parent._id}'. Child is due before parent.`,
            conflict_nodes: [child._id, parent._id]
          });
        }
      }
    }

    res.json({ valid: warnings.length === 0, warnings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
