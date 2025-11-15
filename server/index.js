require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configure CORS to allow Expo app connections
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost, 127.0.0.1, or local network IPs (10.x.x.x, 192.168.x.x)
    const allowedOrigins = [
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^exp:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/, // Expo development URLs
      /^exp:\/\/192\.168\.\d+\.\d+(:\d+)?$/
    ];
    
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // For development, allow all origins
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const usersRouter = require('./routes/users');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.warn('Warning: MONGO_URI is not set. Please create server/.env with MONGO_URI.');
}

async function start() {
  try {
    // Remove deprecated options - Mongoose 6+ handles these automatically
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB successfully');
    console.log('✓ Database:', mongoose.connection.db.databaseName);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    console.error('Please check your MONGO_URI in server/.env file');
    // Exit if MongoDB connection fails - can't register users without DB
    process.exit(1);
  }

  // MongoDB connection event listeners
  mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  app.get('/', (req, res) => {
    res.json({ 
      ok: true, 
      msg: 'e-Raksha-Setu Server', 
      version: '1.0.0',
      status: 'running',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      endpoints: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        getUser: 'GET /api/users/:address',
        listUsers: 'GET /api/users'
      },
      timestamp: new Date().toISOString()
    });
  });

  // Test endpoint for Expo app to verify connection
  app.get('/api/test', (req, res) => {
    console.log('✓ Test connection received from:', req.ip);
    res.json({
      ok: true,
      message: 'Connection successful!',
      server: 'e-Raksha-Setu',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      clientIp: req.ip,
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/users', usersRouter);

  const server = app.listen(PORT, () => {
    console.log(`✓ Server listening on port ${PORT}`);
    console.log(`✓ Server URL: http://localhost:${PORT}`);
    console.log(`✓ Press Ctrl+C to stop the server`);
  });

  // Handle port already in use error
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
      console.error(`\n💡 Solutions:`);
      console.error(`   1. Stop the other server using port ${PORT}`);
      console.error(`   2. Run this command to kill the process:`);
      console.error(`      Windows: netstat -ano | findstr :${PORT}  (then: taskkill /PID <PID> /F)`);
      console.error(`      Mac/Linux: lsof -ti:${PORT} | xargs kill -9`);
      console.error(`   3. Or change the PORT in your .env file\n`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down gracefully...');
    server.close(async () => {
      console.log('✓ Server closed');
      try {
        await mongoose.connection.close();
        console.log('✓ MongoDB connection closed');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB:', err);
        process.exit(1);
      }
    });
  });
}

start();
