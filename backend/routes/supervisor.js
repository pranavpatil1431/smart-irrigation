import express from 'express';
import {
  getPendingBoundarySurveys,
  getSurveyDetail,
  approveBoundarySurvey,
  rejectBoundarySurvey,
  getWaterRequests,
  assignWaterman
} from '../controllers/supervisorController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all boundary surveys pending approval
router.get('/surveys/pending', getPendingBoundarySurveys);

// Get survey detail for review
router.get('/surveys/:farmId', getSurveyDetail);

// Approve boundary survey
router.post('/surveys/:farmId/approve', approveBoundarySurvey);

// Reject boundary survey
router.post('/surveys/:farmId/reject', rejectBoundarySurvey);

// Get water requests from farmers
router.get('/water-requests', getWaterRequests);

// Assign waterman to areas
router.post('/assign-waterman', assignWaterman);

export default router;
