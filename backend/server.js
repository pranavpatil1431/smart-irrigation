import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import farmsRoutes from './routes/farms.js';
import wateringRoutes from './routes/watering.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Validate required environment variables early
const requiredEnvs = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter((k) => !process.env[k]);
if (missingEnvs.length) {
  console.error(`❌ Missing required env vars: ${missingEnvs.join(', ')}`);
  process.exit(1);
}

// Ensure uploads directory exists (configurable via UPLOAD_PATH)
const uploadPath = process.env.UPLOAD_PATH || 'uploads';
const uploadsDir = path.resolve(uploadPath);
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Uploads directory ready: ${uploadsDir}`);
} catch (err) {
  console.error('❌ Failed to create uploads directory:', err);
  process.exit(1);
}

// Middleware
// CORS configuration - allows multiple origins for production and development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL // Add your production frontend URL here
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farms', farmsRoutes);
app.use('/api/watering', wateringRoutes);

// Lightweight health endpoint for quick checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Admin routes
app.post('/api/admin/areas', (req, res) => {
  // Create new area
  res.json({ message: 'Area created successfully' });
});
app.get('/api/admin/areas', (req, res) => {
  // Get all areas
  res.json({ message: 'Areas retrieved successfully' });
});
app.post('/api/admin/areas/assign-employee', (req, res) => {
  // Assign employee to area
  res.json({ message: 'Employee assigned successfully' });
});
app.put('/api/admin/farms/:id/location', (req, res) => {
  // Update farm location
  res.json({ message: 'Farm location updated successfully' });
});
app.get('/api/farms/survey-range', (req, res) => {
  // Get farms by survey number range
  res.json({ message: 'Farms retrieved successfully' });
});
