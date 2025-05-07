// src/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, verifyToken, refreshToken, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyToken);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;
