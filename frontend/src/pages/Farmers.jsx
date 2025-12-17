import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Farmers() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [wateringHistory, setWateringHistory] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/admin/farmers', {
        params: { limit: 100, search: searchTerm }
      });
      setFarmers(response.data.farmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      toast.error('Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchFarmers();
  };

  const viewFarmerDetails = async (farmer) => {
    setSelectedFarmer(farmer);
    setEditMode(false);
    setEditData({
      ownerName: farmer.ownerName,
      farmerPhone: farmer.farmerPhone,
      farmerCode: farmer.farmerCode,
      surveyNumber: farmer.surveyNumber,
      subSurveyNumber: farmer.subSurveyNumber || '',
      villageName: farmer.villageName,
      taluka: farmer.taluka,
      district: farmer.district,
      farmSize: farmer.farmSize,
      soilType: farmer.soilType,
      cropType: farmer.cropType,
      wateringCycle: farmer.wateringCycle,
      irrigationMethod: farmer.irrigationMethod,
      latitude: farmer.location?.coordinates[1] || '',
      longitude: farmer.location?.coordinates[0] || '',
      notes: farmer.notes || ''
    });
    
    // Fetch watering history
    try {
      const response = await api.get(`/watering/logs/${farmer._id}`);
      setWateringHistory(response.data);
    } catch (error) {
      console.error('Error fetching watering history:', error);
      setWateringHistory([]);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateFarmer = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/farmers/${selectedFarmer._id}`, editData);
      toast.success('Farmer information updated successfully!');
      setEditMode(false);
      setSelectedFarmer(null);
      fetchFarmers();
    } catch (error) {
      console.error('Error updating farmer:', error);
      toast.error(error.response?.data?.message || 'Failed to update farmer');
    }
  };

  const getDaysSinceWatered = (lastWatered) => {
    if (!lastWatered) return 'Never';
    const days = Math.floor((Date.now() - new Date(lastWatered)) / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  };

  const getStatusColor = (lastWatered, wateringCycle) => {
    if (!lastWatered) return 'bg-red-100 text-red-800';
    const days = Math.floor((Date.now() - new Date(lastWatered)) / (1000 * 60 * 60 * 24));
    if (days <= wateringCycle - 5) return 'bg-green-100 text-green-800';
    if (days <= wateringCycle) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleMarkAsWatered = async (farmerId, e) => {
    e.stopPropagation(); // Prevent opening the detail modal
    try {
      await api.post(`/watering/${farmerId}`, {
        date: new Date().toISOString(),
        remarks: 'Marked as watered from Farmers section'
      });
      toast.success('Farm marked as watered!');
      fetchFarmers(); // Refresh the list
    } catch (error) {
      console.error('Error marking farm as watered:', error);
      toast.error('Failed to mark farm as watered');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 lg:ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:ml-64 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            👨‍🌾 Farmers Directory
            <span className="ml-3 text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {farmers.length} farmers
            </span>
          </h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by owner name, farmer code, or survey number..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setLoading(true);
                  fetchFarmers();
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Farmers List */}
        {farmers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Farmers Found
            </h2>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {farmers.map((farmer) => (
              <div
                key={farmer._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => viewFarmerDetails(farmer)}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {farmer.ownerName}
                    </h3>
                    <p className="text-sm text-gray-600">Code: {farmer.farmerCode}</p>
                    <p className="text-sm text-gray-600">📞 {farmer.farmerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Survey: <strong>{farmer.surveyNumber}</strong></p>
                    <p className="text-sm text-gray-600">Village: {farmer.villageName}</p>
                    <p className="text-sm text-gray-600">District: {farmer.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Size: {farmer.farmSize} acres</p>
                    <p className="text-sm text-gray-600">Crop: {farmer.cropType}</p>
                    <p className="text-sm text-gray-600">Soil: {farmer.soilType}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Watering: Every {farmer.wateringCycle} days</p>
                        <p className="text-sm text-gray-600">Last: {getDaysSinceWatered(farmer.lastWatered)}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(farmer.lastWatered, farmer.wateringCycle).replace('text-', 'bg-').split(' ')[0]}`} title="Watering status"></div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        farmer.status === 'active' ? 'bg-green-100 text-green-800' :
                        farmer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {farmer.status}
                      </span>
                      {farmer.status === 'active' && (
                        <button
                          onClick={(e) => handleMarkAsWatered(farmer._id, e)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                          title="Mark as watered"
                        >
                          💧 Water
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Farmer Details Modal */}
        {selectedFarmer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editMode ? '✏️ Edit Farmer' : '👨‍🌾 Farmer Details'}
                </h2>
                <button
                  onClick={() => {
                    setSelectedFarmer(null);
                    setEditMode(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateFarmer} className="p-6 space-y-6">
                  {/* Owner Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Owner Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                        <input
                          type="text"
                          name="ownerName"
                          value={editData.ownerName}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="farmerPhone"
                          value={editData.farmerPhone}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Code *</label>
                        <input
                          type="text"
                          name="farmerCode"
                          value={editData.farmerCode}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Survey Number *</label>
                        <input
                          type="text"
                          name="surveyNumber"
                          value={editData.surveyNumber}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Survey Number</label>
                        <input
                          type="text"
                          name="subSurveyNumber"
                          value={editData.subSurveyNumber}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Village Name *</label>
                        <input
                          type="text"
                          name="villageName"
                          value={editData.villageName}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Taluka *</label>
                        <input
                          type="text"
                          name="taluka"
                          value={editData.taluka}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                        <input
                          type="text"
                          name="district"
                          value={editData.district}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Farm Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Farm Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres) *</label>
                        <input
                          type="number"
                          name="farmSize"
                          value={editData.farmSize}
                          onChange={handleEditChange}
                          required
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type *</label>
                        <select
                          name="soilType"
                          value={editData.soilType}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="clay">Clay</option>
                          <option value="loam">Loam</option>
                          <option value="sandy">Sandy</option>
                          <option value="silt">Silt</option>
                          <option value="black">Black Soil</option>
                          <option value="red">Red Soil</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type *</label>
                        <input
                          type="text"
                          name="cropType"
                          value={editData.cropType}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Watering Cycle (days) *</label>
                        <input
                          type="number"
                          name="wateringCycle"
                          value={editData.wateringCycle}
                          onChange={handleEditChange}
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Method *</label>
                        <select
                          name="irrigationMethod"
                          value={editData.irrigationMethod}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="drip">Drip Irrigation</option>
                          <option value="sprinkler">Sprinkler</option>
                          <option value="flood">Flood/Traditional</option>
                          <option value="furrow">Furrow</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">GPS Coordinates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="text"
                          name="latitude"
                          value={editData.latitude}
                          onChange={handleEditChange}
                          placeholder="e.g., 18.5204"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="text"
                          name="longitude"
                          value={editData.longitude}
                          onChange={handleEditChange}
                          placeholder="e.g., 73.8567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={editData.notes}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 space-y-6">
                  {/* View Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Owner Information</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {selectedFarmer.ownerName}</p>
                        <p><strong>Phone:</strong> {selectedFarmer.farmerPhone}</p>
                        <p><strong>Farmer Code:</strong> {selectedFarmer.farmerCode}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Location</h3>
                      <div className="space-y-2">
                        <p><strong>Survey No:</strong> {selectedFarmer.surveyNumber}{selectedFarmer.subSurveyNumber && `/${selectedFarmer.subSurveyNumber}`}</p>
                        <p><strong>Village:</strong> {selectedFarmer.villageName}</p>
                        <p><strong>Taluka:</strong> {selectedFarmer.taluka}</p>
                        <p><strong>District:</strong> {selectedFarmer.district}</p>
                        {selectedFarmer.area && <p><strong>Area:</strong> {selectedFarmer.area}</p>}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Farm Details</h3>
                      <div className="space-y-2">
                        <p><strong>Size:</strong> {selectedFarmer.farmSize} acres</p>
                        <p><strong>Soil Type:</strong> {selectedFarmer.soilType}</p>
                        <p><strong>Crop Type:</strong> {selectedFarmer.cropType}</p>
                        <p><strong>Irrigation:</strong> {selectedFarmer.irrigationMethod}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Watering Info</h3>
                      <div className="space-y-2">
                        <p><strong>Cycle:</strong> Every {selectedFarmer.wateringCycle} days</p>
                        <p><strong>Last Watered:</strong> {getDaysSinceWatered(selectedFarmer.lastWatered)}</p>
                        <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedFarmer.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedFarmer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{selectedFarmer.status}</span></p>
                      </div>
                    </div>
                  </div>

                  {selectedFarmer.location && selectedFarmer.location.coordinates[0] !== 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">GPS Coordinates</h3>
                      <p><strong>Latitude:</strong> {selectedFarmer.location.coordinates[1]}</p>
                      <p><strong>Longitude:</strong> {selectedFarmer.location.coordinates[0]}</p>
                    </div>
                  )}

                  {selectedFarmer.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Notes</h3>
                      <p className="text-gray-600">{selectedFarmer.notes}</p>
                    </div>
                  )}

                  {/* Watering History */}
                  {wateringHistory.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Watering History</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {wateringHistory.map((log) => (
                          <div key={log._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                              {/* Photo */}
                              {log.photoUrl && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={log.photoUrl}
                                    alt="Watering photo"
                                    className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedPhoto(log.photoUrl)}
                                  />
                                </div>
                              )}
                              
                              {/* Details */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-500">
                                    {new Date(log.timestamp).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    log.cropCondition === 'Good' ? 'bg-green-100 text-green-800' :
                                    log.cropCondition === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {log.cropCondition}
                                  </span>
                                </div>
                                {log.employee && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    <strong>Employee:</strong> {log.employee.name}
                                  </p>
                                )}
                                {log.remarks && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Remarks:</strong> {log.remarks}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      ✏️ Edit Farmer Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Viewer Modal */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedPhoto}
              alt="Watering photo full view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
