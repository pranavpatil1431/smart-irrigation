# MongoDB Local Setup Guide

## Option 1: Use MongoDB Atlas (Cloud Database) - RECOMMENDED

Your MongoDB Atlas connection is already set up. Just update `.env`:

```
MONGO_URI=mongodb+srv://smart_user:Pranav1431@cluster0.sotmkpg.mongodb.net/smart-irrigation
JWT_SECRET=ENhn6ZXwNuF6ciRi3f339urYekFcqizIXgx085dIuCs=
PORT=5001
NODE_ENV=development
```

This allows remote connections over the internet.

---

## Option 2: Install MongoDB Locally on Windows

### Step 1: Download MongoDB Community Edition
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: 7.0 (Latest)
   - **OS**: Windows
   - **Package**: MSI
3. Click "Download"

### Step 2: Install MongoDB
1. Run the `.msi` installer file
2. Choose "Complete" installation
3. Install MongoDB Compass (optional but recommended)
4. Keep default settings

### Step 3: Start MongoDB Service
On Windows, MongoDB runs as a service automatically after installation.

To verify it's running:
```powershell
# Check if MongoDB service is running
Get-Service MongoDB | Select-Object Name, Status

# If not running, start it:
Start-Service MongoDB
```

### Step 4: Update `.env`
```
MONGO_URI=mongodb://localhost:27017/smart-irrigation
JWT_SECRET=ENhn6ZXwNuF6ciRi3f339urYekFcqizIXgx085dIuCs=
PORT=5001
NODE_ENV=development
```

### Step 5: Restart Backend
```powershell
cd backend
node server.js
```

---

## Option 3: Use MongoDB with Docker (Easiest if Docker is installed)

```powershell
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest
```

Then update `.env`:
```
MONGO_URI=mongodb://admin:password@localhost:27017/smart-irrigation?authSource=admin
```

---

## Verify Connection

After setup, restart your backend:
```powershell
cd backend
node server.js
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5001
```

If you get an error, MongoDB is not running or the connection string is wrong.
