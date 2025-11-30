import Farm from '../models/Farm.js';

const getDaysSinceLastWatered = (lastWatered) => {
  if (!lastWatered) return 999;
  return Math.floor((Date.now() - new Date(lastWatered)) / (1000 * 60 * 60 * 24));
};

const getFarmStatus = (days) => {
  if (days <= 20) return 'ok';
  if (days <= 25) return 'soon';
  return 'overdue';
};

export const getFarms = async (req, res) => {
  try {
    let query = {};

    // Employees can only see farms in their assigned area or farms assigned to them
    if (req.user.role === 'employee') {
      query = {
        $or: [
          { area: req.user.area },
          { assignedEmployee: req.user.id }
        ]
      };
    }

    const { status, surveyNumber, assignedEmployee } = req.query;
    
    // Add status filter
    if (status) {
      query = { ...query, $expr: {
        $cond: {
          if: { $eq: [status, 'ok'] },
          then: { $lte: [{ $divide: [{ $subtract: [new Date(), '$lastWatered'] }, 1000*60*60*24] }, 20] },
          else: {
            $cond: {
              if: { $eq: [status, 'soon'] },
              then: { 
                $and: [
                  { $gt: [{ $divide: [{ $subtract: [new Date(), '$lastWatered'] }, 1000*60*60*24] }, 20] },
                  { $lte: [{ $divide: [{ $subtract: [new Date(), '$lastWatered'] }, 1000*60*60*24] }, 25] }
                ]
              },
              else: { $gt: [{ $divide: [{ $subtract: [new Date(), '$lastWatered'] }, 1000*60*60*24] }, 25] }
            }
          }
        }
      }};
    }

    // Add survey number filter
    if (surveyNumber) {
      query.surveyNumber = new RegExp(surveyNumber, 'i');
    }

    // Add assigned employee filter (for admin)
    if (assignedEmployee && req.user.role === 'admin') {
      query.assignedEmployee = assignedEmployee;
    }

    const farms = await Farm.find(query)
      .populate('assignedEmployee', 'name email employeeId')
      .sort({ surveyNumber: 1, createdAt: -1 });

    // Add computed fields
    const farmsWithStatus = farms.map(farm => ({
      ...farm._doc,
      daysSinceWatered: getDaysSinceLastWatered(farm.lastWatered),
      status: getFarmStatus(getDaysSinceLastWatered(farm.lastWatered))
    }));

    res.json(farmsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarmsBySurveyRange = async (req, res) => {
  try {
    const { startSurvey, endSurvey, area } = req.query;
    
    let query = {};
    
    // Employees can only see farms in their assigned area
    if (req.user.role === 'employee') {
      query.area = req.user.area;
    } else if (area) {
      query.area = area;
    }

    // Add survey number range filter
    if (startSurvey && endSurvey) {
      query.surveyNumber = {
        $gte: startSurvey,
        $lte: endSurvey
      };
    }

    const farms = await Farm.find(query)
      .populate('assignedEmployee', 'name email employeeId')
      .sort({ surveyNumber: 1 });

    res.json({
      farms,
      totalFarms: farms.length,
      totalArea: farms.reduce((sum, farm) => sum + (farm.farmSize || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Employee creates farm (requires admin approval)
export const createFarmRequest = async (req, res) => {
  try {
    const {
      ownerName,
      farmerPhone,
      farmerCode,
      surveyNumber,
      subSurveyNumber,
      villageName,
      taluka,
      district,
      farmSize,
      soilType,
      cropType,
      wateringCycle,
      irrigationMethod,
      notes,
      latitude,
      longitude
    } = req.body;

    // Get employee's assigned area
    const employeeArea = req.user.area;

    // Validate coordinates if provided
    let coordinates = [0, 0]; // Default
    if (longitude && latitude) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      
      if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
        coordinates = [lng, lat];
      }
    }

    // Create farm with pending approval
    const farm = new Farm({
      ownerName,
      farmerPhone,
      farmerCode,
      surveyNumber,
      subSurveyNumber,
      villageName,
      taluka,
      district,
      area: employeeArea,
      farmSize,
      soilType,
      cropType,
      wateringCycle: wateringCycle || 7,
      irrigationMethod: irrigationMethod || 'drip',
      notes,
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      createdBy: req.user.id,
      assignedEmployee: req.user.id,
      approvalStatus: 'pending',
      status: 'pending'
    });

    await farm.save();
    
    res.status(201).json({ 
      message: 'Farm request submitted for admin approval',
      farm 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Survey number or farmer code already exists' 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
