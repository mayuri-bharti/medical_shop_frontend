/**
 * API utility functions for authentication
 */

import axios from "axios";

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === "localhost";

// Use environment variable if available, otherwise fallback to localhost or production URL
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost
    ? "http://localhost:4000/api"
    : "https://medical-shop-backend.vercel.app/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
/**
 * Get stored access token
 */
export const getAccessToken = () => {
  return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken')
}

/**
 * Set access token
 */
export const setAccessToken = (token) => {
  sessionStorage.setItem('accessToken', token)
  localStorage.setItem('accessToken', token);
}

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
  return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken')
}

/**
 * Set refresh token
 */
export const setRefreshToken = (token) => {
  sessionStorage.setItem('refreshToken', token)
  localStorage.setItem('refreshToken', token)
}

/**
 * Remove access token (logout)
 */
export const removeAccessToken = () => {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('adminToken')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userRole')
  sessionStorage.removeItem('userRole')
}

/**
 * Admin API functions
 */

/**
 * Set admin access token
 */
export const setAdminToken = (token) => {
  sessionStorage.setItem('adminToken', token)
  localStorage.setItem('adminToken', token)
  localStorage.setItem('userRole', 'ADMIN')
  sessionStorage.setItem('userRole', 'ADMIN')
}

/**
 * Get admin access token
 */
export const getAdminToken = () => {
  return sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken')
}

/**
 * Get user role from storage
 */
export const getUserRole = () => {
  return sessionStorage.getItem('userRole') || localStorage.getItem('userRole')
}

/**
 * Send OTP to admin phone number
 */
export const sendAdminOtp = async (phone) => {
  return await apiCall('/admin/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  })
}

/**
 * Verify admin OTP
 */
export const verifyAdminOtp = async (phone, otp) => {
  const result = await apiCall('/admin/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp })
  })
  
  // Store admin token if present
  if (result.data?.accessToken) {
    setAdminToken(result.data.accessToken)
  }
  
  return result
}

/**
 * Register new user with email/phone/name and password
 */
export const registerUser = async (phone, email, name, password, confirmPassword) => {
  return await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, email, name, password, confirmPassword })
  })
}

/**
 * Login with password (phone/email/username + password)
 */
export const loginWithPassword = async (identifier, password) => {
  return await apiCall('/auth/login-password', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  })
}

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = async (idToken) => {
  const result = await apiCall('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken })
  })
  
  // Store tokens if present
  if (result.data?.accessToken) {
    setAccessToken(result.data.accessToken)
  }
  if (result.data?.refreshToken) {
    setRefreshToken(result.data.refreshToken)
  }
  
  return result
}

/**
 * Login with Facebook OAuth
 */
export const loginWithFacebook = async (accessToken) => {
  const result = await apiCall('/auth/facebook', {
    method: 'POST',
    body: JSON.stringify({ accessToken })
  })
  
  // Store tokens if present
  if (result.data?.accessToken) {
    setAccessToken(result.data.accessToken)
  }
  if (result.data?.refreshToken) {
    setRefreshToken(result.data.refreshToken)
  }
  
  return result
}

/**
 * Login admin with password (phone/email/username/name + password)
 */
export const loginAdminWithPassword = async (identifier, password) => {
  return await apiCall('/admin/auth/login-password', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Set user password (for first-time setup)
 */
export const setUserPassword = async (password, confirmPassword) => {
  const token = getAccessToken()
  
  if (!token) {
    throw new Error('No access token found')
  }
  
  return await apiCall('/auth/set-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password, confirmPassword })
  })
}

/**
 * Change user password (requires old password)
 */
export const changeUserPassword = async (oldPassword, newPassword, confirmPassword) => {
  const token = getAccessToken()
  
  if (!token) {
    throw new Error('No access token found')
  }
  
  return await apiCall('/auth/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
  })
}

/**
 * Set admin password (for first-time setup)
 */
export const setAdminPassword = async (password, confirmPassword) => {
  const token = getAdminToken()
  
  if (!token) {
    throw new Error('No admin token found')
  }
  
  return await apiCall('/admin/auth/set-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password, confirmPassword })
  })
}

/**
 * Change admin password (requires old password)
 */
export const changeAdminPassword = async (oldPassword, newPassword, confirmPassword) => {
  const token = getAdminToken()
  
  if (!token) {
    throw new Error('No admin token found')
  }
  
  return await apiCall('/admin/auth/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
  })
}

/**
 * Get all users (admin only)
 */
export const getUsers = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString()
  return await apiCall(`/admin/users?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    }
  })
}

/**
 * Get all orders (admin only)
 */
export const getOrders = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString()
  return await apiCall(`/admin/orders${queryParams ? `?${queryParams}` : ''}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    }
  })
}

export const getMyOrders = async () => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('No access token found')
  }

  return await apiCall('/orders/my-orders', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

export const updateOrderStatus = async (orderId, status, note) => {
  return await apiCall(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify({ status, note })
  })
}

/**
 * Get all products (admin only)
 */
export const getAdminProducts = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString()
  return await apiCall(`/admin/products?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    }
  })
}

/**
 * Get single product by ID (admin only)
 */
export const getAdminProduct = async (productId) => {
  return await apiCall(`/admin/products/${productId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    }
  })
}

