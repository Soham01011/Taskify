const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Add or Update Push Token
router.patch('/me/push-token', auth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    
    // Validate push token if provided
    if (pushToken && !pushToken.startsWith('ExponentPushToken')) {
      return res.status(400).json({ error: 'Invalid Expo Push Token' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (pushToken) {
      if (!user.pushTokens.includes(pushToken)) {
        user.pushTokens.push(pushToken);
        await user.save();
      }
    }

    res.json({ message: 'Push token registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
