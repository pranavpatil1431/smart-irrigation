import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', formData)

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      toast.success('Login successful!')

      if (data.user.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/map')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLoginAdmin = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: 'admin@gmail.com',
        password: 'admin123'
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      toast.success('Admin login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-irrigation-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-irrigation-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">💧</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Irrigation</h1>
            <p className="text-gray-600 text-lg">Login to manage farms</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-irrigation-500 focus:border-transparent transition-all"
                placeholder="admin@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-irrigation-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg h-14"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={quickLoginAdmin}
              disabled={loading}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors h-14"
            >
              🚀 Quick Admin Login
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Default Admin: admin@gmail.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
