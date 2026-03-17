import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  // Owner Details
  ownerName: { type: String, required: true },
  farmerPhone: { type: String, required: true },
  farmerCode: { type: String, required: true }, // Unique farmer identification
  
  // Location Details
  surveyNumber: { type: String, required: true }, // Critical for farm distribution
  subSurveyNumber: { type: String }, // Optional sub-division
  villageName: { type: String, required: true },
  taluka: { type: String, required: true },
  district: { type: String, required: true },
  area: { type: String }, // Admin controlled area (optional for admin-created farms)
  
  // Farm Details
  farmSize: { type: Number, required: true }, // in acres
  soilType: { type: String, required: true },
  cropType: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  
  // Watering Details
  wateringCycle: { type: Number, default: 7 }, // days between watering
  lastWatered: { type: Date },
  irrigationMethod: { type: String, enum: ['drip', 'sprinkler', 'flood', 'furrow'], default: 'drip' },
  
  // Status (Green/Yellow/Red based on days since last watered)
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'pending', 'survey_pending'],
    default: 'survey_pending'
  },

  // Boundary Survey Details (recorded by waterman)
  boundarySurvey: {
    coordinates: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: [[[Number]]] // GeoJSON Polygon [[lng, lat], ...]
    },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Waterman reference
    recordedAt: { type: Date },
    surveyPoints: [{ // Array of individual point recordings
      latitude: Number,
      longitude: Number,
      timestamp: Date,
      accuracy: Number // GPS accuracy in meters
    }],
    status: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Supervisor approval
    rejectionReason: { type: String }
  },
  
  // Photos and Notes
  photos: [{ type: String }], // Array of photo URLs
  lastPhotoUrl: { type: String },
  notes: { type: String },
  
  // Assignment
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Approval Workflow
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

// 2dsphere index for geospatial queries
farmSchema.index({ location: '2dsphere' });
farmSchema.index({ 'boundarySurvey.coordinates': '2dsphere' });
farmSchema.index({ area: 1 });
farmSchema.index({ surveyNumber: 1 }, { unique: true });
farmSchema.index({ farmerCode: 1 }, { unique: true });
farmSchema.index({ assignedEmployee: 1 });

export default mongoose.model('Farm', farmSchema);
