const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Business = require('../models/Business');

const createBooking = async (req, res) => {
  try {
    const { businessId, slotId, service, notes } = req.body;

    if (!businessId || !slotId || !service?.name) {
      return res.status(400).json({ message: 'Invalid booking details. Business, slot and service are required.' });
    }

    const business = await Business.findById(businessId);
    if (!business || business.status !== 'approved') {
      return res.status(400).json({ message: 'Business is not available for booking.' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot || String(slot.business) !== String(businessId)) {
      return res.status(400).json({ message: 'Invalid time slot.' });
    }
    if (slot.isBooked || !slot.isActive) {
      return res.status(400).json({ message: 'This slot is no longer available.' });
    }

    // Match service from business catalog when possible
    const matched = business.services.find(
      (s) => s.name.toLowerCase() === String(service.name).toLowerCase()
    );
    const serviceData = {
      name: matched?.name || service.name,
      price: matched?.price ?? Number(service.price) ?? 0,
      duration: matched?.duration ?? Number(service.duration) ?? 30,
    };

    const booking = await Booking.create({
      user: req.user._id,
      business: businessId,
      slot: slotId,
      service: serviceData,
      notes: notes || '',
      status: 'pending',
    });

    slot.isBooked = true;
    await slot.save();

    const populated = await Booking.findById(booking._id)
      .populate('business', 'name address city phone')
      .populate('slot')
      .populate('user', 'name email phone');

    res.status(201).json({
      message: 'Booking request submitted successfully',
      booking: populated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Booking failed' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('business', 'name address city phone coverImage images')
      .populate('slot')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking cannot be cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    res.json({ message: 'Booking canceled successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const filter = { business: business._id };
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('slot')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const respondToBooking = async (req, res) => {
  try {
    const { status, ownerNote } = req.body;
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted, rejected, or completed.' });
    }

    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const booking = await Booking.findOne({ _id: req.params.id, business: business._id })
      .populate('user', 'name email phone')
      .populate('slot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (status === 'accepted' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be accepted.' });
    }
    if (status === 'rejected' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be rejected.' });
    }

    booking.status = status;
    if (ownerNote !== undefined) booking.ownerNote = ownerNote;
    await booking.save();

    if (status === 'rejected') {
      const slot = await Slot.findById(booking.slot._id || booking.slot);
      if (slot) {
        slot.isBooked = false;
        await slot.save();
      }
    }

    const msg =
      status === 'accepted'
        ? 'Booking request accepted successfully'
        : status === 'rejected'
          ? 'Booking request rejected successfully'
          : 'Booking marked as completed';

    res.json({ message: msg, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getOwnerBookings,
  respondToBooking,
};
