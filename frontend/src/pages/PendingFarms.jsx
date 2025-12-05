import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function PendingFarms() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [approvalData, setApprovalData] = useState({
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchPendingFarms();
  }, []);

  const fetchPendingFarms = async () => {
    try {
      const response = await api.get('/admin/farms/pending');
      setFarms(response.data);
    } catch (error) {
      console.error('Error fetching pending farms:', error);
      toast.error('Failed to load pending farms');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (farmId) => {
    try {
      let approvePayload = {};
      
      // Only include coordinates if they are provided
      if (approvalData.latitude && approvalData.longitude) {
        const lat = parseFloat(approvalData.latitude);
        const lng = parseFloat(approvalData.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          approvePayload.latitude = lat;
          approvePayload.longitude = lng;
        }
      }

      const response = await api.post(`/admin/farms/${farmId}/approve`, approvePayload);
      toast.success('Farm approved successfully!');
      setSelectedFarm(null);
      setApprovalData({ latitude: '', longitude: '' });
      fetchPendingFarms();
    } catch (error) {
      console.error('Error approving farm:', error);
      toast.error(error.response?.data?.message || 'Failed to approve farm');
    }
  };

  const handleReject = async (farmId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await api.post(`/admin/farms/${farmId}/reject`, { reason });
      toast.success('Farm rejected');
      fetchPendingFarms();
    } catch (error) {
      console.error('Error rejecting farm:', error);
      toast.error('Failed to reject farm');
    }
  };

  const openApprovalModal = (farm) => {
    setSelectedFarm(farm);
    // Pre-fill with employee-provided coordinates if available
    if (farm.location?.coordinates && farm.location.coordinates[0] !== 0) {
      setApprovalData({
        longitude: farm.location.coordinates[0].toString(),
        latitude: farm.location.coordinates[1].toString()
      });
    } else {
      setApprovalData({ latitude: '', longitude: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending farms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:ml-64 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Pending Farm Requests
            <span className="ml-3 text-sm font-normal bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              {farms.length} pending
            </span>
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </div>

        {farms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Pending Requests
            </h2>
            <p className="text-gray-500">All farm requests have been processed</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {farms.map((farm) => (
              <div key={farm._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Owner & Location Info */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Owner Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Name:</span> <strong>{farm.ownerName}</strong></p>
                      <p><span className="text-gray-600">Phone:</span> {farm.farmerPhone}</p>
                      <p><span className="text-gray-600">Farmer Code:</span> {farm.farmerCode}</p>
                      <p><span className="text-gray-600">Survey No:</span> <strong>{farm.surveyNumber}</strong>
                        {farm.subSurveyNumber && `/${farm.subSurveyNumber}`}
                      </p>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Location</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Village:</span> {farm.villageName}</p>
                      <p><span className="text-gray-600">Taluka:</span> {farm.taluka}</p>
                      <p><span className="text-gray-600">District:</span> {farm.district}</p>
                      <p><span className="text-gray-600">Area:</span> {farm.area}</p>
                      {farm.location?.coordinates && farm.location.coordinates[0] !== 0 && (
                        <p className="text-green-600">
                          <span className="text-gray-600">GPS:</span> {farm.location.coordinates[1].toFixed(4)}, {farm.location.coordinates[0].toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Farm Details */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Farm Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Size:</span> {farm.farmSize} acres</p>
                      <p><span className="text-gray-600">Soil:</span> {farm.soilType}</p>
                      <p><span className="text-gray-600">Crop:</span> {farm.cropType}</p>
                      <p><span className="text-gray-600">Watering Cycle:</span> {farm.wateringCycle} days</p>
                      <p><span className="text-gray-600">Irrigation:</span> {farm.irrigationMethod}</p>
                    </div>
                  </div>
                </div>

                {farm.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600"><strong>Notes:</strong> {farm.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleReject(farm._id)}
                    className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openApprovalModal(farm)}
                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {selectedFarm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Approve Farm: {selectedFarm.surveyNumber}
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  {selectedFarm.location?.coordinates && selectedFarm.location.coordinates[0] !== 0
                    ? 'Employee provided GPS coordinates. You can update them or keep as is:'
                    : 'Set GPS coordinates for this farm (optional):'}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={approvalData.latitude}
                      onChange={(e) => setApprovalData({ ...approvalData, latitude: e.target.value })}
                      placeholder="e.g., 18.5204"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={approvalData.longitude}
                      onChange={(e) => setApprovalData({ ...approvalData, longitude: e.target.value })}
                      placeholder="e.g., 73.8567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedFarm(null);
                    setApprovalData({ latitude: '', longitude: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(selectedFarm._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
