require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const notificationRoutes = require('../routes/notifications');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', fn: 'notifications' }));

module.exports = app;
