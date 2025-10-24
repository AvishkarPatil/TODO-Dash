const express = require('express');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .populate('lastUpdatedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .populate('lastUpdatedBy', 'username');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Column names to check against (case-insensitive)
const COLUMN_NAMES = ['to do', 'in progress', 'review', 'done'];

// Create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    
    // Get default board
    const Board = require('../models/Board');
    const defaultBoard = await Board.findOne({ name: 'Default Board' });
    if (!defaultBoard) {
      return res.status(500).json({ message: 'Default board not found' });
    }
    
    // Validation: title must not match column names
    if (COLUMN_NAMES.includes(title.trim().toLowerCase())) {
      return res.status(400).json({ message: 'Task title cannot match a column name.' });
    }
    // Validation: title must be unique per board
    const existing = await Task.findOne({ title: title.trim(), board: defaultBoard._id });
    if (existing) {
      return res.status(400).json({ message: 'Task title must be unique per board.' });
    }
    const task = new Task({
      ...req.body,
      board: defaultBoard._id,
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id
    });
    await task.save();
    
    // Log activity
    const activity = await new Activity({
      user: req.user._id,
      action: 'created',
      entityType: 'task',
      entityId: task._id,
      description: `Created task "${task.title}"`,
      metadata: { taskId: task._id, title: task.title }
    }).save();

    // Emit activity event
    const io = req.app.get('io');
    if (io) {
      const populatedActivity = await Activity.findById(activity._id).populate('user', 'username');
      io.to('board').emit('activity-created', populatedActivity);
    }
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .populate('lastUpdatedBy', 'username');
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    if (req && req.body) {
      console.error('Request body:', JSON.stringify(req.body, null, 2));
    }
    if (req && req.user) {
      console.error('Request user:', JSON.stringify(req.user, null, 2));
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, version } = req.body;
    
    // Get default board
    const Board = require('../models/Board');
    const defaultBoard = await Board.findOne({ name: 'Default Board' });
    if (!defaultBoard) {
      return res.status(500).json({ message: 'Default board not found' });
    }
    
    // Validation: title must not match column names (only if title is being updated)
    if (title && COLUMN_NAMES.includes(title.trim().toLowerCase())) {
      return res.status(400).json({ message: 'Task title cannot match a column name.' });
    }
    // Validation: title must be unique per board (excluding self) - only if title is being updated
    if (title) {
      const existing = await Task.findOne({ title: title.trim(), board: defaultBoard._id, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'Task title must be unique per board.' });
      }
    }
    // Conflict detection
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Only check version conflicts if we're updating the task content (not just moving)
    if (req.body.title || req.body.description || req.body.priority || req.body.assignedTo) {
      if (version === undefined || version === null) {
        return res.status(400).json({ message: 'Task version is required for update.' });
      }
      if (currentTask.version !== version) {
        // Conflict: return both versions
        return res.status(409).json({
          message: 'Conflict detected. The task has been modified by another user.',
          serverTask: currentTask,
          clientTask: req.body
        });
      }
    }
    // Set completion date if moving to done
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user._id,
      version: version + 1
    };
    
    if (req.body.status === 'done' && currentTask.status !== 'done') {
      updateData.completedAt = new Date();
    } else if (req.body.status !== 'done' && currentTask.status === 'done') {
      updateData.completedAt = null;
    }
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'username')
    .populate('createdBy', 'username')
    .populate('lastUpdatedBy', 'username');
    
    // Log activity
    const activity = await new Activity({
      user: req.user._id,
      action: 'updated',
      entityType: 'task',
      entityId: task._id,
      description: `Updated task "${task.title}"`,
      metadata: { taskId: task._id, title: task.title, changes: req.body }
    }).save();

    // Emit activity event
    const io = req.app.get('io');
    if (io) {
      const populatedActivity = await Activity.findById(activity._id).populate('user', 'username');
      io.to('board').emit('activity-created', populatedActivity);
    }
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Log activity before deletion
    const activity = await new Activity({
      user: req.user._id,
      action: 'deleted',
      entityType: 'task',
      entityId: task._id,
      description: `Deleted task "${task.title}"`,
      metadata: { taskId: task._id, title: task.title }
    }).save();

    // Emit activity event
    const io = req.app.get('io');
    if (io) {
      const populatedActivity = await Activity.findById(activity._id).populate('user', 'username');
      io.to('board').emit('activity-created', populatedActivity);
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move task (for drag and drop)
router.patch('/:id/move', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const oldStatus = task.status;
    task.status = status;
    task.lastUpdatedBy = req.user._id;
    task.version += 1;
    
    // Set completion date if moving to done
    if (status === 'done' && oldStatus !== 'done') {
      task.completedAt = new Date();
    } else if (status !== 'done' && oldStatus === 'done') {
      task.completedAt = null;
    }
    
    await task.save();
    
    // Log activity
    const activity = await new Activity({
      user: req.user._id,
      action: 'moved',
      entityType: 'task',
      entityId: task._id,
      description: `Moved task "${task.title}" to ${status}`,
      metadata: { taskId: task._id, title: task.title, newStatus: status }
    }).save();

    // Emit activity event
    const io = req.app.get('io');
    if (io) {
      const populatedActivity = await Activity.findById(activity._id).populate('user', 'username');
      io.to('board').emit('activity-created', populatedActivity);
    }
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .populate('lastUpdatedBy', 'username');
    
    res.json(populatedTask);
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve conflict
router.post('/:id/resolve-conflict', authenticateToken, async (req, res) => {
  try {
    const { resolution, chosenVersion } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (resolution === 'overwrite' && chosenVersion) {
      // Use the chosen version
      Object.assign(task, chosenVersion);
    } else if (resolution === 'merge') {
      // Merge logic - combine both versions intelligently
      // This is a simple merge strategy - you can enhance it
      if (chosenVersion) {
        task.title = chosenVersion.title || task.title;
        task.description = chosenVersion.description || task.description;
        task.priority = chosenVersion.priority || task.priority;
        task.status = chosenVersion.status || task.status;
        task.assignedTo = chosenVersion.assignedTo || task.assignedTo;
      }
    }
    
    task.lastUpdatedBy = req.user._id;
    task.version += 1;
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .populate('lastUpdatedBy', 'username');
    
    res.json(populatedTask);
  } catch (error) {
    console.error('Resolve conflict error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Smart Assign: Assign task to user with fewest active tasks on the same board
router.post('/:id/smart-assign', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Find all users who have tasks on this board
    let users = await Task.distinct('assignedTo', { board: task.board, assignedTo: { $ne: null } });
    if (users.length === 0) {
      // If no users assigned to any tasks, assign to any user in the system
      const User = require('../models/User');
      users = (await User.find({}, '_id')).map(u => u._id);
      if (users.length === 0) {
        return res.status(400).json({ message: 'No users found in the system to assign.' });
      }
    }
    // For each user, count their active (not done) tasks on this board
    const userTaskCounts = await Promise.all(users.map(async userId => {
      const count = await Task.countDocuments({ board: task.board, assignedTo: userId, status: { $ne: 'done' } });
      return { userId, count };
    }));
    // Find the user with the fewest active tasks
    userTaskCounts.sort((a, b) => a.count - b.count);
    const userWithFewest = userTaskCounts[0].userId;
    // Assign the task
    task.assignedTo = userWithFewest;
    task.lastUpdatedBy = req.user._id;
    await task.save();
    
    // Log activity
    const activity = await new Activity({
      user: req.user._id,
      action: 'assigned',
      entityType: 'task',
      entityId: task._id,
      description: `Smart assigned task "${task.title}"`,
      metadata: { taskId: task._id, title: task.title, assignedTo: userWithFewest }
    }).save();

    // Emit activity event
    const io = req.app.get('io');
    if (io) {
      const populatedActivity = await Activity.findById(activity._id).populate('user', 'username');
      io.to('board').emit('activity-created', populatedActivity);
    }
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'username')
      .populate('createdBy', 'username')
      .populate('lastUpdatedBy', 'username');
    res.json(populatedTask);
  } catch (error) {
    console.error('Smart Assign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 