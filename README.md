# Real-Time Collaborative To-Do Dashboard

A modern, full-stack web application that enables real-time collaborative task management with smart assignment algorithms and conflict resolution.

## Project Overview

This is a real-time collaborative to-do board application where multiple users can work together on the same task board simultaneously. Think of it like Google Docs, but for task management. When one person moves a task or adds a comment, everyone else sees it instantly.

### Key Features:
- **Real-time collaboration** with instant updates across all users
- **Smart task assignment** algorithm that balances workload
- **Conflict resolution** system for simultaneous edits
- **Beautiful custom UI** with smooth animations
- **Mobile-responsive design** that works on all devices
- **Comprehensive activity logging** for team transparency

## Tech Stack

### Frontend
- **React** - Modern, responsive user interface
- **Custom CSS** - Beautiful, unique design without external frameworks
- **@hello-pangea/dnd** - Smooth drag-and-drop functionality
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Server runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data persistence
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication and session management
- **bcryptjs** - Password hashing and security

### Development Tools
- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run frontend and backend simultaneously
- **ESLint** - Code quality and consistency

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/todo-dashboard.git
cd todo-dashboard
```

### Step 2: Install Dependencies
```bash
# Install all dependencies (both frontend and backend)
npm run install-all
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/todo-dashboard
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
CLIENT_URL=https://tododashboard-rpq8.onrender.com
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-dashboard
```

### Step 4: Start Development Servers
```bash
# Start both frontend and backend simultaneously
npm run dev
```

This will start:
- **Backend:** https://tododashboard-rpq8.onrender.com
- **Frontend:** https://tododashboard-rpq8.onrender.com

### Alternative: Run Separately
```bash
# Backend only
npm run server

# Frontend only
npm run client
```

## Features and Usage Guide

### 1. User Authentication
- **Registration:** Create a new account with email and password
- **Login:** Secure authentication with JWT tokens
- **Session Management:** Stay logged in across browser sessions
- **User Profile:** See your username at the top of the dashboard

### 2. Task Management
- **Create Tasks:** Click "Add Task" to create new tasks with title, description, due date, and priority
- **Four Status Columns:** To Do, In Progress, Review, Done
- **Drag & Drop:** Move tasks between columns with smooth animations
- **Task Details:** View title, description, assignee, priority, and last updated info

### 3. Smart Assignment
- **Auto-Assignment:** Click "Smart Assign" to automatically distribute tasks based on workload
- **Workload Balancing:** System assigns tasks to users with fewer tasks
- **Manual Assignment:** Option to manually assign tasks to specific users
- **Team Efficiency:** Helps balance workload across the entire team

### 4. Real-Time Collaboration
- **Live Updates:** See changes instantly when other users modify tasks
- **No Refresh Needed:** Page updates automatically without reloading
- **Multiple Users:** Unlimited number of people can work simultaneously
- **Room-Based System:** All users work in the same virtual "room"

### 5. Conflict Resolution
- **Smart Detection:** System detects when two users edit the same task simultaneously
- **Conflict Modal:** Popup appears showing both users' intended actions
- **User Choice:** Each user can choose to:
   - Keep their own change
   - Accept the other user's change
   - Cancel the operation
4. **Data Integrity:** The system ensures no data is lost and maintains consistency

### Example Scenario:
- User A drags Task X from "To Do" to "In Progress"
- User B simultaneously drags Task X from "To Do" to "Review"
- System detects conflict and shows both intended destinations
- Users can choose which action to keep

## Smart Assign Logic

The Smart Assign algorithm works by analyzing the current workload distribution across all users and automatically assigning unassigned tasks to users with the lightest workload.

### How It Works:
1. **Workload Analysis:** The system counts how many tasks each user currently has assigned
2. **Fair Distribution:** Tasks are assigned to users with fewer tasks, ensuring balanced workload
3. **One-Click Assignment:** Single button click distributes multiple unassigned tasks automatically
4. **Team Efficiency:** Helps prevent overloading any single team member

### Example:
- User A has 3 tasks
- User B has 1 task  
- User C has 5 tasks
- New tasks will be assigned to User B (who has the lightest workload)

## Conflict Handling Logic

The conflict resolution system prevents data loss when multiple users try to modify the same task simultaneously.

### How It Works:
1. **Conflict Detection:** When two users try to move the same task at the same time, the system detects the conflict
2. **Conflict Modal:** A popup appears showing both users' intended actions
3. **User Choice:** Each user can choose to:
   - Keep their own change
   - Accept the other user's change
   - Cancel the operation
4. **Data Integrity:** The system ensures no data is lost and maintains consistency

### Example Scenario:
- User A drags Task X from "To Do" to "In Progress"
- User B simultaneously drags Task X from "To Do" to "Review"
- System detects conflict and shows both intended destinations
- Users can choose which action to keep

## Deployment Instructions

### Frontend Deployment (Vercel/Netlify)

1. **Build the Project:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `build`
   - Add environment variables for API URL

3. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`

### Backend Deployment (Render/Railway)

1. **Prepare for Deployment:**
   - Ensure all dependencies are in `package.json`
   - Set up environment variables in deployment platform
   - Update CORS settings for production domain

2. **Deploy to Render:**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

3. **Environment Variables for Production:**
   ```env
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-production-secret-key
   PORT=5000
   CLIENT_URL=https://your-frontend-domain.com
   ```

## 📹 Demo Video

[Link to your 5-10 minute demo video showing:]
- Brief project introduction and tech stack
- User registration and login
- Task creation and management
- Real-time collaboration demonstration
- Smart Assign functionality
- Conflict resolution demonstration
- Mobile responsiveness
- Your favorite or most challenging feature

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- React team for the amazing framework
- Socket.IO for real-time capabilities
- MongoDB for the flexible database
- The open-source community for inspiration and tools

---

**Note:** This project is production-ready and demonstrates modern full-stack development practices with real-time collaboration features.