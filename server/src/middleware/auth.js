const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token = null;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied for this role.' });
  }
  next();
};

module.exports = { protect, authorize };
