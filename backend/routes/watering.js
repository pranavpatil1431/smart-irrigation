import express from 'express';
import { markWatered, getWateringLogs } from '../controllers/wateringController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/mark', markWatered);
router.get('/logs/:farmId', getWateringLogs);

export default router;
