import { Navigate } from 'react-router-dom'
import { getAdminToken } from '../lib/api'

const AdminProtectedRoute = ({ children }) => {
  const adminToken = getAdminToken()

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminProtectedRoute
