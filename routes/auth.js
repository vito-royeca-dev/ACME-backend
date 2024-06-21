const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Assuming you have a User model

// Define OAuth clients for each platform
const clients = {
  ios: new OAuth2Client(process.env.IOS_GOOGLE_CLIENT_ID),
  android: new OAuth2Client(process.env.ANDROID_GOOGLE_CLIENT_ID),
};

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;
    // Check if user exists in database
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = new User({ email, name });
      await user.save();
    }
    // Generate JWT token
    const token = generateJwtToken(user);
    const id = user._id;
    // Return token to client
    console.log(id);
    res.json({ token, id });
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ message: 'Google OAuth error' });
  }
});

function generateJwtToken(user) {
  // Example of using JWT for authentication, you may use a library like jsonwebtoken
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = router;
