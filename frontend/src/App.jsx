import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import Employees from './pages/Employees'
import AddFarmer from './pages/AddFarmer'
import PendingFarms from './pages/PendingFarms'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-irrigation-50 to-green-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-irrigation-600">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {user && <Navbar user={user} onLogout={logout} />}
      {user && <Sidebar user={user} />}

      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />

        <Route path="/" element={<Navigate to="/login" />} />

        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/add-farmer" element={<AddFarmer />} />
          {user?.role === 'admin' && (
            <>
              <Route path="/admin/employees" element={<Employees />} />
              <Route path="/admin/pending-farms" element={<PendingFarms />} />
            </>
          )}
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default App
