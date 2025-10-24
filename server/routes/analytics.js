const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90
    };
    
    const daysBack = ranges[timeRange] || 7;
    const cutoffDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

    // Get all tasks and users
    const tasks = await Task.find().populate('assignedTo createdBy');
    const users = await User.find().select('name email');

    // Task completion analytics
    const completedTasks = tasks.filter(task => 
      task.status === 'done' && task.completedAt && task.completedAt >= cutoffDate
    );

    const taskCompletion = {
      total: tasks.length,
      completed: completedTasks.length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      review: tasks.filter(t => t.status === 'review').length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0
    };

    // User productivity
    const userProductivity = users.map(user => {
      const userTasks = tasks.filter(task => task.assignedTo && task.assignedTo._id.toString() === user._id.toString());
      const userCompleted = userTasks.filter(task => 
        task.status === 'done' && task.completedAt && task.completedAt >= cutoffDate
      );
      
      const totalTime = userCompleted.reduce((acc, task) => acc + (task.timeTracking?.totalTime || 0), 0);
      
      return {
        id: user._id,
        name: user.name,
        totalTasks: userTasks.length,
        completedTasks: userCompleted.length,
        completionRate: userTasks.length > 0 ? (userCompleted.length / userTasks.length * 100).toFixed(1) : 0,
        avgTimePerTask: userCompleted.length > 0 ? Math.round(totalTime / userCompleted.length) : 0,
        totalTimeSpent: totalTime
      };
    });

    // Time tracking analytics
    const totalTimeSpent = tasks.reduce((acc, task) => acc + (task.timeTracking?.totalTime || 0), 0);
    const avgTimePerTask = tasks.length > 0 ? Math.round(totalTimeSpent / tasks.length) : 0;

    // Label distribution
    const labelCounts = {};
    tasks.forEach(task => {
      if (task.labels && task.labels.length > 0) {
        task.labels.forEach(label => {
          labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
        });
      }
    });

    // Task creation trend (last 30 days)
    const taskTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const tasksCreated = tasks.filter(task => 
        task.createdAt >= dayStart && task.createdAt <= dayEnd
      ).length;
      
      taskTrend.push({
        date: dayStart.toISOString().split('T')[0],
        count: tasksCreated
      });
    }

    res.json({
      taskCompletion,
      userProductivity,
      timeTracking: { totalTimeSpent, avgTimePerTask },
      labelDistribution: labelCounts,
      taskTrend,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user-specific analytics
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = 'week' } = req.query;
    
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90
    };
    
    const daysBack = ranges[timeRange] || 7;
    const cutoffDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

    const userTasks = await Task.find({ assignedTo: userId });
    const completedTasks = userTasks.filter(task => 
      task.status === 'done' && task.completedAt && task.completedAt >= cutoffDate
    );

    const analytics = {
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length * 100).toFixed(1) : 0,
      totalTimeSpent: userTasks.reduce((acc, task) => acc + (task.timeTracking?.totalTime || 0), 0),
      avgTimePerTask: completedTasks.length > 0 ? 
        Math.round(completedTasks.reduce((acc, task) => acc + (task.timeTracking?.totalTime || 0), 0) / completedTasks.length) : 0,
      tasksByStatus: {
        todo: userTasks.filter(t => t.status === 'todo').length,
        inProgress: userTasks.filter(t => t.status === 'in-progress').length,
        review: userTasks.filter(t => t.status === 'review').length,
        done: userTasks.filter(t => t.status === 'done').length
      }
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;