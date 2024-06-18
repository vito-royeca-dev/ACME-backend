const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { check, validationResult } = require('express-validator');
// const { v4: uuidv4 } = require('uuid');

let users = []; // In-memory storage for demonstration purposes
const admin = {
    username: "admin",
    password: "admin",
}
// Register admin
// router.post('/register', [
//   check('username', 'Please include a valid username').notEmpty(),
//   check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { username, password } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = { id: uuidv4(), username, password: hashedPassword };
//     users.push(newUser);
//     res.status(201).json({ message: 'User registered successfully', user: newUser });
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// Login admin
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
//   const user = users.find(u => u.username === username);

//   if (!user) {
//     return res.status(400).json({ message: 'User not found' });
//   }

//   try {
//     if (await bcrypt.compare(password, user.password)) {
//       const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
//       res.json({ message: 'Login successful', accessToken });
//     } else {
//       res.status(401).json({ message: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
  try {
    if (username === admin.username && password === admin.password) {
      const accessToken = jwt.sign({ username: username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', accessToken });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
