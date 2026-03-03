const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '5h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const REFRESH_THRESHOLD = 2 * 24 * 60 * 60; // 2 days in seconds

const generateTokens = (userId, existingRefreshToken = null) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  let refreshToken = existingRefreshToken;
  if (!refreshToken) {
    refreshToken = jwt.sign({ userId, tokenId: uuidv4() }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  }
  return { accessToken, refreshToken, userId };
};

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ userId: user._id, username: user.username });
  } catch (error) {
    console.log(error); 
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let tokens;
    let reuseRefreshToken = false;

    if (user.refreshToken) {
      try {
        const decoded = jwt.verify(user.refreshToken, JWT_SECRET);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = decoded.exp - currentTime;

        // If more than 2 days remain, reuse the token
        if (timeRemaining > REFRESH_THRESHOLD) {
          reuseRefreshToken = true;
          tokens = generateTokens(user._id, user.refreshToken);
        }
      } catch {
        // Token is invalid or expired, continue to generate new one
      }
    }

    if (!reuseRefreshToken) {
      tokens = generateTokens(user._id);
      user.refreshToken = tokens.refreshToken;
      await user.save();
    }
    tokens.finalUsername = user.username;
    res.json(tokens);
  } catch (error) {
    console.log("Login error :", JSON.stringify(error));
    res.status(400).json({ error: error.message });
  }
});

router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    jwt.verify(token, JWT_SECRET);
    res.json({ valid: true });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log("error name : ", error.name);
      return res.status(401).json({ valid: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decoded.exp - currentTime;

    let tokens;
    if (timeRemaining < REFRESH_THRESHOLD) {
      // Rotation: generate new refresh token
      tokens = generateTokens(user._id);
      user.refreshToken = tokens.refreshToken;
      await user.save();
    } else {
      // No rotation: reuse existing refresh token
      tokens = generateTokens(user._id, refreshToken);
    }

    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Refresh failed' });
  }
});

module.exports = router;
