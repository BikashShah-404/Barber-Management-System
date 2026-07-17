const express = require('express');
const {
  createBusiness,
  getMyBusiness,
  updateBusiness,
  deleteBusiness,
  getApprovedBusinesses,
  getFeaturedBusinesses,
  getBusinessById,
  nearestBusinesses,
  addService,
  updateService,
  deleteService,
  updateBilling,
} = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getApprovedBusinesses);
router.get('/featured', getFeaturedBusinesses);
router.get('/nearest', nearestBusinesses);
router.get('/mine', protect, authorize('barber'), getMyBusiness);
router.post('/', protect, authorize('barber'), upload.array('images', 5), createBusiness);
router.put('/mine', protect, authorize('barber'), upload.array('images', 5), updateBusiness);
router.delete('/mine', protect, authorize('barber'), deleteBusiness);
router.put('/billing', protect, authorize('barber'), updateBilling);
router.post('/services', protect, authorize('barber'), addService);
router.put('/services/:serviceId', protect, authorize('barber'), updateService);
router.delete('/services/:serviceId', protect, authorize('barber'), deleteService);
router.get('/:id', getBusinessById);

module.exports = router;
