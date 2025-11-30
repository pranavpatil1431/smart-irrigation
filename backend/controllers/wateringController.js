import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Farm from '../models/Farm.js';
import WateringLog from '../models/WateringLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const markWatered = [
  upload.single('photo'),
  async (req, res) => {
    try {
      const { farmId, remarks, cropCondition, lat, lng } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'Photo is required' });
      }

      const farm = await Farm.findById(farmId);
      if (!farm) {
        return res.status(404).json({ message: 'Farm not found' });
      }

      // Update farm
      farm.lastWatered = new Date();
      farm.lastPhotoUrl = `/uploads/${req.file.filename}`;

      if (lat && lng) {
        farm.location = {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        };
      }

      await farm.save();

      // Create watering log
      const wateringLog = new WateringLog({
        farm: farm._id,
        employee: req.user.id,
        remarks,
        cropCondition,
        photoUrl: `/uploads/${req.file.filename}`,
        location: lat && lng ? {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        } : undefined
      });

      await wateringLog.save();

      res.json({ message: 'Watering recorded successfully', farm });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];
