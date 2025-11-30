import { Link, useLocation } from 'react-router-dom'

const Navbar = ({ user, onLogout }) => {
  const location = useLocation()
  const isMapPage = location.pathname === '/map'

  return (
    <nav className={`bg-white shadow-lg border-b border-gray-100 ${isMapPage ? 'map-navbar' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-irrigation-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">💧</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Smart Irrigation</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link
                to="/admin/employees"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/admin/employees'
                    ? 'bg-irrigation-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Employees
              </Link>
            )}
            <Link
              to="/map"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === '/map'
                  ? 'bg-irrigation-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Map
            </Link>
            <button
              onClick={onLogout}
              className="btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
