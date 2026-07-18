const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const allowedRoles = ['user', 'barber'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    let avatar = null;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: userRole,
      avatar,
    });

    const token = signToken(user._id);
    res.status(201).json({
      message: 'Account successfully created',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const token = signToken(user._id);
    res.json({
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    await user.save();
    res.json({ message: 'Profile information updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Update failed' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Password update failed' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
