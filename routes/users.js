const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

router.post('/updateCredits', async (req, res) => {
  const { id } = req.params;
  const credits = req.body.credits;
  const updatedUser = await User.findById(id);
  updatedUser.credits += credits;

  if (updatedUser.save()) {
    io.emit(USER_CREDIT_UPDATE, {
      data: updatedUser
    });

    res.status(200);
  }
});

module.exports = router;
