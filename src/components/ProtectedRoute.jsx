import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken } from '../lib/api'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const accessToken = getAccessToken()
  const deliveryBoyToken = localStorage.getItem('deliveryBoyToken') || sessionStorage.getItem('deliveryBoyToken')

  // Check if this is a delivery boy route
  const isDeliveryBoyRoute = location.pathname.startsWith('/delivery-boy')

  // For delivery boy routes, check delivery boy token
  if (isDeliveryBoyRoute) {
    if (!deliveryBoyToken) {
      const returnUrl = encodeURIComponent(location.pathname + location.search)
      return <Navigate to={`/delivery-boy/login?redirect=${returnUrl}`} replace />
    }
    return children
  }

  // For regular user routes, check user token
  if (!accessToken) {
    // Preserve the current location so we can redirect back after login
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />
  }

  // User is authenticated, allow access
  return children
}

export default ProtectedRoute
