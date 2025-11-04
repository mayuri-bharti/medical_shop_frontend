import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken, getUserRole } from '../lib/api'

const UserProtectedRoute = ({ children }) => {
  const location = useLocation()
  const accessToken = getAccessToken()
  const userRole = getUserRole()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If admin tries to access user route, redirect to admin dashboard
  if (userRole === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export default UserProtectedRoute



