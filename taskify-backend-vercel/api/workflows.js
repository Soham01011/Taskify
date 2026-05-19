require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const workflowRoutes = require('../routes/workflows');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/workflows', workflowRoutes);

app.get('/api/workflows/health', (req, res) => res.json({ status: 'ok', fn: 'workflows' }));

module.exports = app;
