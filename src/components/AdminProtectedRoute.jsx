import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken, getUserRole } from '../lib/api'

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation()
  const accessToken = getAccessToken()
  const userRole = getUserRole()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (userRole !== 'ADMIN') {
    return <Navigate to="/user/dashboard" replace />
  }

  return children
}

export default AdminProtectedRoute



