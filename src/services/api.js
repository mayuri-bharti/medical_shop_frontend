import axios from 'axios'
import { getAccessToken, getAdminToken, removeAccessToken } from '../lib/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || ''
    const isAdminRequest = requestUrl.startsWith('/admin/') || requestUrl.includes('/admin/')

    const token = isAdminRequest ? getAdminToken() : getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No token found for', isAdminRequest ? 'admin' : 'user', 'request to', config.url)
    }
    
    // CRITICAL: Must return config for axios to work
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || ''
      const isAdminRequest = requestUrl.includes('/admin/')

      removeAccessToken()

      const currentPath = window.location.pathname
      if (isAdminRequest) {
        if (currentPath !== '/admin/login') {
          window.location.href = '/admin/login'
        }
      } else {
        if (currentPath !== '/login') {
          const returnUrl = encodeURIComponent(currentPath + window.location.search)
          window.location.href = `/login?redirect=${returnUrl}`
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

