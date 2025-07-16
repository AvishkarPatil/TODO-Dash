const express = require('express');
const Activity = require('../models/Activity');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all activities (last 20 as per requirements)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activities for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.params.userId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(activities);
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new activity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      user: req.user._id
    });
    
    await activity.save();
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('user', 'username');
    
    res.status(201).json(populatedActivity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 