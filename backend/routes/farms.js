import express from 'express';
import { getFarms, getFarmsBySurveyRange, createFarmRequest, updateFarmMaintenance } from '../controllers/farmsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getFarms);
router.get('/survey-range', getFarmsBySurveyRange);
router.post('/create-request', createFarmRequest); // Employee creates farm request
router.put('/:farmId/maintenance', updateFarmMaintenance); // Employee updates watering cycle, etc.

export default router;
