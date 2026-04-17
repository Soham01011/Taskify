require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const geminiRoutes = require('../routes/gemini');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/gemini', geminiRoutes);

app.get('/api/gemini/health', (req, res) => res.json({ status: 'ok', fn: 'gemini' }));

module.exports = app;
