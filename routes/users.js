const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Distance = require('../models/Distance');
const { io } = require('../server');
const { USER_CREDIT_UPDATE } = require('../types/eventTyeps');

// Read Users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// Update User
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
  res.send(updatedUser);
});

module.exports = router;
