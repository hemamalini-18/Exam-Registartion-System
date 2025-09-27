import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
})

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize error responses so UI components can show clear messages
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message
      || error?.message
      || 'Request failed'
    // Attach a normalized message for components to use
    error.normalizedMessage = message
    error.status = status
    return Promise.reject(error)
  }
)

export default api
