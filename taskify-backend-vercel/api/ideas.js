require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const ideaRoutes = require('../routes/ideas');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/ideas', ideaRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', fn: 'ideas' }));

module.exports = app;
