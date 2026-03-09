require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const taskRoutes = require('../routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/tasks', taskRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', fn: 'tasks' }));

module.exports = app;
