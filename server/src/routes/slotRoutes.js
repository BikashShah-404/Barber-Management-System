const express = require('express');
const {
  createSlot,
  createBulkSlots,
  getMySlots,
  getBusinessSlots,
  updateSlot,
  deleteSlot,
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/business/:businessId', getBusinessSlots);
router.get('/mine', protect, authorize('barber'), getMySlots);
router.post('/', protect, authorize('barber'), createSlot);
router.post('/bulk', protect, authorize('barber'), createBulkSlots);
router.put('/:id', protect, authorize('barber'), updateSlot);
router.delete('/:id', protect, authorize('barber'), deleteSlot);

module.exports = router;
