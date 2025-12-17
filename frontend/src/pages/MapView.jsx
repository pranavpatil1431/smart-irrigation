import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'
import api from '../services/api'

// Fix for default leaflet markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapView = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [user, setUser] = useState(null)
  const center = [19.0760, 72.8777] // Mumbai default

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchFarms()
  }, [])

  const fetchFarms = async () => {
    try {
      const { data } = await api.get('/farms')
      setFarms(data)
    } catch (error) {
      toast.error('Failed to load farms')
    } finally {
      setLoading(false)
    }
  }

  const getMarkerColor = (status) => {
    switch (status) {
      case 'ok': return '#10b981' // green
      case 'soon': return '#f59e0b' // yellow
      case 'overdue': return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  }

  const handleMarkWatered = (farm) => {
    setSelectedFarm(farm)
  }

  const submitWatering = async (e) => {
    e.preventDefault()

    if (!selectedFarm) return

    const formData = new FormData(e.target)
    formData.append('farmId', selectedFarm._id)

    // Get current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        formData.append('lat', position.coords.latitude)
        formData.append('lng', position.coords.longitude)

        try {
          await api.post('/watering/mark', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          toast.success('Watering recorded successfully!')
          setSelectedFarm(null)
          fetchFarms() // Refresh data
        } catch (error) {
          toast.error('Failed to record watering')
        }
      },
      () => {
        // No geolocation, submit without location
        submitFormData(formData)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const submitFormData = async (formData) => {
    try {
      await api.post('/watering/mark', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Watering recorded successfully!')
      setSelectedFarm(null)
      fetchFarms()
    } catch (error) {
      toast.error('Failed to record watering')
    }
  }

  const closeModal = () => {
    setSelectedFarm(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-irrigation-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col lg:ml-64">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'All Farms' : `Area: ${user?.area}`}
            </h1>
            <p className="text-gray-600">
              {farms.length} farms • {farms.filter(f => f.status === 'overdue').length} overdue
            </p>
          </div>
          <button
            onClick={fetchFarms}
            className="btn-secondary px-4 py-2"
          >
            Refresh
          </button>
        </div>

        {/* Legend */}
        <div className="max-w-7xl mx-auto flex items-center space-x-8 mt-3 px-2">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>0-20 days</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span>21-25 days</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>&gt;25 days (Urgent)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {farms.map((farm) => {
            const [lng, lat] = farm.location.coordinates
            return (
              <Marker
                key={farm._id}
                position={[lat, lng]}
                icon={L.divIcon({
                  html: `<div style="
                    background: ${getMarkerColor(farm.status)};
                    width: 24px; height: 24px; 
                    border-radius: 50%; 
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  "></div>`,
                  iconSize: [30, 30],
                  className: 'marker-custom'
                })}
              >
                <Popup>
                  <div className="min-w-64">
                    <h3 className="font-bold text-lg mb-2">{farm.farmerName}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {farm.villageName}, {farm.area}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>{farm.daysSinceWatered} days</strong> since last watering
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        farm.status === 'ok' ? 'bg-green-100 text-green-800' :
                        farm.status === 'soon' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {farm.status === 'overdue' ? 'URGENT' : farm.status.toUpperCase()}
                      </span>
                    </p>
                    {farm.lastPhotoUrl && (
                      <img
                        src={`http://localhost:5000${farm.lastPhotoUrl}`}
                        alt="Last photo"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    <button
                      onClick={() => handleMarkWatered(farm)}
                      className="w-full btn-primary text-sm py-2"
                    >
                      💧 Mark Watered Now
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Watering Modal */}
      {selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedFarm(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Watering: {selectedFarm.farmerName}
              </h2>
              <p className="text-gray-600">{selectedFarm.villageName}, {selectedFarm.area}</p>
            </div>

            <form onSubmit={submitWatering} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (optional)
                </label>
                <textarea
                  name="remarks"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-irrigation-500 focus:border-transparent"
                  placeholder="Any observations about the farm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Condition *
                </label>
                <select
                  name="cropCondition"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-irrigation-500 focus:border-transparent"
                >
                  <option value="">Select condition</option>
                  <option value="Good">Good 🌱</option>
                  <option value="Medium">Medium ⚡</option>
                  <option value="Poor">Poor ⚠️</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo * (Camera will open on mobile)
                </label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  capture="environment"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-irrigation-50 file:text-irrigation-700 hover:file:bg-irrigation-100"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary text-lg"
                >
                  ✅ Record Watering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapView
