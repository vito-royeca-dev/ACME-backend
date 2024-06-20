const mongoose = require('mongoose');

const distanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  distance: { type: Number, required: true }
});

module.exports = mongoose.model('Distance', distanceSchema);
