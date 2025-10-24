# TODO Dash

Real-time collaborative task management platform with intelligent assignment and conflict resolution.

## Features

- **Real-time Collaboration** - Live updates across all connected users
- **Smart Assignment** - AI-powered workload balancing
- **Conflict Resolution** - Handles simultaneous edits gracefully
- **Drag & Drop** - Intuitive task management interface
- **Team Analytics** - Performance insights and activity tracking
- **Time Tracking** - Built-in pomodoro timer and time logs
- **File Attachments** - Upload and share task-related files
- **Custom Labels** - Organize tasks with color-coded tags
- **Due Date Reminders** - Email and push notifications
- **Dark/Light Theme** - Customizable UI preferences

## Tech Stack

**Frontend:** React, TypeScript, Socket.IO Client, @hello-pangea/dnd  
**Backend:** Node.js, Express, MongoDB, Socket.IO, JWT  
**Tools:** ESLint, Prettier, Nodemon, Concurrently

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd TODO-Dash
npm run install-all

# Environment setup
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development
npm run dev
```

**Prerequisites:** Node.js 16+, MongoDB

## Architecture

### Real-Time Engine
- WebSocket connections via Socket.IO
- Event-driven state synchronization
- Optimistic UI updates with rollback

### Smart Assignment Algorithm
- Workload analysis and balancing
- Skill-based task matching
- Priority and deadline consideration

### Conflict Resolution
- Operational transformation for concurrent edits
- Last-write-wins with user confirmation
- Automatic merge for non-conflicting changes

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Tasks
```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/assign
```

### Real-time Events
```
task:created
task:updated
task:deleted
task:moved
user:joined
user:left
```

## Deployment

```bash
# Production build
npm run build

# Docker deployment
docker-compose up -d

# Environment variables
MONGODB_URI=mongodb://localhost:27017/todo-dash
JWT_SECRET=your-jwt-secret
PORT=5000
NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.