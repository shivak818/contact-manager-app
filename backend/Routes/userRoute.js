import express from 'express';
import User from '../Models/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js'; // Import from new file

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ message: 'Login successful', user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', authenticate, (req, res) => {
  res.status(200).json({ message: 'Authenticated', user: req.user });
});

// PUT /users/update-email
router.put('/update-email', authenticate, async (req, res) => {
    const { oldEmail, newEmail } = req.body;
    try {
      if (!oldEmail || !newEmail) {
        return res.status(400).json({ message: 'Both old and new emails are required' });
      }
  
      const existingUser = await User.findOne({ email: newEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'New email is already in use' });
      }
  
      const user = await User.findOne({ email: oldEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found with the given old email' });
      }
  
      user.email = newEmail;
      await user.save();
  
      res.status(200).json({ message: 'Email updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Email update failed', error: err.message });
    }
  });

  // PUT /users/change-password
router.put('/change-password', authenticate, async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
      if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Email, old password, and new password are required' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Password update failed', error: err.message });
    }
  });
  
export default router;