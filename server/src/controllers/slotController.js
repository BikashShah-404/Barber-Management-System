const Slot = require('../models/Slot');
const Business = require('../models/Business');

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
};

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

    res.status(201).json({ message: 'Time slot created successfully', slot });
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

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    const interval = Number(intervalMinutes) || 30;

    if (start >= end || interval < 5) {
      return res.status(400).json({ message: 'Invalid time slot range or interval.' });
    }

    // Check for overlapping existing slots
    const existingSlots = await Slot.find({
      business: business._id,
      date,
      isActive: true,
    });

    const slots = [];
    for (let t = start; t + interval <= end; t += interval) {
      const slotStart = toTime(t);
      const slotEnd = toTime(t + interval);

      const overlaps = existingSlots.some((existing) => {
        const exStart = toMinutes(existing.startTime);
        const exEnd = toMinutes(existing.endTime);
        return t < exEnd && t + interval > exStart;
      });

      if (!overlaps) {
        slots.push({
          business: business._id,
          date,
          startTime: slotStart,
          endTime: slotEnd,
        });
      }
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
      message: 'Time slots created successfully',
      count: created.length,
      skipped: slots.length - created.length,
      slots: created,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createRecurringSlots = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const { startDate, endDate, days, startTime, endTime, intervalMinutes = 15 } = req.body;
    if (!startDate || !endDate || !days?.length || !startTime || !endTime) {
      return res.status(400).json({
        message: 'startDate, endDate, days (array), startTime and endTime are required.',
      });
    }

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    const interval = Number(intervalMinutes) || 15;

    if (start >= end || interval < 5) {
      return res.status(400).json({ message: 'Invalid time range or interval.' });
    }

    const dayMap = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6,
    };
    const targetDays = days.map((d) => dayMap[d.toLowerCase()]).filter((d) => d !== undefined);

    if (!targetDays.length) {
      return res.status(400).json({ message: 'No valid days provided.' });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (eDate < sDate) {
      return res.status(400).json({ message: 'endDate must be after startDate.' });
    }

    let totalCreated = 0;
    let totalDeleted = 0;
    const createdDates = [];

    for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
      if (!targetDays.includes(d.getDay())) continue;

      const dateStr = d.toISOString().slice(0, 10);

      // Delete all existing unbooked slots in the target time range for this date
      const deleteResult = await Slot.deleteMany({
        business: business._id,
        date: dateStr,
        isBooked: false,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      });
      totalDeleted += deleteResult.deletedCount || 0;

      // Create fresh slots
      let dayCreated = 0;
      for (let t = start; t + interval <= end; t += interval) {
        try {
          await Slot.create({
            business: business._id,
            date: dateStr,
            startTime: toTime(t),
            endTime: toTime(t + interval),
          });
          dayCreated++;
          totalCreated++;
        } catch {
          // skip duplicate
        }
      }

      if (dayCreated > 0) {
        createdDates.push({ date: dateStr, count: dayCreated });
      }
    }

    res.status(201).json({
      message: 'Recurring slots created successfully',
      totalCreated,
      totalDeleted,
      dates: createdDates,
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

const getSlotWindows = async (req, res) => {
  try {
    const { businessId, date, duration } = req.query;
    if (!businessId || !date || !duration) {
      return res.status(400).json({ message: 'businessId, date and duration are required.' });
    }

    const durationMins = Number(duration);
    if (!durationMins || durationMins < 5) {
      return res.status(400).json({ message: 'Invalid duration.' });
    }

    const slots = await Slot.find({
      business: businessId,
      date,
      isActive: true,
      isBooked: false,
    }).sort({ startTime: 1 });

    if (slots.length === 0) {
      return res.json({ windows: [] });
    }

    // Group consecutive slots into windows matching the service duration
    const windows = [];
    for (let i = 0; i < slots.length; i++) {
      let totalMinutes = 0;
      const windowSlots = [];

      for (let j = i; j < slots.length; j++) {
        const slotStart = toMinutes(slots[j].startTime);
        const slotEnd = toMinutes(slots[j].endTime);

        // Check this slot is contiguous with previous
        if (windowSlots.length > 0) {
          const prevEnd = toMinutes(slots[j - 1].endTime);
          if (slotStart !== prevEnd) break; // gap — start fresh
        }

        totalMinutes += slotEnd - slotStart;
        windowSlots.push(slots[j]);

        if (totalMinutes >= durationMins) {
          windows.push({
            startTime: windowSlots[0].startTime,
            endTime: windowSlots[windowSlots.length - 1].endTime,
            duration: totalMinutes,
            slotIds: windowSlots.map((s) => s._id),
          });
          break;
        }
      }
    }

    res.json({ windows });
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
    res.json({ message: 'Time slot updated successfully', slot });
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

const cleanupPastSlots = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const today = new Date().toISOString().slice(0, 10);
    const result = await Slot.deleteMany({
      business: business._id,
      date: { $lt: today },
      isBooked: false,
    });

    res.json({
      message: 'Past slots cleaned up successfully',
      deleted: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSlotsByDate = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const { date } = req.params;
    const result = await Slot.deleteMany({
      business: business._id,
      date,
      isBooked: false,
    });

    res.json({
      message: `Deleted ${result.deletedCount} slots for ${date}`,
      deleted: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSlotsByRange = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const { startDate, endDate, startTime, endTime } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required.' });
    }

    const filter = {
      business: business._id,
      date: { $gte: startDate, $lte: endDate },
      isBooked: false,
    };
    if (startTime) filter.startTime = { $gte: startTime };
    if (endTime) filter.endTime = { $lte: endTime };

    const result = await Slot.deleteMany(filter);
    res.json({
      message: `Deleted ${result.deletedCount} slots`,
      deleted: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAllSlots = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const result = await Slot.deleteMany({
      business: business._id,
      isBooked: false,
    });

    res.json({
      message: `Deleted all ${result.deletedCount} unbooked slots`,
      deleted: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSlotStats = async (req, res) => {
  try {
    const business = await ensureOwnerBusiness(req.user._id);
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const total = await Slot.countDocuments({ business: business._id });
    const totalUnbooked = await Slot.countDocuments({ business: business._id, isBooked: false });
    const totalBooked = await Slot.countDocuments({ business: business._id, isBooked: true });

    const today = new Date().toISOString().slice(0, 10);
    const todaySlots = await Slot.countDocuments({ business: business._id, date: today });
    const todayBooked = await Slot.countDocuments({ business: business._id, date: today, isBooked: true });

    const dateRanges = await Slot.aggregate([
      { $match: { business: business._id } },
      { $group: { _id: null, minDate: { $min: '$date' }, maxDate: { $max: '$date' } } },
    ]);

    res.json({
      total,
      totalUnbooked,
      totalBooked,
      todaySlots,
      todayBooked,
      dateRange: dateRanges[0] ? { from: dateRanges[0].minDate, to: dateRanges[0].maxDate } : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSlot,
  createBulkSlots,
  createRecurringSlots,
  getMySlots,
  getBusinessSlots,
  getSlotWindows,
  updateSlot,
  deleteSlot,
  cleanupPastSlots,
  deleteSlotsByDate,
  deleteSlotsByRange,
  deleteAllSlots,
  getSlotStats,
};
