require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const ollamaRoutes = require('../routes/ollama.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/ollama', ollamaRoutes);

app.get('/api/ollama/health', (req, res) => res.json({ status: 'ok', fn: 'ollama' }));

module.exports = app;