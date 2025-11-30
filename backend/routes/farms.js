import express from 'express';
import { getFarms, getFarmsBySurveyRange, createFarmRequest } from '../controllers/farmsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getFarms);
router.get('/survey-range', getFarmsBySurveyRange);
router.post('/create-request', createFarmRequest); // Employee creates farm request

export default router;
