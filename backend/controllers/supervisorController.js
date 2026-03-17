import Farm from '../models/Farm.js';

// Get all boundary surveys pending supervisor approval
export const getPendingBoundarySurveys = async (req, res) => {
  try {
    const surveys = await Farm.find({
      'boundarySurvey.status': 'submitted'
    })
      .populate('boundarySurvey.recordedBy', 'name email')
      .select('ownerName farmerCode surveyNumber farmSize boundarySurvey villageName')
      .sort({ 'boundarySurvey.recordedAt': -1 });

    res.json(surveys);
  } catch (error) {
    console.error('Error fetching pending surveys:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get survey detail with map visualization data
export const getSurveyDetail = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId)
      .populate('boundarySurvey.recordedBy', 'name email employeeId');

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.json({
      farm: {
        _id: farm._id,
        ownerName: farm.ownerName,
        farmerCode: farm.farmerCode,
        surveyNumber: farm.surveyNumber,
        villageName: farm.villageName,
        farmSize: farm.farmSize,
        location: farm.location,
        boundarySurvey: farm.boundarySurvey
      }
    });
  } catch (error) {
    console.error('Error fetching survey detail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve boundary survey
export const approveBoundarySurvey = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { notes } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (farm.boundarySurvey?.status !== 'submitted') {
      return res.status(400).json({ message: 'This survey is not pending approval' });
    }

    // Update boundary survey approval
    farm.boundarySurvey.status = 'approved';
    farm.boundarySurvey.approvedBy = req.user.id;
    farm.boundarySurvey.approvedAt = new Date();

    // Update farm status to active
    farm.status = 'active';
    farm.approvalStatus = 'approved';
    farm.approvedBy = req.user.id;
    farm.approvedAt = new Date();

    if (notes) {
      farm.notes = notes;
    }

    await farm.save();

    res.json({
      message: 'Boundary survey approved and farm activated',
      farm
    });
  } catch (error) {
    console.error('Error approving survey:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject boundary survey and request re-survey
export const rejectBoundarySurvey = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (farm.boundarySurvey?.status !== 'submitted') {
      return res.status(400).json({ message: 'This survey is not pending approval' });
    }

    // Reset boundary survey for re-submission
    farm.boundarySurvey.status = 'rejected';
    farm.boundarySurvey.rejectionReason = rejectionReason;
    farm.boundarySurvey.surveyPoints = []; // Clear points for new survey

    await farm.save();

    res.json({
      message: 'Boundary survey rejected - waterman can restart survey',
      rejectionReason,
      farm
    });
  } catch (error) {
    console.error('Error rejecting survey:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get waterRequest (water demand) from farmers
export const getWaterRequests = async (req, res) => {
  try {
    // This would get water requests from farmers - for future implementation
    res.json({ message: 'Water request endpoint' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/Assign new watermen
export const assignWaterman = async (req, res) => {
  try {
    const { watermanId, areas } = req.body;

    if (!watermanId || !areas || areas.length === 0) {
      return res.status(400).json({ message: 'Waterman ID and areas are required' });
    }

    // This would be implemented to assign areas to watermen
    res.json({ message: 'Waterman assignment endpoint' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
