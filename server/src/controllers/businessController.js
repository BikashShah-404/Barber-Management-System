const Business = require('../models/Business');
const { haversineDistance } = require('../utils/haversine');
const { rankByCosine } = require('../utils/cosine');

const createBusiness = async (req, res) => {
  try {
    const existing = await Business.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a business profile. Update it instead.' });
    }

    const {
      name,
      description,
      address,
      city,
      phone,
      email,
      latitude,
      longitude,
      services,
      facilities,
      workingHours,
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Business name and address are required.' });
    }

    const lat = latitude !== undefined ? Number(latitude) : 27.7172;
    const lng = longitude !== undefined ? Number(longitude) : 85.324;

    let images = [];
    let coverImage = '';
    if (req.files && req.files.length) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
      coverImage = images[0];
    }

    let parsedServices = [];
    if (services) {
      parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
    }
    let parsedFacilities = [];
    if (facilities) {
      parsedFacilities = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;
    }
    let parsedHours = undefined;
    if (workingHours) {
      parsedHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
    }

    const business = await Business.create({
      owner: req.user._id,
      name,
      description: description || '',
      address,
      city: city || '',
      phone: phone || req.user.phone || '',
      email: email || req.user.email,
      latitude: lat,
      longitude: lng,
      location: { type: 'Point', coordinates: [lng, lat] },
      services: parsedServices,
      facilities: parsedFacilities,
      workingHours: parsedHours,
      images,
      coverImage,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Business details successfully added. Awaiting admin approval.',
      business,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create business' });
  }
};

const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id }).populate('owner', 'name email phone avatar');
    if (!business) {
      return res.status(404).json({ message: 'No business found for this account' });
    }
    res.json({ business });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const fields = [
      'name',
      'description',
      'address',
      'city',
      'phone',
      'email',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) business[f] = req.body[f];
    });

    if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
      const lat = Number(req.body.latitude ?? business.latitude);
      const lng = Number(req.body.longitude ?? business.longitude);
      business.latitude = lat;
      business.longitude = lng;
      business.location = { type: 'Point', coordinates: [lng, lat] };
    }

    if (req.body.services) {
      business.services =
        typeof req.body.services === 'string' ? JSON.parse(req.body.services) : req.body.services;
    }
    if (req.body.facilities) {
      business.facilities =
        typeof req.body.facilities === 'string' ? JSON.parse(req.body.facilities) : req.body.facilities;
    }
    if (req.body.workingHours) {
      business.workingHours =
        typeof req.body.workingHours === 'string'
          ? JSON.parse(req.body.workingHours)
          : req.body.workingHours;
    }
    if (req.body.billingDetails) {
      business.billingDetails =
        typeof req.body.billingDetails === 'string'
          ? JSON.parse(req.body.billingDetails)
          : req.body.billingDetails;
    }

    if (req.files && req.files.length) {
      const newImgs = req.files.map((f) => `/uploads/${f.filename}`);
      business.images = [...business.images, ...newImgs];
      if (!business.coverImage) business.coverImage = newImgs[0];
    }

    // Re-submit for approval if was rejected
    if (business.status === 'rejected') {
      business.status = 'pending';
      business.rejectionReason = '';
    }

    await business.save();
    res.json({ message: 'Business details updated successfully', business });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Update failed' });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findOneAndDelete({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found or unable to delete' });
    }
    res.json({ message: 'Business details deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getApprovedBusinesses = async (req, res) => {
  try {
    const { q, service, city } = req.query;
    const filter = { status: 'approved' };
    if (city) filter.city = new RegExp(city, 'i');

    let businesses = await Business.find(filter)
      .populate('owner', 'name email avatar')
      .lean();

    if (service) {
      const s = service.toLowerCase();
      businesses = businesses.filter((b) =>
        b.services.some((svc) => svc.name.toLowerCase().includes(s))
      );
    }

    if (q) {
      const docs = businesses.map(
        (b) =>
          `${b.name} ${b.description} ${b.city} ${b.address} ${b.services.map((s) => s.name).join(' ')} ${b.facilities.join(' ')}`
      );
      const ranked = rankByCosine(q, docs);
      businesses = ranked
        .filter((r) => r.score > 0 || q.trim() === '')
        .map((r) => ({ ...businesses[r.index], relevance: r.score }))
        .filter((b) => {
          if (!q.trim()) return true;
          const hay = `${b.name} ${b.description} ${b.city} ${b.address}`.toLowerCase();
          return b.relevance > 0 || hay.includes(q.toLowerCase());
        });
    }

    businesses.sort((a, b) => {
      const pa = a.promotion?.priority || 0;
      const pb = b.promotion?.priority || 0;
      if (pb !== pa) return pb - pa;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ count: businesses.length, businesses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFeaturedBusinesses = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 4, 12);
    const now = new Date();
    const businesses = await Business.find({
      status: 'approved',
      'promotion.tier': { $ne: 'none' },
      $or: [
        { 'promotion.expiresAt': null },
        { 'promotion.expiresAt': { $gt: now } },
      ],
    })
      .populate('owner', 'name email avatar')
      .sort({ 'promotion.priority': -1 })
      .limit(limit)
      .lean();
    res.json({ count: businesses.length, businesses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('owner', 'name email phone avatar');
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    if (business.status !== 'approved') {
      const isOwner = req.user && String(business.owner._id || business.owner) === String(req.user._id);
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: 'Business not found' });
      }
    }
    res.json({ business });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const nearestBusinesses = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const limit = Math.min(Number(req.query.limit) || 3, 20);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'Valid lat and lng query params are required.' });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Coordinates out of range.' });
    }

    const businesses = await Business.find({
      status: 'approved',
      latitude: { $exists: true },
      longitude: { $exists: true },
    })
      .populate('owner', 'name avatar')
      .lean();

    const withDistance = businesses
      .map((b) => ({
        ...b,
        distanceKm: Number(
          haversineDistance(lat, lng, b.latitude, b.longitude).toFixed(2)
        ),
      }))
      .sort((a, b) => {
        const pa = a.promotion?.priority || 0;
        const pb = b.promotion?.priority || 0;
        if (pb !== pa) return pb - pa;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, limit);

    res.json({
      message: 'Nearest barbershops',
      origin: { lat, lng },
      count: withDistance.length,
      businesses: withDistance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addService = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const { name, description, price, duration } = req.body;
    if (!name || price === undefined || !duration) {
      return res.status(400).json({ message: 'Service name, price and duration are required.' });
    }

    business.services.push({
      name,
      description: description || '',
      price: Number(price),
      duration: Number(duration),
    });
    await business.save();
    res.status(201).json({ message: 'Service added', services: business.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const service = business.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const { name, description, price, duration } = req.body;
    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (duration !== undefined) service.duration = Number(duration);

    await business.save();
    res.json({ message: 'Service updated', services: business.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'Business not found' });

    const service = business.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    service.deleteOne();
    await business.save();
    res.json({ message: 'Service removed', services: business.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBilling = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) return res.status(404).json({ message: 'Business not found' });

    business.billingDetails = {
      ...business.billingDetails,
      ...req.body,
    };
    await business.save();
    res.json({ message: 'Billing details updated successfully', billingDetails: business.billingDetails });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
