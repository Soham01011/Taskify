/**
 * lib/db.js — Shared MongoDB connection pooling for Vercel Serverless Functions
 *
 * Strategy:
 *  - Each Vercel function is a separate Lambda, so they cannot share a single
 *    process-level connection across function boundaries at runtime.
 *  - HOWEVER, within a single warm Lambda invocation, the Node.js module cache
 *    persists between requests. We exploit this by caching the Mongoose
 *    connection promise in the module-level `_connectionPromise` variable.
 *  - This means a warm Lambda (i.e. one that has already handled at least one
 *    request) will reuse its established connection instead of reconnecting,
 *    which is exactly the behaviour you want for pooling.
 *  - Mongoose's default pool size is 5. We reduce it to 3 (`maxPoolSize: 3`)
 *    so that if multiple Lambda instances spin up concurrently (e.g. during a
 *    traffic spike), we stay within MongoDB Atlas's free-tier connection limit
 *    of 500 even with dozens of concurrent containers.
 *  - `minPoolSize: 1` keeps at least one idle connection alive during a warm
 *    Lambda's lifetime so the next request doesn't pay the TCP handshake cost.
 *  - `serverSelectionTimeoutMS` is set low (5 s) so a cold-start failure fails
 *    fast rather than hanging until the Lambda's own timeout.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Taskify';

const MONGOOSE_OPTS = {
  maxPoolSize: 3,       // cap per-Lambda connection pool
  minPoolSize: 1,       // keep 1 connection alive in a warm Lambda
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Module-level cache — survives across requests in a warm Lambda
let _connectionPromise = null;

/**
 * connectDB()
 *
 * Returns a promise that resolves once Mongoose is connected.
 * Calling it multiple times from the same warm Lambda is safe — it returns the
 * cached promise and never opens a second connection.
 */
const connectDB = () => {
  // Already connected (warm Lambda, connection is live)
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  // Connection is in progress (concurrent requests on a cold-starting Lambda)
  if (_connectionPromise) {
    return _connectionPromise;
  }

  // First request on a cold Lambda — initiate connection
  _connectionPromise = mongoose
    .connect(MONGO_URI, MONGOOSE_OPTS)
    .then(() => {
      console.log('[db] MongoDB connected');
    })
    .catch((err) => {
      // Clear the cached promise so the next request can retry
      _connectionPromise = null;
      console.error('[db] MongoDB connection error:', err);
      throw err;
    });

  return _connectionPromise;
};

/**
 * withDB(handler)
 *
 * Express-compatible middleware factory.
 * Wraps a route handler to guarantee the DB is connected before it runs.
 *
 * Usage (in an api/*.js entry-point):
 *   app.use(withDB);
 */
const withDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database unavailable', detail: err.message });
  }
};

module.exports = { connectDB, withDB };
