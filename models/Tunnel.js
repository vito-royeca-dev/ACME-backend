const mongoose = require('mongoose');

const tunnelSchema = new mongoose.Schema({
  startLat: {
    type: Number,
    required: true // Assuming start latitude is mandatory
  },
  startLng: {
    type: Number,
    required: true // Assuming start longitude is mandatory
  },
  endLat: {
    type: Number,
    required: true // Assuming end latitude is mandatory
  },
  endLng: {
    type: Number,
    required: true // Assuming end longitude is mandatory
  },
  color: String, // Optional field for color
  opacity: {
    type: Number,
    default: 1 // Assuming default opacity is 1 (fully opaque)
  },
  message: String, // Optional field for a message
  visible: {
    type: Boolean,
    default: true // Assuming tunnel is visible by default
  },
  credits: {
    type: Number,
    default: 0 // Assuming credits start from 0
  }
});

module.exports = mongoose.model('Tunnel', tunnelSchema);
