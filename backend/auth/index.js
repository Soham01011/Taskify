const http = require('http');
const { StringDecoder } = require('string_decoder');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Configuration
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Taskify';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// MongoDB Schema
mongoose.connect(MONGO_URI).then(() => console.log('Connected to MongoDB'));

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  refreshToken: {
    type: String,
    default: null
  }
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

// Helper functions
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, tokenId: uuidv4() }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// Route handlers
const handleRegister = async (username, password) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const user = new User({ username, password });
  await user.save();
  return { userId: user._id, username: user.username };
};

const handleLogin = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};

const handleVerify = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return { valid: true, userId: decoded.userId, ...decoded };
};

const handleRefresh = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, JWT_SECRET);
  const user = await User.findById(decoded.userId);
  
  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token');
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};

// Server setup
const server = http.createServer((req, res) => {
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // Collect request body
  req.on('data', (data) => buffer += decoder.write(data));
  
  req.on('end', async () => {
    buffer += decoder.end();
    let payload = {};
    
    try {
      if (buffer) payload = JSON.parse(buffer);

      let response;
      const { pathname } = new URL(req.url, `http://${req.headers.host}`);

      if (pathname === '/api/auth/register' && req.method === 'POST') {
        response = await handleRegister(payload.username, payload.password);
      } 
      else if (pathname === '/api/auth/login' && req.method === 'POST') {
        response = await handleLogin(payload.username, payload.password);
      } 
      else if (pathname === '/api/auth/verify' && req.method === 'POST') {
        response = handleVerify(payload.token);
      } 
      else if (pathname === '/api/auth/refresh' && req.method === 'POST') {
        response = await handleRefresh(payload.refreshToken);
      } 
      else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Not Found' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log(`- POST http://localhost:${PORT}/api/auth/register`);
  console.log(`- POST http://localhost:${PORT}/api/auth/login`);
  console.log(`- POST http://localhost:${PORT}/api/auth/verify`);
  console.log(`- POST http://localhost:${PORT}/api/auth/refresh`);
});