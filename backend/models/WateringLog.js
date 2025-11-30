import mongoose from 'mongoose';

const wateringLogSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String },
  cropCondition: { type: String, enum: ['Good', 'Medium', 'Poor'], required: true },
  photoUrl: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [lng, lat]
  }
});

export default mongoose.model('WateringLog', wateringLogSchema);
