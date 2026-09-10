require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { withDB } = require('../lib/db');
const cronRoutes = require('../routes/cron');

const app = express();

app.use(cors());
app.use(express.json());

app.use(withDB);

app.use('/api/cron', cronRoutes);

module.exports = app;
