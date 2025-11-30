# 🚀 Deploy to Render.com - Step-by-Step Guide

## Prerequisites
- ✅ GitHub account
- ✅ MongoDB Atlas account (free)
- ✅ Render.com account (free)

---

## Part 1: Setup MongoDB Atlas (5 minutes)

### Step 1: Create MongoDB Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"** or **"Sign In"**
3. Create a new account or log in

### Step 2: Create a Free Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** (512 MB storage)
3. Select a cloud provider (AWS recommended)
4. Choose a region close to you
5. Name your cluster (or keep default)
6. Click **"Create"**

### Step 3: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `admin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** (SAVE THIS!)
6. User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Allow Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end:
   ```
   mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/smart-irrigation?retryWrites=true&w=majority
   ```

**SAVE THIS CONNECTION STRING!** You'll need it for Render.

---

## Part 2: Push to GitHub (3 minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `smart-irrigation` (or your choice)
3. Description: "Smart Irrigation Management System"
4. Keep it **Public** (required for Render free tier)
5. Do NOT initialize with README
6. Click **"Create repository"**

### Step 2: Push Your Code

Run these commands in PowerShell:

```powershell
cd C:\Users\Pranav\Downloads\smart-irrigation

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/smart-irrigation.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

---

## Part 3: Deploy Backend to Render (10 minutes)

### Step 1: Create Web Service

1. Go to https://render.com
2. Sign up/Login (you can use GitHub to sign in)
3. Click **"New +"** → **"Web Service"**

### Step 2: Connect Repository

1. Click **"Connect Account"** (if first time)
2. Authorize Render to access GitHub
3. Find and select your `smart-irrigation` repository
4. Click **"Connect"**

### Step 3: Configure Backend Service

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `smart-irrigation-backend` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
MONGO_URI = mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/smart-irrigation?retryWrites=true&w=majority
JWT_SECRET = your-super-secret-jwt-key-min-32-chars-long-12345
PORT = 10000
NODE_ENV = production
FRONTEND_URL = https://smart-irrigation-frontend.onrender.com
```

**Generate a strong JWT_SECRET:**
```powershell
# Run this in PowerShell to generate a secure secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Step 5: Create Service

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. You'll see build logs
4. Once you see "Your service is live 🎉", copy the URL
5. Your backend URL will be like: `https://smart-irrigation-backend.onrender.com`

**SAVE THIS BACKEND URL!**

---

## Part 4: Deploy Frontend to Render (5 minutes)

### Step 1: Create Static Site

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**

### Step 2: Connect Same Repository

1. Select your `smart-irrigation` repository
2. Click **"Connect"**

### Step 3: Configure Frontend Service

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `smart-irrigation-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Step 4: Add Environment Variable

Click **"Advanced"** → **"Add Environment Variable"**

```
VITE_API_URL = https://smart-irrigation-backend.onrender.com/api
```

**IMPORTANT:** Use your actual backend URL from Part 3!

### Step 5: Create Static Site

1. Click **"Create Static Site"**
2. Wait 3-5 minutes for build and deployment
3. Your frontend URL will be like: `https://smart-irrigation-frontend.onrender.com`

---

## Part 5: Update Backend CORS (Important!)

### Step 1: Update Backend Environment Variable

1. Go to your backend service on Render
2. Click **"Environment"** in left sidebar
3. Find `FRONTEND_URL` variable
4. Update it with your actual frontend URL:
   ```
   FRONTEND_URL = https://smart-irrigation-frontend.onrender.com
   ```
5. Click **"Save Changes"**
6. Service will auto-redeploy (wait 2-3 minutes)

---

## Part 6: Seed Initial Data (5 minutes)

### Option A: Using Render Shell (Recommended)

1. Go to your backend service on Render
2. Click **"Shell"** tab at top
3. Run these commands:

```bash
node seed.js
node seedAreas.js
```

### Option B: Using MongoDB Atlas UI

1. Go to MongoDB Atlas
2. Click **"Browse Collections"**
3. Manually create:
   - Collection: `users`
   - Add admin user document
   - Collection: `areas`
   - Add 3 area documents

---

## 🎉 Your App is Live!

### Access Your Application

**Frontend URL:** `https://smart-irrigation-frontend.onrender.com`

**Backend API:** `https://smart-irrigation-backend.onrender.com/api`

### Default Login Credentials

```
Email: admin@gmail.com
Password: admin123
```

**⚠️ IMPORTANT: Change password after first login!**

---

## 📊 Monitoring & Logs

### View Backend Logs
1. Go to backend service on Render
2. Click **"Logs"** tab
3. See real-time server logs

### View Frontend Logs
1. Go to frontend static site on Render
2. Click **"Logs"** tab
3. See build logs

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot GET /api/..."
**Solution:** Backend is still starting up. Wait 30-60 seconds.

### Issue 2: CORS Error
**Solution:** 
- Verify `FRONTEND_URL` in backend environment variables
- Make sure it matches your actual frontend URL
- No trailing slash in URL

### Issue 3: Database Connection Failed
**Solution:**
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string is correct
- Check database user password

### Issue 4: Blank Page on Frontend
**Solution:**
- Check browser console for errors
- Verify `VITE_API_URL` in frontend environment variables
- Make sure backend is running (check backend URL directly)

### Issue 5: 502 Bad Gateway
**Solution:** Backend is restarting. Wait 30-60 seconds.

---

## 🔄 Making Updates

### Update Code After Changes

```powershell
# Make your changes
git add .
git commit -m "Your update message"
git push
```

**Render will automatically redeploy!**

---

## 💰 Free Tier Limits

- **Render Free Tier:**
  - 750 hours/month (enough for 1 service 24/7)
  - Spins down after 15 min of inactivity
  - First request takes 30-60 seconds (cold start)

- **MongoDB Atlas Free:**
  - 512 MB storage
  - Shared RAM
  - Perfect for development/small projects

---

## 🎯 Next Steps

1. ✅ Test all features in production
2. ✅ Change default admin password
3. ✅ Create employee accounts
4. ✅ Add farms and areas
5. ✅ Share your live URL!

---

## 📞 Need Help?

- **Render Support:** https://render.com/docs
- **MongoDB Support:** https://www.mongodb.com/docs/atlas/
- **GitHub Issues:** Create issue in your repository

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string saved
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Backend service created on Render
- [ ] Backend environment variables set
- [ ] Backend deployed successfully
- [ ] Backend URL saved
- [ ] Frontend static site created
- [ ] Frontend environment variable set (VITE_API_URL)
- [ ] Frontend deployed successfully
- [ ] Backend CORS updated with frontend URL
- [ ] Initial data seeded
- [ ] Admin login tested
- [ ] All features working

---

🎊 **Congratulations! Your app is now live on the internet!** 🎊
