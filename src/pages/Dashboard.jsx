import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Phone, Mail, LogOut, Shield } from 'lucide-react'
import { getCurrentUser, logout as apiLogout, removeAccessToken } from '../lib/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const response = await getCurrentUser()
      if (response.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      toast.error('Failed to load user data')
      handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await apiLogout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">HealthPlus</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-medical-600 to-medical-700 rounded-2xl shadow-lg p-8 text-white mb-6">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back! 👋
            </h2>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Profile</h3>
            
            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-medical-100 rounded-lg">
                  <Phone className="text-medical-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900">+91 {user?.phone}</p>
                </div>
              </div>

              {/* Name */}
              {user?.name && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-medical-100 rounded-lg">
                    <User className="text-medical-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {user?.email && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-medical-100 rounded-lg">
                    <Mail className="text-medical-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Role */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-medical-100 rounded-lg">
                  <Shield className="text-medical-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-medical-100 text-medical-800">
                    {user?.role || 'USER'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link to="/products" className="bg-white rounded-lg shadow-md p-4 text-left hover:shadow-lg transition-shadow">
              <h4 className="font-medium text-gray-900 mb-1">Browse Products</h4>
              <p className="text-sm text-gray-600">Shop medicines and health products</p>
            </Link>
            <Link to="/orders" className="bg-white rounded-lg shadow-md p-4 text-left hover:shadow-lg transition-shadow">
              <h4 className="font-medium text-gray-900 mb-1">My Orders</h4>
              <p className="text-sm text-gray-600">View and track your orders</p>
            </Link>
          </div>

          {/* Admin Panel */}
          {user?.role === 'ADMIN' && (
            <div className="mt-6">
              <Link to="/admin/products" className="block bg-medical-600 text-white rounded-lg shadow-md p-4 hover:bg-medical-700 transition-colors">
                <h4 className="font-semibold mb-1">Admin Panel</h4>
                <p className="text-sm text-medical-100">Manage products and inventory</p>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard

