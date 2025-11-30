# Smart Irrigation Manager 🚜💧

A complete full-stack web application for village irrigation management with real-time farm tracking on maps.

## ✨ Features

- **Color-coded farm status** on interactive maps (Green/Yellow/Red based on days since last watering)
- **Role-based access**: Admins manage everything, Employees see only their assigned area
- **Mobile-friendly**: Camera integration for photo uploads + GPS location
- **Real-time updates**: Farm status updates instantly after watering
- **Responsive design**: Works perfectly on phones, tablets, and desktops

## 🛠️ Tech Stack

Backend: Node.js + Express + MongoDB + Mongoose + JWT  
Frontend: React + Vite + Tailwind CSS + Leaflet.js (Maps)  
Auth: JWT with role-based access control  
File Upload: Multer (local storage)

## 🚀 Quick Start

### 1. Clone & Install Backend

```bash
cd backend
cp .env.example .env
npm install
```

### 2. Setup MongoDB & Environment

Create `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/smart-irrigation
JWT_SECRET=your-super-secret-key-here
PORT=5000
UPLOAD_PATH=./uploads
```

Create uploads folder:

```bash
mkdir uploads
```

### 3. Seed Default Admin

```bash
npm run seed
```

Creates: `admin@gmail.com` / `admin123`

### 4. Start Backend

```bash
npm run dev
```

Runs on `http://localhost:5000`

### 5. Install & Start Frontend

```bash
cd frontend  
npm install
npm run dev
```

Runs on `http://localhost:5173`

## 📱 Default Login

- Email: `admin@gmail.com`  
- Password: `admin123`

## 🎮 How to Use

### Admin Dashboard (`/dashboard`)

- View summary cards (Total farms, Overdue, Due soon, Employees)
- Navigate to Map, Employees management

### Map View (`/map`)

- **Green markers**: Recently watered (≤20 days)  
- **Yellow markers**: Due soon (21-25 days)  
- **Red markers**: Overdue (>25 days) - **URGENT**
- Click any marker → "Mark Watered Now" button
- **Mobile**: Camera opens automatically + GPS location captured

### Employee Workflow

1. Login with employee credentials
2. See only farms in assigned area
3. Visit farm → Click marker → Upload photo → Select crop condition → Submit
4. Farm instantly turns **GREEN** ✅

## 📂 Folder Structure

```text
backend/
├── models/          # Mongoose schemas
├── controllers/     # Business logic
├── routes/          # API routes
├── middleware/      # Auth & validation
└── server.js

frontend/
├── src/pages/       # Login, Dashboard, MapView, etc.
├── src/components/  # Reusable UI
└── src/services/    # API client
```

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt  
- ✅ JWT authentication (7-day tokens)  
- ✅ Role-based access control  
- ✅ Input validation  
- ✅ File upload size/type validation  
- ✅ CORS configured for frontend

## 🌍 Production Deployment

1. **MongoDB Atlas** (cloud database)  
2. **Cloudinary** (for photo storage instead of local)  
3. **Vercel/Netlify** (frontend)  
4. **Railway/Render** (backend)  
5. Update `.env` variables accordingly

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB not connecting | Install MongoDB locally or use MongoDB Atlas |
| CORS errors | Frontend runs on `:5173`, Backend on `:5000` |
| Photos not uploading | Create `uploads/` folder with write permissions |
| Map markers missing | CDN icons are used automatically |

## 📱 Mobile Optimization

- Large buttons (60px+ touch targets)  
- Camera capture (`capture="environment"`)  
- GPS location (automatic with fallback)  
- Offline-first design principles  
- Progressive enhancement

## 🤝 Contributing

1. Fork the repo  
2. Create feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit changes (`git commit -m 'Add amazing feature'`)  
4. Push & create PR

## 📄 License

MIT License - Feel free to use and modify!
