const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { authLimiter, uploadLimiter, apiLimiter } = require('./middleware/rateLimiter');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config({ path: '../.env' });

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const activityRoutes = require('./routes/activities');
const attachmentRoutes = require('./routes/attachments');
const labelRoutes = require('./routes/labels');
const analyticsRoutes = require('./routes/analytics');
const smartAssignRoutes = require('./routes/smartAssign');
const searchRoutes = require('./routes/search');

// Initialize reminder service
require('./services/reminderService');

const app = express();
const server = http.createServer(app);


const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.CLIENT_URL || 'http://localhost:3000'
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

// Serve static files for attachments
app.use('/uploads', express.static('uploads'));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Apply general rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tasks', uploadLimiter, attachmentRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/smart-assign', smartAssignRoutes);
app.use('/api/search', searchRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('task-updated', (data) => {
    socket.to(data.roomId).emit('task-updated', data);
  });

  socket.on('task-created', (data) => {
    socket.to(data.roomId).emit('task-created', data);
  });

  socket.on('task-deleted', (data) => {
    socket.to(data.roomId).emit('task-deleted', data);
  });

  socket.on('task-moved', (data) => {
    socket.to(data.roomId).emit('task-moved', data);
  });

  socket.on('time-updated', (data) => {
    socket.to(data.roomId).emit('time-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Create default board if it doesn't exist
  const Board = require('./models/Board');
  const defaultBoard = await Board.findOne({ name: 'Default Board' });
  if (!defaultBoard) {
    await new Board({ name: 'Default Board', description: 'Main task board' }).save();
    console.log('Created default board');
  }
})
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 