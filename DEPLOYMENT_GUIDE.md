# Deployment Guide

This guide will help you deploy your Real-Time Collaborative To-Do Dashboard to production.

## 🚀 Quick Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Backend deployed (Render/Railway)
- [ ] MongoDB Atlas database set up
- [ ] Environment variables configured
- [ ] Demo video recorded
- [ ] All links tested and working

## 📁 Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Real-time collaborative to-do dashboard"

# Create repository on GitHub.com
# Then link your local repo
git remote add origin https://github.com/yourusername/todo-dashboard.git
git branch -M main
git push -u origin main
```

### 1.2 Repository Structure
Ensure your repository has:
```
todo-dashboard/
├── README.md
├── Logic_Document.md
├── DEPLOYMENT_GUIDE.md
├── package.json
├── .env.example
├── server/
│   ├── index.js
│   ├── models/
│   ├── routes/
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   └── package.json
└── .gitignore
```

## 🗄️ Step 2: MongoDB Atlas Setup

### 2.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)

### 2.2 Configure Database
1. **Create Database:**
   - Database Name: `todo-dashboard`
   - Collection Name: `users` (will be created automatically)

2. **Create Database User:**
   - Username: `todo-user`
   - Password: `secure-password-123`
   - Role: `Read and write to any database`

3. **Network Access:**
   - Add IP Address: `0.0.0.0/0` (allow all IPs for deployment)

### 2.3 Get Connection String
```
mongodb+srv://todo-user:secure-password-123@cluster0.xxxxx.mongodb.net/todo-dashboard?retryWrites=true&w=majority
```

## 🌐 Step 3: Backend Deployment (Render)

### 3.1 Prepare Backend for Deployment
1. **Update server/index.js** to handle production:
```javascript
// Add this at the top of server/index.js
const path = require('path');

// Update CORS for production
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://tododashboard-rpq8.onrender.com',
  credentials: true
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}
```

2. **Update package.json** in root directory:
```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "cd client && npm install && npm run build",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install"
  }
}
```

### 3.2 Deploy to Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** `todo-dashboard-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 3.3 Environment Variables (Render)
Add these in Render dashboard:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://todo-user:secure-password-123@cluster0.xxxxx.mongodb.net/todo-dashboard?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-for-production
PORT=5000
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### 3.4 Get Backend URL
Your backend will be available at:
`https://todo-dashboard-backend.onrender.com`

## 🎨 Step 4: Frontend Deployment (Vercel)

### 4.1 Prepare Frontend for Deployment
1. **Update API calls** in client/src/services/api.js:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tododashboard-rpq8.onrender.com';
```

2. **Create .env.production** in client directory:
```
REACT_APP_API_URL=https://todo-dashboard-backend.onrender.com
```

### 4.2 Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

### 4.3 Environment Variables (Vercel)
Add in Vercel dashboard:
```
REACT_APP_API_URL=https://todo-dashboard-backend.onrender.com
```

### 4.4 Get Frontend URL
Your frontend will be available at:
`https://todo-dashboard.vercel.app`

## 🔧 Step 5: Alternative Deployment Options

### Backend Alternatives

#### Railway
1. Go to [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy automatically
4. Add environment variables

#### Heroku
1. Go to [Heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repository
4. Add environment variables
5. Deploy

### Frontend Alternatives

#### Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build command: `cd client && npm install && npm run build`
4. Set publish directory: `client/build`

## 🎥 Step 6: Demo Video Recording

### 6.1 Recording Tools
- **Loom:** [loom.com](https://loom.com) - Easy screen recording
- **OBS Studio:** Free, professional recording
- **Zoom:** Screen recording feature
- **Windows Game Bar:** Built-in Windows recording

### 6.2 Video Content (5-10 minutes)
1. **Introduction (1 min):**
   - Project overview
   - Tech stack explanation

2. **Live Demo (6-8 min):**
   - User registration/login
   - Task creation and management
   - Real-time collaboration (open 2 browser windows)
   - Smart Assign functionality
   - Conflict resolution demonstration
   - Mobile responsiveness

3. **Technical Highlights (1-2 min):**
   - Your favorite feature
   - Most challenging part
   - What you learned

### 6.3 Video Upload
- Upload to Google Drive (make public)
- Or YouTube (unlisted)
- Or Loom (public link)
- Include link in README.md

## ✅ Step 7: Final Testing

### 7.1 Test Checklist
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] User registration works
- [ ] User login works
- [ ] Task creation works
- [ ] Real-time updates work
- [ ] Smart Assign works
- [ ] Conflict resolution works
- [ ] Mobile responsiveness works

### 7.2 Test with Multiple Users
1. Open your app in 2 different browsers
2. Register different users
3. Test real-time collaboration
4. Test conflict resolution
5. Test Smart Assign

## 📝 Step 8: Update README.md

Update your README.md with:
- [ ] Live demo links
- [ ] Demo video link
- [ ] Correct deployment URLs
- [ ] Updated environment variables

## 🚀 Step 9: Submission

### 9.1 Final Checklist
- [ ] GitHub repository: `https://github.com/yourusername/todo-dashboard`
- [ ] Frontend URL: `https://todo-dashboard.vercel.app`
- [ ] Backend URL: `https://todo-dashboard-backend.onrender.com`
- [ ] Demo video: `https://drive.google.com/...`
- [ ] Logic document: `Logic_Document.md` in repository

### 9.2 Submit to Internshala
1. Go to Internshala portal
2. Navigate to assignment submission section
3. Submit:
   - GitHub repository link
   - Deployed app URL (frontend)
   - Demo video link
   - Logic document (upload or link)

## 🆘 Troubleshooting

### Common Issues

#### Backend Won't Deploy
- Check environment variables
- Ensure all dependencies in package.json
- Check build logs for errors

#### Frontend Can't Connect to Backend
- Verify CORS settings
- Check API URL in environment variables
- Ensure backend is running

#### MongoDB Connection Issues
- Check connection string
- Verify network access settings
- Ensure database user has correct permissions

#### Real-time Features Not Working
- Check Socket.IO configuration
- Verify client URL in backend CORS
- Check browser console for errors

### Getting Help
- Check deployment platform logs
- Review browser console errors
- Test locally first
- Use deployment platform support

## 🎉 Success!

Once everything is deployed and working:
1. **Test thoroughly** with multiple users
2. **Record your demo video**
3. **Update all documentation**
4. **Submit to Internshala**
5. **Celebrate your achievement!** 🎊

Your real-time collaborative to-do dashboard is now live and ready for the world to see! 