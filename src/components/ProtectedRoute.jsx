import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken } from '../lib/api'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const accessToken = getAccessToken()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
