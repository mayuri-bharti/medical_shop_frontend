import { createContext, useContext, useReducer, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true 
      }
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false }
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, loading: false, error: null }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null
  })

  useEffect(() => {
    if (state.token) {
      // Verify token on app load
      verifyToken()
    }
  }, [])

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify')
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data.user, token: state.token }
      })
    } catch (error) {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const sendOTP = async (phoneNumber) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      await api.post('/auth/send-otp', { phoneNumber })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message || 'Failed to send OTP' })
      return { success: false, error: error.response?.data?.message || 'Failed to send OTP' }
    }
  }

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { phoneNumber, otp })
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message || 'Invalid OTP' })
      return { success: false, error: error.response?.data?.message || 'Invalid OTP' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    sendOTP,
    verifyOTP,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

