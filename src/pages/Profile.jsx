import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { User, Phone, Mail, Shield, ArrowRight, Package, ShoppingBag } from 'lucide-react'
import { removeAccessToken } from '../lib/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await api.get('/auth/me')
      if (response.data?.success) {
        const userData = response.data.data.user
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeAccessToken()
    toast.success('Logged out successfully')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  const formatPhone = (phone) => {
    if (!phone) return 'Not provided'
    if (phone.startsWith('+91')) return phone
    return `+91 ${phone}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">HealthPlus</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="text-sm font-medium">Logout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Your Profile</h3>
          
          <div className="space-y-4">
            {/* Phone Number */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-base font-semibold text-gray-900">{formatPhone(user?.phone)}</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-semibold text-gray-900">{user?.name || 'Not provided'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-semibold text-gray-900">{user?.email || 'Not provided'}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="text-blue-600" size={20} />
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-base font-semibold text-gray-900">{user?.role || 'USER'}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {user?.role || 'USER'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Browse Products */}
          <button
            onClick={() => navigate('/products')}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Package className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Browse Products</h3>
                  <p className="text-sm text-gray-500 mt-1">Explore our catalog</p>
                </div>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </button>

          {/* My Orders */}
          <button
            onClick={() => navigate('/orders')}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">My Orders</h3>
                  <p className="text-sm text-gray-500 mt-1">View order history</p>
                </div>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
