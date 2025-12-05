import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFarms: 0,
    overdueFarms: 0,
    dueSoonFarms: 0,
    totalEmployees: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [{ data: farms }, { data: employees }] = await Promise.all([
        api.get('/farms'),
        api.get('/admin/employees')
      ])

      const overdue = farms.filter(f => f.status === 'overdue').length
      const dueSoon = farms.filter(f => f.status === 'soon').length

      setStats({
        totalFarms: farms.length,
        overdueFarms: overdue,
        dueSoonFarms: dueSoon,
        totalEmployees: employees.employees?.length || 0
      })
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-irrigation-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:ml-64 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Add Farmer Button */}
        <div className="mb-6 flex justify-end">
          <Link
            to="/add-farmer"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Farmer
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card p-8 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalFarms}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Farms</div>
          </div>

          <div className="card p-8 text-center">
            <div className={`text-3xl font-bold mb-2 ${stats.overdueFarms > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {stats.overdueFarms}
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Overdue (Red)</div>
          </div>

          <div className="card p-8 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">{stats.dueSoonFarms}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Due Soon (Yellow)</div>
          </div>

          <div className="card p-8 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Employees</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Link
            to="/map"
            className="block card p-10 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-5xl mb-6 mx-auto">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Map View</h3>
            <p className="text-gray-600 mb-8">View all farms on interactive map with color-coded status</p>
            <div className="btn-primary inline-block">Open Map</div>
          </Link>

          {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
            <Link
              to="/admin/pending-farms"
              className="block card p-10 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-yellow-300"
            >
              <div className="text-5xl mb-6 mx-auto">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pending Approvals</h3>
              <p className="text-gray-600 mb-8">Review and approve farm requests from employees</p>
              <div className="btn-primary inline-block bg-yellow-600 hover:bg-yellow-700">View Requests</div>
            </Link>
          )}

          <div className="card p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Status Legend</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900">Green</div>
                  <div className="text-sm text-gray-600">0-20 days since last watering</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900">Yellow</div>
                  <div className="text-sm text-gray-600">21-25 days since last watering</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900">Red</div>
                  <div className="text-sm text-gray-600">Over 25 days - Urgent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Dashboard
