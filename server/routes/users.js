const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/register
// body: { address, name, encryptedPrivateKey }
router.post('/register', async (req, res) => {
  try {
    const { address, name, encryptedPrivateKey } = req.body;
    if (!address || !name) return res.status(400).json({ error: 'address and name are required' });

    const filter = { address: address.toLowerCase() };
    const update = {
      address: address.toLowerCase(),
      name,
      encryptedPrivateKey: encryptedPrivateKey || undefined,
      registered: true,
      lastSeen: new Date()
    };

    const user = await User.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    return res.json({ ok: true, user });
  } catch (err) {
    console.error('Error registering user', err);
    return res.status(500).json({ error: 'internal_server_error' });
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
