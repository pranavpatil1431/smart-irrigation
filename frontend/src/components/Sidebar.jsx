import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'bg-irrigation-500 text-white' : 'text-gray-700 hover:bg-gray-100'
  }

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      show: true
    },
    {
      label: 'Add Farmer',
      path: '/add-farmer',
      icon: '👨‍🌾',
      show: true
    },
    {
      label: 'Pending Approvals',
      path: '/admin/pending-farms',
      icon: '📋',
      show: user?.role === 'admin'
    },
    {
      label: 'Map View',
      path: '/map',
      icon: '🗺️',
      show: true
    },
    {
      label: 'Employees',
      path: '/admin/employees',
      icon: '👥',
      show: user?.role === 'admin'
    }
  ]

  const visibleItems = menuItems.filter(item => item.show)

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-6 z-50 p-2 rounded-lg bg-irrigation-500 text-white hover:bg-irrigation-600 lg:hidden"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-irrigation-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">💧</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Smart Irrigation</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(
                item.path
              )}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info at Bottom */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm">
              <div className="font-semibold text-gray-900">{user.name || 'User'}</div>
              <div className="text-gray-500 capitalize">{user.role}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Spacer (push content on desktop) */}
      <div className="hidden lg:block w-64" />
    </>
  )
}

export default Sidebar
