import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('REGISTER attempt', { name, email, role });
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const normEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const exists = await User.findOne({ email: normEmail });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // Allow selecting role explicitly; default to student if not provided.
    const safeRole = ['student', 'admin'].includes(role) ? role : 'student';
    const user = await User.create({ name, email: normEmail, password, role: safeRole });
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('REGISTER error', {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      stack: err?.stack
    });
    if (err?.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: msg || 'Validation error' });
    }
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ user: user.toJSON(), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
