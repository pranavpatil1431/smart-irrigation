import axios from 'axios'

// Production: Use VITE_API_URL (full backend URL)
// Development: Use proxy via '/api'
const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '/api'

const api = axios.create({
  baseURL,
  timeout: 30000 // 30 seconds timeout for production
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
