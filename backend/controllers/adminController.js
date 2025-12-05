import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Area from '../models/Area.js';

// Area Management (Admin Only)
export const createArea = async (req, res) => {
  try {
    const { name, code, district, state, boundary, description } = req.body;

    const existingArea = await Area.findOne({ 
      $or: [{ name }, { code }] 
    });
    if (existingArea) {
      return res.status(400).json({ message: 'Area name or code already exists' });
    }

    const area = new Area({ name, code, district, state, boundary, description });
    await area.save();

    res.status(201).json({
      message: 'Area created successfully',
      area
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAreas = async (req, res) => {
  try {
    const areas = await Area.find({ status: 'active' })
      .populate('assignedEmployees', 'name email employeeId')
      .sort({ createdAt: -1 });

    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignEmployeeToArea = async (req, res) => {
  try {
    const { areaId, employeeId } = req.body;

    const area = await Area.findById(areaId);
    if (!area) {
      return res.status(404).json({ message: 'Area not found' });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee's area
    employee.area = area.name;
    await employee.save();

    // Add to area's assigned employees if not already assigned
    if (!area.assignedEmployees.includes(employeeId)) {
      area.assignedEmployees.push(employeeId);
      await area.save();
    }

    res.json({ message: 'Employee assigned to area successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Employee Management
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, employeeId } = req.body;
    // Note: area is not provided during creation - admin assigns later

    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User or employee ID already exists' });
    }

    const user = new User({ name, email, password, role: 'employee', employeeId });
    await user.save();

    res.status(201).json({
      message: 'Employee created successfully',
      user: { name: user.name, email: user.email, role: user.role, employeeId: user.employeeId }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, area } = req.query;
    
    let query = { role: 'employee' };
    if (area) {
      query.area = area;
    }

    const employees = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      employees,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Farm Management (Admin controls location and assignment)
export const createFarm = async (req, res) => {
  try {
    const { 
      farmerName, 
      farmerPhone, 
      farmerCode,
      villageName, 
      area, 
      surveyNumber,
      subSurveyNumber,
      farmSize,
      lat, 
      lng,
      cropType,
      soilType,
      irrigationMethod,
      assignedEmployeeId,
      notes 
    } = req.body;

    // Verify area exists
    const areaExists = await Area.findOne({ name: area });
    if (!areaExists) {
      return res.status(400).json({ message: 'Invalid area. Area must be created by admin first.' });
    }

    // Verify assigned employee
    let assignedEmployee = null;
    if (assignedEmployeeId) {
      assignedEmployee = await User.findById(assignedEmployeeId);
      if (!assignedEmployee || assignedEmployee.role !== 'employee') {
        return res.status(400).json({ message: 'Invalid assigned employee' });
      }
    }

    const farm = new Farm({
      farmerName,
      farmerPhone,
      farmerCode,
      villageName,
      area,
      surveyNumber,
      subSurveyNumber,
      farmSize,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      cropType,
      soilType,
      irrigationMethod,
      assignedEmployee: assignedEmployeeId,
      notes
    });

    await farm.save();

    // Update area statistics
    areaExists.totalFarms += 1;
    areaExists.totalArea += farmSize || 0;
    await areaExists.save();

    res.status(201).json({ message: 'Farm created successfully', farm });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.surveyNumber) {
        return res.status(400).json({ message: 'Survey number already exists' });
      }
      if (error.keyPattern.farmerCode) {
        return res.status(400).json({ message: 'Farmer code already exists' });
      }
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarms = async (req, res) => {
  try {
    const { area, assignedEmployee, surveyNumber } = req.query;
    
    let query = {};
    if (area) query.area = area;
    if (assignedEmployee) query.assignedEmployee = assignedEmployee;
    if (surveyNumber) query.surveyNumber = new RegExp(surveyNumber, 'i');

    const farms = await Farm.find(query)
      .populate('assignedEmployee', 'name email employeeId')
      .sort({ surveyNumber: 1 }); // Sort by survey number for easier distribution management

    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFarmLocation = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { lat, lng } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    farm.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    await farm.save();

    res.json({ message: 'Farm location updated successfully', farm });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignEmployeeToFarms = async (req, res) => {
  try {
    const { employeeId, farmIds } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Farm.updateMany(
      { _id: { $in: farmIds } },
      { assignedEmployee: employeeId }
    );

    res.json({ message: 'Farms assigned to employee successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending farm requests
export const getPendingFarmRequests = async (req, res) => {
  try {
    const pendingFarms = await Farm.find({ approvalStatus: 'pending' })
      .populate('createdBy', 'name email employeeId')
      .populate('assignedEmployee', 'name email')
      .sort({ createdAt: -1 });

    res.json(pendingFarms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve farm request
export const approveFarmRequest = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { location, latitude, longitude } = req.body; // Admin sets exact GPS coordinates

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (farm.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'Farm already processed' });
    }

    // Update farm with approval and set location
    farm.approvalStatus = 'approved';
    farm.status = 'active';
    farm.approvedBy = req.user.id;
    farm.approvedAt = new Date();
    
    // Handle location format - check for location object or individual lat/lng
    if (location && location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      farm.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    } else if (latitude || longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      // Only update if both are provided and valid
      if (latitude && longitude && !isNaN(lat) && !isNaN(lng) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
        farm.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
      // If coordinates provided but invalid, use existing farm location or default
      else if (!farm.location || !farm.location.coordinates) {
        farm.location = {
          type: 'Point',
          coordinates: [0, 0]
        };
      }
    } else {
      // No new coordinates provided - ensure location has valid coordinates
      if (!farm.location || !farm.location.coordinates) {
        farm.location = {
          type: 'Point',
          coordinates: [0, 0]
        };
      }
    }

    await farm.save();

    res.json({ 
      message: 'Farm approved successfully',
      farm 
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject farm request
export const rejectFarmRequest = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { reason } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (farm.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'Farm already processed' });
    }

    farm.approvalStatus = 'rejected';
    farm.rejectionReason = reason;
    farm.approvedBy = req.user.id;
    farm.approvedAt = new Date();

    await farm.save();

    res.json({ 
      message: 'Farm request rejected',
      farm 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
