const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('[AUTH] Register request body:', req.body);

    // Validate input
    if (!username || !email || !password) {
      console.log('[AUTH] Validation failed: missing fields');
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    console.log(`[AUTH] Registration attempt for: ${username} (${email})`);

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log(`[AUTH] Registration failed: User already exists (${email})`);
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      accentColor: 'cyan'
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[AUTH] Registration successful: ${username} (ID: ${user._id})`);
    res.status(201).json({
      token,
      user: { id: user._id, username, email, accentColor: user.accentColor }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[AUTH] Login request body:', req.body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[AUTH] Login failed: user not found for email:', email);
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email, accentColor: user.accentColor }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (protected route)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user without password
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile settings
router.put('/profile', auth, async (req, res) => {
  try {
    const { accentColor } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (accentColor) {
      user.accentColor = accentColor;
    }

    await user.save();
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save story progress (protected route)
router.post('/progress', auth, async (req, res) => {
  try {
    const { storyId, currentScene, history } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find existing progress for this story or create new
    let storyProgress = user.storyProgress.find(sp => sp.storyId === storyId);
    if (!storyProgress) {
      storyProgress = { storyId, currentScene, history: history || [] };
      user.storyProgress.push(storyProgress);
    } else {
      storyProgress.currentScene = currentScene;
      storyProgress.history = history || [];
    }

    // Save user
    await user.save();
    res.json({ message: 'Progress saved successfully' });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Load story progress (protected route)
router.get('/progress/:storyId', auth, async (req, res) => {
  try {
    const { storyId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const storyProgress = user.storyProgress.find(sp => sp.storyId === storyId);
    if (!storyProgress) {
      return res.json({ currentScene: null, history: [] });
    }

    res.json({
      currentScene: storyProgress.currentScene,
      history: storyProgress.history
    });
  } catch (error) {
    console.error('Load progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all user progress (protected route)
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.storyProgress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug endpoint - get all users (remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    const allUsers = await User.find({}).select('-password');
    res.json({
      totalUsers: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;