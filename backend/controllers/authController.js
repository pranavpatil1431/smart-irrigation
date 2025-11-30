import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password, role: 'admin' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, area: user.area, employeeId: user.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { name: user.name, email: user.email, role: user.role, area: user.area, employeeId: user.employeeId }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, area: user.area, employeeId: user.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role, area: user.area, employeeId: user.employeeId }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
