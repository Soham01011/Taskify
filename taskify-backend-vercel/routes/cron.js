const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// ─── Cron auth middleware ──────────────────────────────────────────────────────
// Vercel cron jobs send: Authorization: Bearer <CRON_SECRET>
// Set CRON_SECRET in your Vercel environment variables.
function verifyCron(req, res, next) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // If CRON_SECRET is not configured, block all requests for safety
    return res.status(500).json({ error: 'CRON_SECRET is not configured on this server.' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// ─── Cleanup completed tasks older than 2 months ──────────────────────────────
// POST /api/cron/cleanup-tasks
// Triggered monthly by Vercel cron (see vercel.json).
// Deletes tasks where completed=true AND updated_at < 2 months ago.
router.post('/cleanup-tasks', verifyCron, async (req, res) => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const result = await Task.deleteMany({
      completed: true,
      updated_at: { $lt: twoMonthsAgo }
    });

    console.log(`[CRON cleanup-tasks] Deleted ${result.deletedCount} completed tasks older than 2 months.`);

    res.status(200).json({
      message: 'Cleanup complete.',
      deleted_count: result.deletedCount,
      cutoff_date: twoMonthsAgo.toISOString()
    });
  } catch (err) {
    console.error('[CRON cleanup-tasks] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
