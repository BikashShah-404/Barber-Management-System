const express = require('express');
const {
  getDashboard,
  getUsers,
  toggleUserActive,
  getBusinesses,
  reviewBusiness,
  getAllBookings,
  assignPromotion,
  removePromotion,
  getPromotedBusinesses,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserActive);
router.get('/businesses', getBusinesses);
router.put('/businesses/:id/review', reviewBusiness);
router.get('/bookings', getAllBookings);
router.get('/promotions', getPromotedBusinesses);
router.post('/promotions/:id/assign', assignPromotion);
router.delete('/promotions/:id/remove', removePromotion);

module.exports = router;
