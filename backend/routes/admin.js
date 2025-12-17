import express from 'express';
import { 
  createEmployee, 
  getEmployees, 
  createFarm, 
  getFarms,
  createArea,
  getAreas,
  assignEmployeeToArea,
  updateFarmLocation,
  assignEmployeeToFarms,
  getPendingFarmRequests,
  approveFarmRequest,
  rejectFarmRequest,
  getAllFarmers,
  getFarmerById,
  updateFarmer
} from '../controllers/adminController.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, requireAdmin);

// Area management
router.post('/areas', createArea);
router.get('/areas', getAreas);
router.post('/areas/assign-employee', assignEmployeeToArea);

// Employee management
router.post('/employees', createEmployee);
router.get('/employees', getEmployees);

// Farm management
router.post('/farms', createFarm);
router.get('/farms', getFarms);
router.put('/farms/:farmId/location', updateFarmLocation);
router.post('/farms/assign-employee', assignEmployeeToFarms);

// Farm approval workflow
router.get('/farms/pending', getPendingFarmRequests);
router.post('/farms/:farmId/approve', approveFarmRequest);
router.post('/farms/:farmId/reject', rejectFarmRequest);

// Farmer management
router.get('/farmers', getAllFarmers);
router.get('/farmers/:farmerId', getFarmerById);
router.put('/farmers/:farmerId', updateFarmer);

export default router;
