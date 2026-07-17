const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 5 }, // minutes
  },
  { _id: true }
);

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        default: [85.324, 27.7172], // Kathmandu default
      },
    },
    latitude: { type: Number, default: 27.7172 },
    longitude: { type: Number, default: 85.324 },
    services: [serviceSchema],
    facilities: [{ type: String }],
    images: [{ type: String }],
    coverImage: { type: String, default: '' },
    workingHours: {
      monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '17:00' }, closed: { type: Boolean, default: false } },
      sunday: { open: { type: String, default: '10:00' }, close: { type: String, default: '16:00' }, closed: { type: Boolean, default: true } },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    billingDetails: {
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    is_featured: { type: Boolean, default: false },
    promotion: {
      tier: { type: String, enum: ['none', 'silver', 'gold', 'platinum'], default: 'none' },
      expiresAt: { type: Date, default: null },
      priority: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

businessSchema.index({ location: '2dsphere' });
businessSchema.index({ name: 'text', description: 'text', city: 'text', address: 'text' });

module.exports = mongoose.model('Business', businessSchema);
