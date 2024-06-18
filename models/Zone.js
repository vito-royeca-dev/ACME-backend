const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  centerLat: {
    type: Number,
    required: true // Assuming latitude is mandatory
  },
  centerLng: {
    type: Number,
    required: true // Assuming longitude is mandatory
  },
  radius: {
    type: String,
    required: true // Assuming radius is mandatory
  },
  color: String, // Optional field for color
  message: String, // Optional field for a message
  visible: {
    type: Boolean,
    default: true // Assuming it's true by default
  },
  credits: {
    type: Number,
    default: 0 // Assuming credits start from 0
  }
});

module.exports = mongoose.model('Zone', zoneSchema);
