require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const usersRouter = require('./routes/users');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.warn('Warning: MONGO_URI is not set. Please create server/.env with MONGO_URI.');
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    // don't exit so developer can see the message and fix .env
  }

  app.get('/', (req, res) => res.json({ ok: true, msg: 'e-Raksha-Setu server' }));
  app.use('/api/users', usersRouter);

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

start();
