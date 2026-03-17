import Farm from '../models/Farm.js';

// Helper function to calculate polygon area from coordinates (in square meters)
// Using the Shoelace formula
const calculatePolygonArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[(i + 1) % coordinates.length];

    area += (lon1 * lat2) - (lon2 * lat1);
  }

  area = Math.abs(area) / 2;

  // Convert square degrees to square meters (approximate at equator)
  // 1 degree ≈ 111 km, so 1 square degree ≈ 12321 square km
  const areaInSquareMeters = area * 111000 * 111000;

  // Convert to acres (1 acre = 4046.86 square meters)
  const areaInAcres = areaInSquareMeters / 4046.86;

  return Math.round(areaInAcres * 100) / 100; // Round to 2 decimal places
};

// Get farms pending boundary survey for waterman
export const getSurveyPendingFarms = async (req, res) => {
  try {
    const farms = await Farm.find({
      'boundarySurvey.status': 'pending',
      $or: [
        { area: { $in: req.user.assignedAreas } },
        { area: req.user.area }
      ]
    })
      .select('ownerName farmerPhone farmerCode surveyNumber villageName taluka district farmSize')
      .sort({ createdAt: -1 });

    res.json(farms);
  } catch (error) {
    console.error('Error fetching survey pending farms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record a boundary survey point (GPS coordinate)
export const recordSurveyPoint = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check authorization - waterman can only record for farms in their areas
    if (!req.user.assignedAreas?.includes(farm.area) && req.user.area !== farm.area) {
      return res.status(403).json({ message: 'Not authorized to survey this farm' });
    }

    // Initialize boundary survey if not exists
    if (!farm.boundarySurvey) {
      farm.boundarySurvey = {
        status: 'pending',
        surveyPoints: []
      };
    }

    // Add the survey point
    farm.boundarySurvey.surveyPoints.push({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date(),
      accuracy: accuracy ? parseFloat(accuracy) : null
    });

    await farm.save();

    res.json({
      message: 'Survey point recorded successfully',
      pointCount: farm.boundarySurvey.surveyPoints.length,
      farm
    });
  } catch (error) {
    console.error('Error recording survey point:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit completed boundary survey
export const submitBoundarySurvey = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check authorization
    if (!req.user.assignedAreas?.includes(farm.area) && req.user.area !== farm.area) {
      return res.status(403).json({ message: 'Not authorized to survey this farm' });
    }

    if (!farm.boundarySurvey || farm.boundarySurvey.surveyPoints.length < 3) {
      return res.status(400).json({
        message: 'At least 3 survey points are required to form a polygon',
        currentPoints: farm.boundarySurvey?.surveyPoints.length || 0
      });
    }

    // Convert survey points to GeoJSON polygon coordinates
    const polygonCoordinates = farm.boundarySurvey.surveyPoints.map(point => [
      point.longitude,
      point.latitude
    ]);

    // Close the polygon by adding the first point at the end
    polygonCoordinates.push(polygonCoordinates[0]);

    // Calculate area
    const calculatedArea = calculatePolygonArea(polygonCoordinates);

    // Update farm with boundary survey data
    farm.boundarySurvey.coordinates = {
      type: 'Polygon',
      coordinates: [polygonCoordinates]
    };
    farm.boundarySurvey.recordedBy = req.user.id;
    farm.boundarySurvey.recordedAt = new Date();
    farm.boundarySurvey.status = 'submitted';

    // Update farm location to first survey point
    farm.location = {
      type: 'Point',
      coordinates: [
        farm.boundarySurvey.surveyPoints[0].longitude,
        farm.boundarySurvey.surveyPoints[0].latitude
      ]
    };

    // Update farm size based on calculated area
    farm.farmSize = calculatedArea;

    await farm.save();

    res.json({
      message: 'Boundary survey submitted successfully for supervisor approval',
      calculatedArea,
      surveyPoints: farm.boundarySurvey.surveyPoints.length,
      farm
    });
  } catch (error) {
    console.error('Error submitting boundary survey:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear survey points and restart (for waterman to correct survey)
export const clearSurveyPoints = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check authorization
    if (!req.user.assignedAreas?.includes(farm.area) && req.user.area !== farm.area) {
      return res.status(403).json({ message: 'Not authorized to modify this survey' });
    }

    // Only allow clearing before submission
    if (farm.boundarySurvey?.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot clear survey that has been submitted' });
    }

    // Reset survey points
    farm.boundarySurvey.surveyPoints = [];

    await farm.save();

    res.json({
      message: 'Survey points cleared successfully',
      farm
    });
  } catch (error) {
    console.error('Error clearing survey points:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get farm with current survey data (for waterman to see in real-time)
export const getFarmSurveyStatus = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId)
      .select('ownerName farmerCode surveyNumber boundarySurvey farmSize location');

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check authorization
    if (!req.user.assignedAreas?.includes(farm.area) && req.user.area !== farm.area) {
      return res.status(403).json({ message: 'Not authorized to view this farm' });
    }

    res.json({
      farm: {
        ...farm._doc,
        surveyPointCount: farm.boundarySurvey?.surveyPoints.length || 0,
        surveyStatus: farm.boundarySurvey?.status || 'pending'
      }
    });
  } catch (error) {
    console.error('Error fetching farm survey status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
