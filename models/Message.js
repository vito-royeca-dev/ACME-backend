const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  title: String,
  body: String, // Optional field for a message
  credits: {
    type: Number,
    default: 0 // Assuming credits start from 0
  }
});

module.exports = mongoose.model('Message', messageSchema);
