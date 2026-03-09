require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const userRoutes = require('../routes/users');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', fn: 'users' }));

module.exports = app;
