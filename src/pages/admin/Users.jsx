import { useState, useEffect } from 'react'
import { Users, Search, Phone, Mail, Calendar, Edit, Trash2, Ban, CheckCircle, UserPlus, X, Eye, Package, FileText, ChevronRight } from 'lucide-react'
import { getUsers } from '../../lib/api'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [updating, setUpdating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [blocking, setBlocking] = useState(null)
  const [createdUser, setCreatedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [userPrescriptions, setUserPrescriptions] = useState([])
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      }
      const response = await getUsers(params)
      if (response.success) {
        setUsers(response.users || [])
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '' // Don't pre-fill password
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    
    if (!editingUser) return

    // Validation
    if (!editForm.name || !editForm.email || !editForm.phone) {
      toast.error('Name, email, and phone are required')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editForm.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Phone validation (10 digits)
    if (!/^[0-9]{10}$/.test(editForm.phone)) {
      toast.error('Phone must be 10 digits')
      return
    }

    // Password validation (if provided)
    if (editForm.password && editForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setUpdating(true)
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      }
      
      // Only include password if provided
      if (editForm.password) {
        updateData.password = editForm.password
      }

      const response = await api.put(`/admin/users/${editingUser._id}`, updateData)
      
      if (response.data.success) {
        toast.success('User updated successfully!')
        setShowEditModal(false)
        setEditingUser(null)
        setEditForm({ name: '', email: '', phone: '', password: '' })
        fetchUsers() // Refresh users list
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setDeleting(userId)
    try {
      const response = await api.delete(`/admin/users/${userId}`)
      
      if (response.data.success) {
        toast.success('User deleted successfully!')
        fetchUsers() // Refresh users list
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
    } finally {
      setDeleting(null)
    }
  }

  const handleBlockToggle = async (user) => {
    const action = user.isBlocked ? 'unblock' : 'block'
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return
    }

    setBlocking(user._id)
    try {
      const response = await api.patch(`/admin/users/${user._id}/block`, {
        isBlocked: !user.isBlocked
      })
      
      if (response.data.success) {
        toast.success(`User ${action}ed successfully!`)
        fetchUsers() // Refresh users list
      }
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${action} user`
      toast.error(message)
    } finally {
      setBlocking(null)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    if (!createForm.name || !createForm.phone) {
      toast.error('Name and phone are required')
      return
    }

    if (createForm.password && createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setCreating(true)
    try {
      const response = await api.post('/admin/users/create', createForm)
      
      if (response.data.success) {
        toast.success('User account created successfully!')
        setCreatedUser(response.data.data)
        setCreateForm({ name: '', email: '', phone: '', password: '' })
        fetchUsers() // Refresh users list
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewUserDetails = async (user) => {
    setSelectedUser(user)
    setShowUserDetails(true)
    setLoadingUserDetails(true)
    setUserOrders([])
    setUserPrescriptions([])

    try {
      const response = await api.get(`/admin/users/${user._id}/orders-prescriptions`)
      if (response.data.success) {
        setUserOrders(response.data.data.orders || [])
        setUserPrescriptions(response.data.data.prescriptions || [])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch user details')
    } finally {
      setLoadingUserDetails(false)
    }
  }

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">Manage all registered users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <UserPlus size={18} />
          Create User
        </button>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create User Account</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({ name: '', email: '', phone: '', password: '' })
                  setCreatedUser(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            {createdUser ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">✓ User created successfully!</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {createdUser.user.name}</p>
                    <p><strong>Email:</strong> {createdUser.user.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {createdUser.user.phone}</p>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 font-semibold">Account Password:</p>
                      <p className="text-lg font-mono font-bold text-yellow-900">{createdUser.password}</p>
                      <p className="text-xs text-yellow-700 mt-1">Share this password with the user. They can change it after login.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreatedUser(null)
                    setCreateForm({ name: '', email: '', phone: '', password: '' })
                  }}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (Optional - will be auto-generated if not provided)
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Min 6 characters"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate a secure password</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setCreateForm({ name: '', email: '', phone: '', password: '' })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                  setEditForm({ name: '', email: '', phone: '', password: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (Optional - leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                    setEditForm({ name: '', email: '', phone: '', password: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Users className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0 border-2 border-medical-200">
                            <span className="text-medical-700 font-bold text-sm md:text-base">
                              {user.name?.[0]?.toUpperCase() || user.phone?.[0] || 'U'}
                            </span>
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm md:text-base font-semibold text-gray-900 truncate">
                              {user.name || 'User'}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base text-gray-900 flex items-center space-x-2">
                          <Phone size={14} className="flex-shrink-0 text-gray-400" />
                          <span className="truncate max-w-[140px]">{user.phone}</span>
                        </div>
                        {user.email && (
                          <div className="text-xs md:text-sm text-gray-500 flex items-center space-x-2 mt-1.5">
                            <Mail size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="truncate max-w-[140px]">{user.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role || 'USER'}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base text-gray-900 flex items-center space-x-2">
                          <Calendar size={14} className="flex-shrink-0 text-gray-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full ${
                            user.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                          {user.isBlocked && (
                            <span className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full bg-red-100 text-red-800">
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUserDetails(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View User Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleBlockToggle(user)}
                            disabled={blocking === user._id}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isBlocked
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            } disabled:opacity-50`}
                            title={user.isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {blocking === user._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : user.isBlocked ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Ban size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={deleting === user._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            {deleting === user._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user._id} className="p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-medical-700 font-semibold text-lg">
                        {user.name?.[0]?.toUpperCase() || user.phone?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{user.name || 'User'}</h3>
                      <p className="text-xs text-gray-500">ID: {user._id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-900 break-all">{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'USER'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      {user.isBlocked && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleViewUserDetails(user)}
                      className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Eye size={16} className="inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit size={16} className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleBlockToggle(user)}
                      disabled={blocking === user._id}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                        user.isBlocked
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={deleting === user._id}
                      className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} className="inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-sm md:text-base text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Sidebar */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-full max-w-4xl ml-auto h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <p className="text-gray-600 mt-1">{selectedUser.name || 'User'}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserDetails(false)
                  setSelectedUser(null)
                  setUserOrders([])
                  setUserPrescriptions([])
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedUser.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>
              </div>

              {loadingUserDetails ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  {/* Orders Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package size={20} />
                        Orders ({userOrders.length})
                      </h3>
                    </div>
                    {userOrders.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Package size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">No orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userOrders.map((order) => (
                          <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">Order #{order.orderNumber || order._id.slice(-8)}</p>
                                <p className="text-sm text-gray-600">{formatDateTime(order.createdAt)}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                order.status === 'out for delivery' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status || 'Processing'}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">₹{order.total?.toLocaleString() || '0'}</span></p>
                              {order.items && order.items.length > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescriptions Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText size={20} />
                        Prescriptions ({userPrescriptions.length})
                      </h3>
                    </div>
                    {userPrescriptions.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">No prescriptions found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userPrescriptions.map((prescription) => (
                          <div key={prescription._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {prescription.originalName || `Prescription ${prescription._id.slice(-8)}`}
                                </p>
                                <p className="text-sm text-gray-600">{formatDateTime(prescription.createdAt)}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                prescription.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                prescription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                prescription.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {prescription.status || 'Pending'}
                              </span>
                            </div>
                            {prescription.order && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                  Linked to Order: <span className="font-semibold text-gray-900">#{prescription.order.orderNumber || prescription.order._id?.slice(-8)}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers







