import express from 'express';
import { markWatered } from '../controllers/wateringController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/mark', markWatered);

export default router;
