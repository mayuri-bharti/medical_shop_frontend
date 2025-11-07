import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken } from '../lib/api'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const accessToken = getAccessToken()

  // If no token, redirect to login with return URL
  if (!accessToken) {
    // Preserve the current location so we can redirect back after login
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />
  }

  // User is authenticated, allow access
  return children
}

export default ProtectedRoute
