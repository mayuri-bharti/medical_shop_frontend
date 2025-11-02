/**
 * API utility functions for authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

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
  localStorage.setItem('accessToken', token)
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
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
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
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
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
      const error = new Error(data.message || 'Request failed')
      error.status = response.status
      error.data = data
      throw error
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
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
  
  return await apiCall('/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
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

