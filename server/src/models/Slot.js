const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

slotSchema.index({ business: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
