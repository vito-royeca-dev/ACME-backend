const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  credits: { type: Number, default: 0 },
  location: { type: locationSchema, default: () => ({}) }
});

module.exports = mongoose.model('User', userSchema);