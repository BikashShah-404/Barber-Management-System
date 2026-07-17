const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getOwnerBookings,
  respondToBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('user'), createBooking);
router.get('/mine', protect, authorize('user'), getMyBookings);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);
router.get('/owner', protect, authorize('barber'), getOwnerBookings);
router.put('/:id/respond', protect, authorize('barber'), respondToBooking);

module.exports = router;
