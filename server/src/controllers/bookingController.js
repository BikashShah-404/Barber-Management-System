const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Business = require('../models/Business');

const createBooking = async (req, res) => {
  try {
    const { businessId, slotIds, service, notes } = req.body;

    if (!businessId || !slotIds?.length || !service?.name) {
      return res.status(400).json({
        message: 'Invalid booking details. Business, slotIds (array) and service are required.',
      });
    }

    const business = await Business.findById(businessId);
    if (!business || business.status !== 'approved') {
      return res.status(400).json({ message: 'Business is not available for booking.' });
    }

    // Validate booking time window — at least 30 minutes in advance
    const firstSlot = await Slot.findById(slotIds[0]);
    if (!firstSlot) {
      return res.status(400).json({ message: 'Invalid time slot.' });
    }
    const slotDateTime = new Date(`${firstSlot.date}T${firstSlot.startTime}:00`);
    const now = new Date();
    if (slotDateTime - now < 30 * 60 * 1000) {
      return res.status(400).json({
        message: 'Bookings must be at least 30 minutes in advance.',
      });
    }

    // Atomically reserve all slots — check isBooked=false and isActive=true
    const slotsToBook = await Slot.find({
      _id: { $in: slotIds },
      business: businessId,
      isBooked: false,
      isActive: true,
    });

    if (slotsToBook.length !== slotIds.length) {
      return res.status(400).json({
        message: 'One or more selected slots are no longer available.',
      });
    }

    // Verify slots are contiguous and on the same date
    const sorted = slotsToBook.sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].date !== sorted[i - 1].date) {
        return res.status(400).json({ message: 'Slots must be on the same date.' });
      }
      if (sorted[i].startTime !== sorted[i - 1].endTime) {
        return res.status(400).json({ message: 'Slots must be consecutive with no gaps.' });
      }
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

    // Atomic reservation — updateMany with conditions
    const updateResult = await Slot.updateMany(
      { _id: { $in: slotIds }, isBooked: false, isActive: true },
      { $set: { isBooked: true } }
    );

    if (updateResult.modifiedCount !== slotIds.length) {
      // Rollback — free any slots we did manage to reserve
      await Slot.updateMany(
        { _id: { $in: slotIds }, isBooked: true },
        { $set: { isBooked: false } }
      );
      return res.status(400).json({
        message: 'One or more slots were just booked by someone else. Please try again.',
      });
    }

    const booking = await Booking.create({
      user: req.user._id,
      business: businessId,
      slots: slotIds,
      service: serviceData,
      notes: notes || '',
      status: 'pending',
    });

    const populated = await Booking.findById(booking._id)
      .populate('business', 'name address city phone')
      .populate('slots')
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
      .populate('slots')
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

    // Free all reserved slots
    await Slot.updateMany(
      { _id: { $in: booking.slots } },
      { $set: { isBooked: false } }
    );

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
      .populate('slots')
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
      .populate('slots');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // State machine guards
    if (status === 'accepted' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be accepted.' });
    }
    if (status === 'rejected' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be rejected.' });
    }
    if (status === 'completed' && booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted bookings can be marked completed.' });
    }
    if (status === 'completed') {
      const now = new Date();
      const slotDate = booking.slots?.[0]?.date || booking.date;
      const slotTime = booking.slots?.[0]?.startTime || '00:00';
      const [h, m] = slotTime.split(':').map(Number);
      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(h, m, 0, 0);
      if (slotDateTime > now) {
        return res.status(400).json({ message: 'Cannot complete a future appointment.' });
      }
    }

    booking.status = status;
    if (ownerNote !== undefined) booking.ownerNote = ownerNote;
    await booking.save();

    // Free all slots on rejection
    if (status === 'rejected') {
      await Slot.updateMany(
        { _id: { $in: booking.slots.map((s) => s._id || s) } },
        { $set: { isBooked: false } }
      );
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
