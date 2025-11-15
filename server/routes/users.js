const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users/register
// body: { address, name, username, password, encryptedPrivateKey }
router.post('/register', async (req, res) => {
  try {
    const { address, name, username, password, encryptedPrivateKey } = req.body;
    if (!address || !name || !username || !password) {
      return res.status(400).json({ error: 'address, name, username, and password are required' });
    }

    const normalizedAddress = address.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(409).json({ error: 'username_taken', message: 'Username already exists' });
    }
    
    // Check if address already exists
    let user = await User.findOne({ address: normalizedAddress });
    
    if (user) {
      // Update existing user
      user.name = name;
      user.username = normalizedUsername;
      user.password = password; // In production, hash this password!
      user.encryptedPrivateKey = encryptedPrivateKey || user.encryptedPrivateKey;
      user.registered = true;
      user.lastSeen = new Date();
      await user.save();
      console.log('✓ Updated existing user:', normalizedUsername);
      return res.json({ ok: true, user, message: 'User updated successfully' });
    } else {
      // Create new user
      user = new User({
        address: normalizedAddress,
        name,
        username: normalizedUsername,
        password, // In production, hash this password!
        encryptedPrivateKey: encryptedPrivateKey || undefined,
        registered: true,
        lastSeen: new Date()
      });
      await user.save();
      console.log('✓ Created new user:', normalizedUsername);
      return res.json({ ok: true, user, message: 'User registered successfully' });
    }
  } catch (err) {
    console.error('❌ Error registering user:', err);
    return res.status(500).json({ error: 'internal_server_error', details: err.message });
  }
});

// POST /api/users/login
// body: { username, password }
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const normalizedUsername = username.toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });
    
    if (!user) {
      return res.status(404).json({ error: 'user_not_found', message: 'Invalid username or password' });
    }

    // Verify password (in production, use bcrypt.compare())
    if (user.password !== password) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid username or password' });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    console.log('✓ User logged in:', normalizedUsername);
    return res.json({ 
      ok: true, 
      user,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('❌ Error logging in user:', err);
    return res.status(500).json({ error: 'internal_server_error', details: err.message });
  }
});

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ ok: true, users });
  } catch (err) {
    console.error('Error listing users', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
});

// GET /api/users/:address
router.get('/:address', async (req, res) => {
  try {
    const addr = req.params.address.toLowerCase();
    const user = await User.findOne({ address: addr });
    if (!user) return res.status(404).json({ error: 'not_found' });
    return res.json({ ok: true, user });
  } catch (err) {
    console.error('Error fetching user', err);
    return res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
