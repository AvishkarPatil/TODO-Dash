const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/attachments';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload file attachment
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { taskId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/attachments/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    task.attachments.push(attachment);
    await task.save();

    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attachment
router.delete('/attachment/:attachmentId', auth, async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const task = await Task.findOne({ 'attachments.id': attachmentId });
    if (!task) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = task.attachments.find(att => att.id === attachmentId);
    if (attachment) {
      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', attachment.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Remove from task
      task.attachments = task.attachments.filter(att => att.id !== attachmentId);
      await task.save();
    }

    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update time tracking
router.post('/:id/time', auth, async (req, res) => {
  try {
    const { duration } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const session = {
      startTime: new Date(Date.now() - duration * 1000),
      endTime: new Date(),
      duration,
      userId: req.user.id
    };

    task.timeTracking.sessions.push(session);
    task.timeTracking.totalTime += duration;
    await task.save();

    res.json({ totalTime: task.timeTracking.totalTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;