const express = require('express');
const Activity = require('../models/Activity');
const { verifyJwtToken } = require('../middleware/auth');

const router = express.Router();

// All activity routes require valid JWT
router.use(verifyJwtToken);

// GET /api/v1/activities — Fetch activity log
router.get('/', async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Agent') {
      // Agent only sees their own activity
      query = { user: req.user.id };
    } else if (req.user.role === 'Manager') {
      // Manager sees their own AND all Agent activities
      const User = require('../models/User');
      const agents = await User.find({ role: 'Agent' }).select('_id');
      const agentIds = agents.map(a => a._id);
      query = { user: { $in: [req.user.id, ...agentIds] } };
    } else {
      // Admin sees everything
      query = {};
    }

    const activities = await Activity.find(query)
      .populate('user', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/v1/activities — Clear activity logs (Admin clears all, others clear own)
router.delete('/', async (req, res) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { user: req.user.id };
    const result = await Activity.deleteMany(query);
    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