/**
 * Create product (admin only)
 */
export const createProduct = async (productData) => {
  return await apiCall('/admin/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify(productData)
  })
}

/**
 * Update product (admin only)
 */
export const updateProduct = async (productId, productData) => {
  return await apiCall(`/admin/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify(productData)
  })
}

/**
 * Delete product (admin only)
 */
export const deleteProduct = async (productId) => {
  return await apiCall(`/admin/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    }
  })
}

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed')
    }

    // Store new tokens
    if (data.data?.accessToken) {
      setAccessToken(data.data.accessToken)
    }
    if (data.data?.refreshToken) {
      setRefreshToken(data.data.refreshToken)
    }

    return data.data?.accessToken
  } catch (error) {
    console.error('Token refresh error:', error)
    // If refresh fails, logout user
    removeAccessToken()
    window.location.href = '/login'
    throw error
  }
}

/**
 * Helper function to make API calls with automatic token refresh
 */
const apiCall = async (endpoint, options = {}, retryCount = 0) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    method: options.method || 'GET',
    ...options
  }

  const headers = { ...(options.headers || {}) }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (!isFormData && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  config.headers = headers

  try {
    let response
    try {
      response = await fetch(url, config)
    } catch (fetchError) {
      // Fetch failed completely (network error, connection refused, etc.)
      const networkError = new Error('Unable to connect to server. Please ensure the backend is running.')
      networkError.isNetworkError = true
      networkError.originalError = fetchError
      throw networkError
    }
    
    // Handle network errors (connection refused, timeout, etc.)
    if (!response.ok && response.status === 0) {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.')
    }
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type')
    let data
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (jsonError) {
        // If JSON parsing fails, it might be an HTML error page or empty response
        throw new Error('Invalid response from server. Please check if the backend is running correctly.')
      }
    } else {
      // Non-JSON response - likely server error page
      const text = await response.text()
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
    }
    
    // If 401 and we haven't retried yet, try to refresh token
    if (response.status === 401 && retryCount === 0 && !endpoint.includes('/auth/')) {
      console.log('Token expired, attempting to refresh...')
      
      try {
        const newToken = await refreshAccessToken()
        
        // Retry the original request with new token
        if (options.headers?.Authorization) {
          options.headers.Authorization = `Bearer ${newToken}`
        }
        
        return await apiCall(endpoint, options, retryCount + 1)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        throw new Error(data.message || 'Session expired. Please login again.')
      }
    }
    
    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Request failed')
      error.status = response.status
      error.response = { data } // Add response for better error handling
      error.data = data
      // Include error details from backend
      if (data.error) {
        error.message = data.error
      }
      if (data.details) {
        error.message = `${error.message} (${data.details})`
        error.details = data.details
      }
      if (data.hint) {
        error.hint = data.hint
      }
      throw error
    }
    
    return data
  } catch (error) {
    // Handle network errors gracefully
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('ERR_CONNECTION_REFUSED') ||
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError') {
      const networkError = new Error('Unable to connect to server. Please ensure the backend is running.')
      networkError.isNetworkError = true
      networkError.originalError = error
      // Only log in development
      if (import.meta.env.DEV) {
        console.warn('Network error:', error.message)
      }
      throw networkError
    }
    
    // Log other errors
    if (import.meta.env.DEV) {
      console.error('API Error:', error)
    }
    throw error
  }
}

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number
 * @returns {Promise<{success: boolean, data: {resendCooldown: string}}>}
 */
export const sendOtp = async (phone) => {
  return await apiCall('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  })
}

/**
 * Verify OTP
 * @param {string} phone - Phone number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{success: boolean, data: {user: Object, accessToken: string}}>}
 */
export const verifyOtp = async (phone, otp) => {
  const result = await apiCall('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp })
  })
  
  // Store tokens if present
  if (result.data?.accessToken) {
    setAccessToken(result.data.accessToken)
  }
  if (result.data?.refreshToken) {
    setRefreshToken(result.data.refreshToken)
  }
  
  return result
}

/**
 * Get current user profile
 * @returns {Promise<{success: boolean, data: {user: Object}}>}
 */
export const getCurrentUser = async () => {
  const token = getAccessToken()
  
  if (!token) {
    throw new Error('No access token found')
  }
  
  try {
    return await apiCall('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  } catch (error) {
    // Re-throw with more context for network errors
    if (error.isNetworkError) {
      error.message = 'Backend server is unavailable. Please check if the server is running.'
    }
    throw error
  }
}

/**
 * Logout user
 * @returns {Promise<{success: boolean}>}
 */
export const logout = async () => {
  const token = getAccessToken()
  
  if (token) {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  removeAccessToken()
}

/**
 * Upload prescription file
 * @param {FormData} formData - Form data with prescription file
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const uploadPrescription = async (formData) => {
  const token = getAccessToken()
  
  if (!token) {
    throw new Error('No access token found')
  }

  const url = `${API_BASE_URL}/prescriptions`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type, let browser set it with boundary for FormData
    },
    body: formData
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Upload failed')
  }
  
  return data
}

