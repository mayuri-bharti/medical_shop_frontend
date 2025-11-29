import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { 
  User, 
  Package, 
  FileText, 
  ShoppingBag, 
  MessageCircle,
  Settings,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit2,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

// Helper to get full avatar URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  if (avatar.startsWith('http')) return avatar
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
  const baseUrl = apiBaseUrl.replace('/api', '')
  return `${baseUrl}${avatar.startsWith('/') ? avatar : '/' + avatar}`
}

const Account = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: profileData, isLoading: profileLoading } = useQuery(
    'userProfile',
    () => api.get('/profile').then(res => res.data?.data || res.data),
    {
      onError: (error) => {
        if (error.response?.status === 401) {
          navigate('/login')
        }
      }
    }
  )

  const { data: statsData } = useQuery(
    'userStats',
    () => api.get('/profile/stats').then(res => res.data),
    {
      enabled: !!profileData
    }
  )

  const { data: ordersData } = useQuery(
    'userOrders',
    () => api.get('/orders').then(res => res.data),
    {
      enabled: activeTab === 'orders' && !!profileData
    }
  )

  const { data: messagesData } = useQuery(
    'userContactMessages',
    () => api.get('/contact/my-messages').then(res => res.data),
    {
      enabled: activeTab === 'messages' && !!profileData,
      onError: () => {
        // Silently fail for messages
      }
    }
  )

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const profile = profileData || {}
  const stats = statsData || {}
  const orders = ordersData?.data || ordersData || []
  const messages = messagesData?.data || []

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const tabs = [
    { id: 'overview', name: 'Account Overview', icon: User },
    { id: 'profile', name: 'My Profile', icon: Settings },
    { id: 'orders', name: 'My Orders', icon: ShoppingBag },
    { id: 'messages', name: 'Messages', icon: MessageCircle }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold overflow-hidden flex-shrink-0">
                  {profile.avatar && getAvatarUrl(profile.avatar) ? (
                    <img
                      src={getAvatarUrl(profile.avatar)}
                      alt={profile.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : profile.name ? (
                    profile.name.charAt(0).toUpperCase()
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{profile.name || 'User'}</p>
                  <p className="text-sm text-gray-500 truncate">{profile.email || profile.phone}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.ordersCount || 0}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <ShoppingBag size={24} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.prescriptionsCount || 0}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <FileText size={24} className="text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Member Since</p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                          {formatDate(stats.memberSince || profile.createdAt)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Calendar size={24} className="text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                    <Link
                      to="/profile"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit Profile
                    </Link>
                  </div>
                  {/* Profile Picture Display */}
                  {profile.avatar && getAvatarUrl(profile.avatar) && (
                    <div className="mb-6 flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-4 border-primary-200 shadow-lg">
                        <img
                          src={getAvatarUrl(profile.avatar)}
                          alt={profile.name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-semibold text-gray-900">{profile.name || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{profile.email || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{profile.phone || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {profile.dateOfBirth && (
                        <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Date of Birth</p>
                            <p className="font-semibold text-gray-900">{formatDate(profile.dateOfBirth)}</p>
                          </div>
                        </div>
                      )}
                      {profile.gender && (
                        <div className="flex items-center gap-3">
                          <User size={20} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-semibold text-gray-900 capitalize">{profile.gender}</p>
                          </div>
                        </div>
                      )}
                      {profile.addresses && profile.addresses.length > 0 && (
                        <div className="flex items-center gap-3">
                          <MapPin size={20} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Saved Addresses</p>
                            <p className="font-semibold text-gray-900">{profile.addresses.length} address(es)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                      to="/profile"
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <Settings size={24} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <ShoppingBag size={24} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">View Orders</span>
                    </Link>
                    <Link
                      to="/prescriptions"
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <FileText size={24} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Prescriptions</span>
                    </Link>
                    <Link
                      to="/contact-messages"
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <MessageCircle size={24} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Messages</span>
                    </Link>
                    <Link
                      to="/claims"
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <AlertTriangle size={24} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">My Claims</span>
                    </Link>
                    <Link
                      to="/returns"
                      className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <Package size={24} className="text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Returns</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
                  <Link
                    to="/profile"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </Link>
                </div>
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold text-gray-900 mt-1">{profile.name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 mt-1">{profile.email || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900 mt-1">{profile.phone || 'Not set'}</p>
                      </div>
                      {profile.alternatePhone && (
                        <div>
                          <p className="text-sm text-gray-600">Alternate Phone</p>
                          <p className="font-semibold text-gray-900 mt-1">{profile.alternatePhone}</p>
                        </div>
                      )}
                      {profile.dateOfBirth && (
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-semibold text-gray-900 mt-1">{formatDate(profile.dateOfBirth)}</p>
                        </div>
                      )}
                      {profile.gender && (
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="font-semibold text-gray-900 mt-1 capitalize">{profile.gender}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  {profile.notifications && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Email Notifications</span>
                          {profile.notifications.email ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <Clock size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">SMS Notifications</span>
                          {profile.notifications.sms ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <Clock size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Push Notifications</span>
                          {profile.notifications.push ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <Clock size={20} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preferences */}
                  {profile.preferences && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Language</p>
                          <p className="font-semibold text-gray-900 mt-1 capitalize">
                            {profile.preferences.language === 'en' ? 'English' : 
                             profile.preferences.language === 'hi' ? 'Hindi' : 'Marathi'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Currency</p>
                          <p className="font-semibold text-gray-900 mt-1">{profile.preferences.currency}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                  <Link
                    to="/orders"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                    <Link
                      to="/products"
                      className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Order #{order.orderNumber || order._id.slice(-8)}</p>
                            <p className="text-sm text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{order.total?.toLocaleString() || '0'}</p>
                            <p className="text-sm text-gray-600 capitalize">{order.status || 'pending'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Messages</h2>
                  <Link
                    to="/contact-messages"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No messages yet</p>
                    <Link
                      to="/contact"
                      className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.slice(0, 5).map((message) => (
                      <div key={message._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-900">{message.name}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            message.adminReply ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.adminReply ? 'Replied' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                        {message.adminReply && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-600 mb-1">Admin Reply:</p>
                            <p className="text-sm text-gray-800 line-clamp-2">{message.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account

