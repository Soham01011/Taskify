const express = require('express');
const router = express.Router();
const Idea = require('../models/idea');
const verifyToken = require('../middleware/auth');

// ─── Idea CRUD ────────────────────────────────────────────────────────────────

// POST /ideas — Create a new idea
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.userId;

    const idea = new Idea({ userId, title, description });
    await idea.save();

    res.status(201).json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /ideas — Get all ideas for the authenticated user (with optional pagination & timestamp filter)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { pageNumber, pageSize, created_at } = req.query;

    let query = { userId };

    // Only return ideas created after a given timestamp (for incremental sync)
    if (created_at) {
      const filterDate = new Date(created_at);
      if (!isNaN(filterDate.getTime())) {
        query.created_at = { $gt: filterDate };
      }
    }

    let ideasQuery = Idea.find(query).sort({ created_at: -1 });

    if (pageNumber && pageSize) {
      const pageNum = parseInt(pageNumber);
      const sizeLimit = parseInt(pageSize);
      const skip = (pageNum - 1) * sizeLimit;

      const ideas = await ideasQuery.skip(skip).limit(sizeLimit);
      const totalIdeas = await Idea.countDocuments(query);

      return res.json({
        ideas,
        pagination: {
          totalIdeas,
          currentPage: pageNum,
          pageSize: sizeLimit,
          totalPages: Math.ceil(totalIdeas / sizeLimit),
        },
      });
    }

    const ideas = await ideasQuery;
    res.json(ideas);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /ideas/:id — Get a single idea by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const idea = await Idea.findOne({ _id: req.params.id, userId });
    if (!idea) return res.status(404).json({ error: 'Idea not found or not owned by user' });
    res.json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /ideas/:id — Update an idea's title or description
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description } = req.body;

    const idea = await Idea.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title, description },
      { new: true, runValidators: true }
    );
    if (!idea) return res.status(404).json({ error: 'Idea not found or not owned by user' });
    res.json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /ideas/:id — Delete an idea and all its thread entries
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, userId });
    if (!idea) return res.status(404).json({ error: 'Idea not found or not owned by user' });
    res.json({ message: 'Idea deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Thread Entry Sub-resource ────────────────────────────────────────────────

// POST /ideas/:id/thread — Add a new thread entry (quick note / progress update)
router.post('/:id/thread', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Thread entry content is required' });
    }

    const idea = await Idea.findOne({ _id: req.params.id, userId });
    if (!idea) return res.status(404).json({ error: 'Idea not found or not owned by user' });

    // Initialize thread array if this is the first entry
    if (!idea.thread) idea.thread = [];
    idea.thread.push({ content: content.trim() });
    await idea.save();

    res.status(201).json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /ideas/:id/thread/:entryId — Edit a specific thread entry
router.put('/:id/thread/:entryId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Thread entry content is required' });
    }

    const idea = await Idea.findOne({ _id: req.params.id, userId });
    if (!idea) return res.status(404).json({ error: 'Idea not found or not owned by user' });

    const entry = idea.thread && idea.thread.id(req.params.entryId);
    if (!entry) return res.status(404).json({ error: 'Thread entry not found' });

    entry.content = content.trim();
    await idea.save();

    res.json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /ideas/:id/thread/:entryId — Remove a specific thread entry
router.delete('/:id/thread/:entryId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const idea = await Idea.findOne({ _id: req.params.id, userId });
    if (!idea) return res.status(404).json({ error: 'Idea not found or not owned by user' });

    const entry = idea.thread && idea.thread.id(req.params.entryId);
    if (!entry) return res.status(404).json({ error: 'Thread entry not found' });

    idea.thread.pull(req.params.entryId);
    await idea.save();

    res.json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
