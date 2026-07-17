const Slot = require('../models/Slot');
const Business = require('../models/Business');

const ensureOwnerBusiness = async (userId) => {
  const business = await Business.findOne({ owner: userId });
  return business;
};

const createSlot = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, startTime and endTime are required.' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'Invalid time slot: start must be before end.' });
    }

    const slot = await Slot.create({
      business: business._id,
      date,
      startTime,
      endTime,
    });

    res.status(201).json({ message: 'Time slots updated successfully', slot });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'This time slot already exists.' });
    }
    res.status(500).json({ message: err.message || 'Invalid time slot' });
  }
};

const createBulkSlots = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const { date, startTime, endTime, intervalMinutes = 30 } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, startTime and endTime are required.' });
    }

    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const toTime = (mins) => {
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      return `${h}:${m}`;
    };

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    const interval = Number(intervalMinutes) || 30;

    if (start >= end || interval < 5) {
      return res.status(400).json({ message: 'Invalid time slot range or interval.' });
    }

    const slots = [];
    for (let t = start; t + interval <= end; t += interval) {
      slots.push({
        business: business._id,
        date,
        startTime: toTime(t),
        endTime: toTime(t + interval),
      });
    }

    const created = [];
    for (const s of slots) {
      try {
        const slot = await Slot.create(s);
        created.push(slot);
      } catch {
        // skip duplicates
      }
    }

    res.status(201).json({
      message: 'Time slots updated successfully',
      count: created.length,
      slots: created,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMySlots = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const filter = { business: business._id };
    if (req.query.date) filter.date = req.query.date;

    const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 });
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBusinessSlots = async (req, res) => {
  try {
    const filter = {
      business: req.params.businessId,
      isActive: true,
      isBooked: false,
    };
    if (req.query.date) filter.date = req.query.date;
    // only future-ish dates by default when no date
    if (!req.query.date) {
      const today = new Date().toISOString().slice(0, 10);
      filter.date = { $gte: today };
    }

    const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 });
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSlot = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const slot = await Slot.findOne({ _id: req.params.id, business: business._id });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot edit a booked slot.' });
    }

    const { date, startTime, endTime, isActive } = req.body;
    if (date) slot.date = date;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (isActive !== undefined) slot.isActive = isActive;

    if (slot.startTime >= slot.endTime) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }

    await slot.save();
    res.json({ message: 'Time slots updated successfully', slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSlot = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const slot = await Slot.findOne({ _id: req.params.id, business: business._id });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a booked slot.' });
    }

    await slot.deleteOne();
    res.json({ message: 'Time slot removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSlot,
  createBulkSlots,
  getMySlots,
  getBusinessSlots,
  updateSlot,
  deleteSlot,
};
