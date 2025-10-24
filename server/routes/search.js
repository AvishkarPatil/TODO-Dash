const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Search tasks
router.get('/search', auth, async (req, res) => {
  try {
    const { q, status, priority, assignee } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignedTo = assignee;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations
router.post('/bulk', auth, async (req, res) => {
  try {
    const { action, taskIds, data } = req.body;
    
    switch (action) {
      case 'delete':
        await Task.deleteMany({ _id: { $in: taskIds } });
        res.json({ message: `Deleted ${taskIds.length} tasks` });
        break;
        
      case 'update':
        await Task.updateMany(
          { _id: { $in: taskIds } },
          { ...data, lastUpdatedBy: req.user.id }
        );
        res.json({ message: `Updated ${taskIds.length} tasks` });
        break;
        
      case 'assign':
        await Task.updateMany(
          { _id: { $in: taskIds } },
          { assignedTo: data.assignedTo, lastUpdatedBy: req.user.id }
        );
        res.json({ message: `Assigned ${taskIds.length} tasks` });
        break;
        
      default:
        res.status(400).json({ error: 'Invalid bulk action' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;