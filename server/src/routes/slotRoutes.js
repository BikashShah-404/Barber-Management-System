const express = require('express');
const {
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
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/business/:businessId', getBusinessSlots);
router.get('/windows', getSlotWindows);
router.get('/mine', protect, authorize('barber'), getMySlots);
router.get('/stats', protect, authorize('barber'), getSlotStats);
router.post('/', protect, authorize('barber'), createSlot);
router.post('/bulk', protect, authorize('barber'), createBulkSlots);
router.post('/recurring', protect, authorize('barber'), createRecurringSlots);
router.put('/:id', protect, authorize('barber'), updateSlot);
router.delete('/cleanup', protect, authorize('barber'), cleanupPastSlots);
router.delete('/date/:date', protect, authorize('barber'), deleteSlotsByDate);
router.delete('/range', protect, authorize('barber'), deleteSlotsByRange);
router.delete('/all', protect, authorize('barber'), deleteAllSlots);
router.delete('/:id', protect, authorize('barber'), deleteSlot);

module.exports = router;
