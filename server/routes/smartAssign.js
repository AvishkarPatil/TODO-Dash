const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Smart assign all unassigned tasks
router.post('/smart-assign-all', auth, async (req, res) => {
  try {
    // Get all unassigned tasks
    const unassignedTasks = await Task.find({ assignedTo: null, status: { $ne: 'done' } });
    
    if (unassignedTasks.length === 0) {
      return res.json({ message: 'No unassigned tasks found', assignedCount: 0 });
    }

    // Get all users
    const users = await User.find({}, '_id name');
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'No users found to assign tasks' });
    }

    // Count current tasks for each user
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({ 
          assignedTo: user._id, 
          status: { $ne: 'done' } 
        });
        return { userId: user._id, name: user.name, count };
      })
    );

    // Sort users by task count (ascending)
    userTaskCounts.sort((a, b) => a.count - b.count);

    let assignedCount = 0;
    
    // Assign tasks in round-robin fashion starting with users who have fewer tasks
    for (let i = 0; i < unassignedTasks.length; i++) {
      const userIndex = i % users.length;
      const selectedUser = userTaskCounts[userIndex];
      
      const task = unassignedTasks[i];
      task.assignedTo = selectedUser.userId;
      task.lastUpdatedBy = req.user.id;
      await task.save();
      
      // Update the count for next iteration
      selectedUser.count++;
      assignedCount++;
    }

    res.json({ 
      message: `Successfully assigned ${assignedCount} tasks`,
      assignedCount,
      assignments: userTaskCounts.map(u => ({ name: u.name, tasks: u.count }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workload distribution
router.get('/workload', auth, async (req, res) => {
  try {
    const users = await User.find({}, '_id name email');
    
    const workloadData = await Promise.all(
      users.map(async (user) => {
        const tasks = await Task.find({ assignedTo: user._id });
        const activeTasks = tasks.filter(t => t.status !== 'done');
        const completedTasks = tasks.filter(t => t.status === 'done');
        
        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          totalTasks: tasks.length,
          activeTasks: activeTasks.length,
          completedTasks: completedTasks.length,
          tasksByStatus: {
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            review: tasks.filter(t => t.status === 'review').length,
            done: completedTasks.length
          }
        };
      })
    );

    res.json(workloadData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;