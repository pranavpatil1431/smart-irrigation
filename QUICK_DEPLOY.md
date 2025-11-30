# 🚀 Quick Deployment Reference Card

## 📋 What You Need

### 1. MongoDB Atlas Connection String
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/smart-irrigation
```
Get from: https://cloud.mongodb.com → Connect → Connect your application

### 2. JWT Secret (32+ characters)
Generate using PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3. GitHub Repository URL
```
https://github.com/YOUR_USERNAME/smart-irrigation
```

---

## 🎯 Deployment Steps

### Step 1: MongoDB Atlas (5 min)
1. Sign up at mongodb.com/cloud/atlas
2. Create M0 FREE cluster
3. Create database user
4. Allow IP: 0.0.0.0/0
5. Get connection string

### Step 2: GitHub (2 min)
```powershell
git remote add origin https://github.com/YOUR_USERNAME/smart-irrigation.git
git push -u origin main
```

### Step 3: Render Backend (5 min)
1. New Web Service
2. Connect repository
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add Environment Variables:
   - MONGO_URI
   - JWT_SECRET
   - PORT = 10000
   - NODE_ENV = production
5. Deploy

### Step 4: Render Frontend (3 min)
1. New Static Site
2. Connect same repository
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variable:
   - VITE_API_URL = https://your-backend.onrender.com/api
5. Deploy

### Step 5: Update Backend CORS (1 min)
1. Go to backend service
2. Add environment variable:
   - FRONTEND_URL = https://your-frontend.onrender.com
3. Save (auto-redeploys)

### Step 6: Seed Data (2 min)
1. Go to backend service → Shell
2. Run: `node seed.js`
3. Run: `node seedAreas.js`

---

## 🔑 Environment Variables Quick Reference

### Backend (.env)
```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-irrigation
JWT_SECRET=your-secret-32-chars-minimum
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend (.env.production)
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🌐 Your URLs

After deployment, save these:

**Frontend:** `https://smart-irrigation-frontend.onrender.com`
**Backend:** `https://smart-irrigation-backend.onrender.com`

**Login:** admin@gmail.com / admin123

---

## ⚡ Quick Commands

### Push Updates
```powershell
git add .
git commit -m "Update message"
git push
```
*Render auto-deploys on push*

### View Logs
Render Dashboard → Your Service → Logs tab

### Restart Service
Render Dashboard → Your Service → Manual Deploy → Deploy latest commit

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| CORS error | Update FRONTEND_URL in backend env vars |
| Can't connect DB | Check MongoDB IP whitelist (0.0.0.0/0) |
| 502 Gateway | Wait 60 seconds (cold start) |
| Blank page | Check VITE_API_URL in frontend env vars |

---

## 📞 Important Links

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render Dashboard:** https://dashboard.render.com
- **GitHub Repo:** https://github.com/YOUR_USERNAME/smart-irrigation
- **Full Guide:** See RENDER_DEPLOY_GUIDE.md

---

⏱️ **Total Time: ~20 minutes**
💰 **Total Cost: $0 (100% Free)**

🎉 **Ready to deploy? Follow RENDER_DEPLOY_GUIDE.md for detailed steps!**
