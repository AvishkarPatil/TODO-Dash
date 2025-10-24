const express = require('express');
const Label = require('../models/Label');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all labels
router.get('/', auth, async (req, res) => {
  try {
    const labels = await Label.find({
      $or: [
        { createdBy: req.user.id },
        { isGlobal: true }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(labels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new label
router.post('/', auth, async (req, res) => {
  try {
    const { name, color, isGlobal = false } = req.body;
    
    const label = new Label({
      name,
      color,
      createdBy: req.user.id,
      isGlobal
    });
    
    await label.save();
    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update label
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    const label = await Label.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { name, color },
      { new: true }
    );
    
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }
    
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete label
router.delete('/:id', auth, async (req, res) => {
  try {
    const label = await Label.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }
    
    res.json({ message: 'Label deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;