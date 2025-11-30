import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }, // Area code for identification
  district: { type: String, required: true },
  state: { type: String, required: true },
  boundary: {
    type: { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: [[[Number]]] // Array of coordinate arrays defining the area boundary
  },
  description: { type: String },
  totalFarms: { type: Number, default: 0 },
  totalArea: { type: Number, default: 0 }, // Total area in acres
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

areaSchema.index({ boundary: '2dsphere' });
areaSchema.index({ code: 1 }, { unique: true });
areaSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Area', areaSchema);