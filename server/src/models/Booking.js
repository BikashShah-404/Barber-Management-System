const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    slots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true,
      },
    ],
    service: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      duration: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
    ownerNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
