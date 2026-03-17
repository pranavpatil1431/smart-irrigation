import express from 'express';
import {
  getSurveyPendingFarms,
  recordSurveyPoint,
  submitBoundarySurvey,
  clearSurveyPoints,
  getFarmSurveyStatus
} from '../controllers/watermanController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get farms pending boundary survey for waterman
router.get('/survey-pending', getSurveyPendingFarms);

// Get current survey status
router.get('/survey-status/:farmId', getFarmSurveyStatus);

// Record a boundary survey point
router.post('/record-point/:farmId', recordSurveyPoint);

// Submit completed boundary survey
router.post('/submit-survey/:farmId', submitBoundarySurvey);

// Clear survey points and restart
router.post('/clear-survey/:farmId', clearSurveyPoints);

export default router;
