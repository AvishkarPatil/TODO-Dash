const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date
  },
  labels: [{
    id: String,
    name: String,
    color: String
  }],
  attachments: [{
    id: String,
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeTracking: {
    totalTime: {
      type: Number,
      default: 0
    },
    sessions: [{
      startTime: Date,
      endTime: Date,
      duration: Number,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  completedAt: Date,
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    default: null
  },
  version: {
    type: Number,
    default: 0
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push'],
      default: 'email'
    },
    sentAt: Date,
    scheduledFor: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema); 