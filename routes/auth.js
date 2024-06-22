const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Assuming you have a User model

const clients = {
  ios: new OAuth2Client(process.env.IOS_GOOGLE_CLIENT_ID),
  android: new OAuth2Client(process.env.ANDROID_GOOGLE_CLIENT_ID),
};

router.post('/google', async (req, res) => {
  try {
    const { idToken, platform } = req.body;
    const ticket = await clients[platform].verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name });
      await user.save();
    }
    
    const token = generateJwtToken(user);
    const id = user._id;

    res.json({ token, id });
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ message: 'Google OAuth error' });
  }
});

function generateJwtToken(user) {
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
