import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    area: '',
    employeeId: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/admin/employees')
      setEmployees(data.employees)
    } catch (error) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/employees', formData)
      toast.success('Employee created successfully!')
      setShowModal(false)
      setFormData({ name: '', email: '', password: '', area: '', employeeId: '' })
      fetchEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create employee')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-irrigation-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading employees...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-lg px-8 h-14"
          >
            + Add Employee
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-irrigation-100 text-irrigation-800 text-xs font-semibold rounded-full">
                        {employee.area}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employeeId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-irrigation-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-irrigation-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-irrigation-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Area/Zone *</label>
                <input
                  type="text"
                  required
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  placeholder="e.g. Sector A, Zone 1"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-irrigation-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Employee ID (optional)</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-irrigation-500"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-irrigation-500 text-white py-3 px-4 rounded-lg hover:bg-irrigation-600">
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
