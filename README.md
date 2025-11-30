# Smart Irrigation System

A comprehensive irrigation management system with area-based access control, farm distribution by survey numbers, and role-based permissions.

## Features

### 🏛️ Admin Features
- **Area Management**: Create and manage geographical areas
- **Employee Assignment**: Assign employees to specific areas
- **Farm Location Control**: Set exact GPS coordinates for farms
- **Survey Number Management**: Track farms by unique survey numbers
- **Farmer Details Management**: Complete farmer information with unique codes

### 👨‍💼 Employee Features
- **Area-Restricted Access**: Can only view farms in assigned area
- **Farm Monitoring**: Track irrigation status and schedules
- **Photo Documentation**: Upload photos when marking farms as watered
- **Mobile-Friendly Interface**: Responsive design for field use

### 🗺️ Map & Location Features
- **GPS Coordinates**: Precise farm locations set by admin
- **Interactive Maps**: View farms on map with status indicators
- **Boundary Management**: Define area boundaries using polygons

## Database Models

### Farm Model
```javascript
{
  farmerName: String,
  farmerPhone: String,
  farmerCode: String (unique),      // Unique farmer identification
  villageName: String,
  area: String,                     // Admin-controlled area
  surveyNumber: String (unique),    // Critical for distribution
  subSurveyNumber: String,          // Optional subdivision
  farmSize: Number,                 // In acres
  location: {
    type: "Point",
    coordinates: [lng, lat]         // Admin-controlled coordinates
  },
  cropType: String,
  soilType: String,
  irrigationMethod: String,
  assignedEmployee: ObjectId,       // Reference to User
  status: String,                   // active/inactive/maintenance
  lastWatered: Date,
  lastPhotoUrl: String
}
```

### Area Model
```javascript
{
  name: String (unique),
  code: String (unique),            // Area identification code
  district: String,
  state: String,
  boundary: {
    type: "Polygon",
    coordinates: [[Number]]         // Boundary coordinates
  },
  totalFarms: Number,
  totalArea: Number,                // Total area in acres
  assignedEmployees: [ObjectId],    // References to Users
  status: String                    // active/inactive
}
```

## API Endpoints

### Admin Endpoints
```
POST /api/admin/areas                     - Create new area
GET  /api/admin/areas                     - Get all areas
POST /api/admin/areas/assign-employee     - Assign employee to area

POST /api/admin/employees                 - Create employee (no area initially)
GET  /api/admin/employees                 - Get employees (filter by area)

POST /api/admin/farms                     - Create farm with full details
GET  /api/admin/farms                     - Get farms (filter options)
PUT  /api/admin/farms/:id/location        - Update farm location
POST /api/admin/farms/assign-employee     - Assign farms to employee
```

### Employee Endpoints
```
GET  /api/farms                           - Get assigned farms only
GET  /api/farms/survey-range             - Get farms by survey number range
POST /api/watering/mark                   - Mark farm as watered
```

## Setup Instructions

### 1. Environment Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 2. Database Seeding
```bash
# Create default admin user
npm run seed

# Create sample areas
npm run seed-areas
```

### 3. Start Development Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4. Default Login
- **Email**: admin@gmail.com
- **Password**: admin123

## Workflow

### 1. Admin Setup
1. Login as admin
2. Create areas using `POST /api/admin/areas`
3. Create employees using `POST /api/admin/employees`
4. Assign employees to areas using `POST /api/admin/areas/assign-employee`

### 2. Farm Management
1. Create farms with survey numbers using `POST /api/admin/farms`
2. Set precise GPS coordinates for each farm
3. Assign farms to employees for monitoring
4. Track farm status by survey number ranges

### 3. Employee Operations
1. Employees login and see only their assigned farms
2. Monitor irrigation schedules and farm status
3. Mark farms as watered with photo documentation
4. View farms organized by survey numbers

## Survey Number System

Survey numbers are critical for:
- **Farm Distribution**: Organize farms by geographical/administrative divisions
- **Easy Identification**: Quick farm lookup and reference
- **Legal Compliance**: Match official land records
- **Efficient Management**: Group farms for irrigation schedules

Example survey number format: `123/A`, `124/B`, `125/1A`

## Security Features

- **Role-Based Access**: Admins vs Employees
- **Area-Based Restrictions**: Employees see only assigned area farms
- **Secure Authentication**: JWT tokens with bcrypt password hashing
- **Input Validation**: Unique constraints on critical fields

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, Vite, TailwindCSS, Leaflet (maps)
- **Authentication**: JWT, bcrypt
- **File Uploads**: Multer
- **Geospatial**: MongoDB 2dsphere indexes

## 🚀 Deployment

### Quick Deploy (Recommended)

1. **Build for Production**:
   ```bash
   # Windows
   .\deploy.ps1
   
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Deploy to Render.com** (Free Tier):
   - See detailed guide in [DEPLOYMENT.md](DEPLOYMENT.md)
   - Setup MongoDB Atlas (free 512MB)
   - Deploy backend and frontend
   - Configure environment variables

### Deployment Options

| Platform | Cost | Best For |
|----------|------|----------|
| **Render.com** | Free tier | Full stack hosting (recommended) |
| **Vercel + Render** | Free | Fast frontend CDN + backend |
| **Railway.app** | $5/month credit | Quick full-stack setup |
| **MongoDB Atlas** | Free 512MB | Database hosting |

### Quick Links
- 📖 [Full Deployment Guide](DEPLOYMENT.md)
- 🗄️ [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- 🌐 [Render.com](https://render.com)
- ⚡ [Vercel](https://vercel.com)

### Production Checklist

- [ ] Setup MongoDB Atlas database
- [ ] Configure environment variables
- [ ] Update CORS settings with your domain
- [ ] Change default admin password
- [ ] Run production build
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Render/Vercel
- [ ] Test all features in production

## 📁 Project Structure

```
smart-irrigation/
├── backend/
│   ├── controllers/       # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth & validation
│   └── server.js         # Express app
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   └── services/     # API client
│   └── dist/             # Production build
├── DEPLOYMENT.md         # Detailed hosting guide
├── deploy.ps1           # Windows build script
└── deploy.sh            # Linux/Mac build script
```