import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { User, Phone, Mail, MapPin, Edit, Save, X, Lock, Eye, EyeOff } from 'lucide-react'
import { setUserPassword, changeUserPassword } from '../lib/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordMode, setPasswordMode] = useState('set') // 'set' or 'change'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

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
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.put('/profile', formData)
      if (response.data?.success) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
        fetchUser()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      })
    }
    setIsEditing(false)
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      const response = await setUserPassword(passwordData.newPassword, passwordData.confirmPassword)
      
      if (response.success) {
        toast.success('Password set successfully!')
        setShowPasswordModal(false)
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      toast.error(error.message || 'Failed to set password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      const response = await changeUserPassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      )
      
      if (response.success) {
        toast.success('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setPasswordMode('set')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const openPasswordModal = (mode) => {
    setPasswordMode(mode)
    setShowPasswordModal(true)
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      required
                    />
                  ) : (
                    <div className="flex items-center space-x-3 py-2">
                      <User size={20} className="text-gray-400" />
                      <span className="text-gray-900">{user?.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center space-x-3 py-2">
                    <Phone size={20} className="text-gray-400" />
                    <span className="text-gray-900">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <Mail size={20} className="text-gray-400" />
                    <span className="text-gray-900">{user?.email || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-start space-x-3 py-2">
                    <MapPin size={20} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-900">{user?.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="py-2">
                      <span className="text-gray-900">{user?.city || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="py-2">
                      <span className="text-gray-900">{user?.state || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="py-2">
                      <span className="text-gray-900">{user?.pincode || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Stats & Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-semibold">{user?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role</span>
                <span className="font-semibold">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user?.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.role || 'USER'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-3">
              <button 
                onClick={() => openPasswordModal('set')}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Lock size={16} />
                <span>Set Password</span>
              </button>
              <button 
                onClick={() => openPasswordModal('change')}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Lock size={16} />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {passwordMode === 'set' ? 'Set Password' : 'Change Password'}
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={passwordMode === 'set' ? handleSetPassword : handleChangePassword} className="space-y-4">
              {passwordMode === 'change' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Old Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      required
                      disabled={passwordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {passwordMode === 'set' ? 'Password' : 'New Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                    placeholder="Minimum 6 characters"
                    required
                    disabled={passwordLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                    placeholder="Confirm your password"
                    required
                    disabled={passwordLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading || passwordData.newPassword !== passwordData.confirmPassword || passwordData.newPassword.length < 6}
                  className="flex-1 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{passwordMode === 'set' ? 'Set Password' : 'Change Password'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
