const User = require('../models/User');
const Business = require('../models/Business');
const Booking = require('../models/Booking');

const getDashboard = async (_req, res) => {
  try {
    const [users, barbers, businesses, pending, approved, bookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'barber' }),
      Business.countDocuments(),
      Business.countDocuments({ status: 'pending' }),
      Business.countDocuments({ status: 'approved' }),
      Booking.countDocuments(),
    ]);

    res.json({
      stats: {
        users,
        barbers,
        businesses,
        pendingBusinesses: pending,
        approvedBusinesses: approved,
        bookings,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin accounts.' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      message: user.isActive ? 'User activated' : 'User deactivated',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBusinesses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const businesses = await Business.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ businesses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reviewBusiness = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const business = await Business.findById(req.params.id).populate('owner', 'name email');
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.status = status;
    business.rejectionReason = status === 'rejected' ? rejectionReason || 'Rejected by admin' : '';
    await business.save();

    res.json({
      message:
        status === 'approved'
          ? 'Business details approved successfully'
          : 'Business details rejected successfully',
      business,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('business', 'name')
      .populate('slot')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignPromotion = async (req, res) => {
  try {
    const { tier, expiresAt } = req.body;
    if (!['silver', 'gold', 'platinum'].includes(tier)) {
      return res.status(400).json({ message: 'Tier must be silver, gold, or platinum.' });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.promotion = {
      tier,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      priority: tier === 'platinum' ? 3 : tier === 'gold' ? 2 : 1,
    };
    await business.save();

    res.json({
      message: `Promotion ${tier} assigned successfully`,
      business,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removePromotion = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.promotion = { tier: 'none', expiresAt: null, priority: 0 };
    await business.save();

    res.json({
      message: 'Promotion removed successfully',
      business,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPromotedBusinesses = async (_req, res) => {
  try {
    const businesses = await Business.find({ 'promotion.tier': { $ne: 'none' } })
      .populate('owner', 'name email phone')
      .sort({ 'promotion.priority': -1 });
    res.json({ businesses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  toggleUserActive,
  getBusinesses,
  reviewBusiness,
  getAllBookings,
  assignPromotion,
  removePromotion,
  getPromotedBusinesses,
};
