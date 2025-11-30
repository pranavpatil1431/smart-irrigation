# Smart Irrigation System - Deployment Guide

## 🚀 Hosting Options

### Option 1: Render.com (Recommended - Free Tier Available)

#### Backend Deployment:
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Environment Variables**:
     - `MONGO_URI`: Your MongoDB connection string (use MongoDB Atlas)
     - `JWT_SECRET`: Your secure JWT secret
     - `PORT`: 5001
     - `NODE_ENV`: production

#### Frontend Deployment:
1. Create a new Static Site on Render
2. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**:
     - `VITE_API_URL`: Your backend URL (e.g., https://your-backend.onrender.com)

---

### Option 2: Vercel (Frontend) + Render (Backend)

#### Backend on Render:
- Same as Option 1 above

#### Frontend on Vercel:
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `cd frontend && vercel`
3. Add environment variable:
   - `VITE_API_URL`: Your backend URL

---

### Option 3: Railway.app (Full Stack)

1. Create a new project on Railway
2. Add MongoDB database
3. Deploy backend and frontend services
4. Configure environment variables

---

### Option 4: DigitalOcean/AWS/Azure (Production)

#### Requirements:
- Ubuntu/Linux server
- Node.js 18+
- MongoDB instance
- Nginx (reverse proxy)
- PM2 (process manager)

---

## 📦 Pre-Deployment Checklist

### 1. Database Setup (MongoDB Atlas - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (0.0.0.0/0 for public access)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/smart-irrigation`

### 2. Environment Variables

Create `.env` file in backend with:
```
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-random-string
PORT=5001
NODE_ENV=production
```

### 3. Update CORS Settings

In `backend/server.js`, update CORS to allow your frontend domain:
```javascript
cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
})
```

### 4. Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist` folder with production files.

---

## 🔧 Quick Deploy Commands

### Build Frontend for Production:
```bash
cd frontend
npm install
npm run build
```

### Test Production Build Locally:
```bash
cd frontend
npm run preview
```

### Start Backend in Production Mode:
```bash
cd backend
npm install --production
NODE_ENV=production node server.js
```

---

## 🌐 Free Hosting Recommendations

### Best Free Options:

1. **Render.com** ⭐ (Recommended)
   - ✅ Free tier available
   - ✅ Easy deployment
   - ✅ Auto-deploys from GitHub
   - ✅ HTTPS included
   - ❌ May sleep after inactivity

2. **Vercel** (Frontend only)
   - ✅ Best for React/Vite apps
   - ✅ Lightning fast CDN
   - ✅ Free SSL
   - ✅ Automatic deployments

3. **Railway.app**
   - ✅ $5 free credit/month
   - ✅ Supports full stack
   - ✅ Easy database setup

4. **MongoDB Atlas**
   - ✅ 512MB free forever
   - ✅ Perfect for development
   - ✅ Shared cluster

---

## 📋 Step-by-Step: Deploy to Render + MongoDB Atlas

### Step 1: Setup MongoDB Atlas (5 minutes)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Create database user (username/password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all)
5. Copy connection string: 
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-irrigation
   ```

### Step 2: Deploy Backend to Render (10 minutes)

1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect repository
4. Configure:
   - **Name**: smart-irrigation-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables:
   - `MONGO_URI`: (paste your Atlas connection string)
   - `JWT_SECRET`: (generate random string)
   - `PORT`: `5001`
   - `NODE_ENV`: `production`
6. Click "Create Web Service"
7. Copy your backend URL: `https://smart-irrigation-backend.onrender.com`

### Step 3: Update Frontend API URL

In `frontend/src/services/api.js`, update the base URL:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
});
```

### Step 4: Deploy Frontend to Render (5 minutes)

1. Render → New → Static Site
2. Connect same repository
3. Configure:
   - **Name**: smart-irrigation-frontend
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
5. Click "Create Static Site"

### Step 5: Seed Initial Data

1. Use MongoDB Compass or Atlas UI
2. Connect to your database
3. Import initial data or run seed script remotely

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update admin password after first login
- [ ] Configure CORS properly (only allow your frontend domain)
- [ ] Use environment variables (never commit .env files)
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS (included with Render/Vercel)

---

## 📱 After Deployment

Your app will be live at:
- Frontend: `https://your-app.onrender.com` or `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`

**Login with:**
- Admin: admin@gmail.com / admin123
- Employee: employee1@gmail.com / emp123

---

## 🆘 Need Help?

Common issues:
1. **CORS errors**: Update CORS origin in backend/server.js
2. **Database connection failed**: Check MongoDB connection string
3. **502 Bad Gateway**: Backend is starting up (wait 30-60 seconds)
4. **Blank page**: Check console for API URL errors

---

Ready to deploy? Let me know which hosting option you prefer! 🚀
