import axios from 'axios'
import { getAccessToken, getAdminToken, removeAccessToken } from '../lib/api'

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost
    ? 'http://localhost:4000/api'
    : 'https://medical-shop-backend.vercel.app/api')

export const api = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || ''
    // Check if URL starts with /admin/
    const isAdminUrl = requestUrl.startsWith('/admin/') || requestUrl.includes('/admin/')
    
    // Check if current route is an admin route
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    const isAdminRoute = currentPath.startsWith('/admin/')
    
    // Routes that need admin auth when accessed from admin pages
    const adminOnlyRoutes = ['/claims']
    const isAdminOnlyRoute = adminOnlyRoutes.some(route => requestUrl.startsWith(route))
    
    // Use admin token if:
    // 1. URL starts with /admin/
    // 2. OR current route is admin AND request is to admin-only route (like /claims)
    const isAdminRequest = isAdminUrl || (isAdminRoute && isAdminOnlyRoute)

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
    // Handle network errors (connection refused, etc.)
    if (error.code === 'ERR_NETWORK' || 
        error.message?.includes('Network Error') ||
        error.message?.includes('ERR_CONNECTION_REFUSED') ||
        !error.response) {
      // Don't redirect on network errors - just log a warning
      if (import.meta.env.DEV) {
        console.warn('Network error: Backend server may be unavailable', error.message)
      }
      // Create a user-friendly error
      const networkError = new Error('Unable to connect to server. Please ensure the backend is running.')
      networkError.isNetworkError = true
      networkError.originalError = error
      return Promise.reject(networkError)
    }
    
    // Handle 401 unauthorized errors
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

