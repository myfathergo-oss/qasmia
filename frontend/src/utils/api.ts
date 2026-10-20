import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qasmia_token')
      localStorage.removeItem('qasmia_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
