import { useState, useEffect } from 'react'
import { Truck, Search, Phone, Mail, Calendar, Edit, Trash2, Ban, CheckCircle, UserPlus, X, Package } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const AdminDeliveryBoys = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: '',
    vehicleType: 'Bike',
    licenseNumber: '',
    password: ''
  })
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: '',
    vehicleType: 'Bike',
    licenseNumber: '',
    password: ''
  })
  const [updating, setUpdating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [blocking, setBlocking] = useState(null)
  const [createdDeliveryBoy, setCreatedDeliveryBoy] = useState(null)

  useEffect(() => {
    fetchDeliveryBoys()
  }, [currentPage, searchTerm])

  const fetchDeliveryBoys = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      }
      const response = await api.get('/admin/delivery-boys', { params })
      if (response.data.success) {
        setDeliveryBoys(response.data.deliveryBoys || [])
        setTotalPages(response.data.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch delivery boys')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (deliveryBoy) => {
    setEditingDeliveryBoy(deliveryBoy)
    setEditForm({
      name: deliveryBoy.name || '',
      email: deliveryBoy.email || '',
      phone: deliveryBoy.phone || '',
      vehicleNumber: deliveryBoy.vehicleNumber || '',
      vehicleType: deliveryBoy.vehicleType || 'Bike',
      licenseNumber: deliveryBoy.licenseNumber || '',
      password: ''
    })
    setShowEditModal(true)
  }

  const handleUpdateDeliveryBoy = async (e) => {
    e.preventDefault()
    if (!editingDeliveryBoy) return

    setUpdating(true)
    try {
      const updateData = { ...editForm }
      if (!updateData.password) {
        delete updateData.password
      }

      const response = await api.put(`/admin/delivery-boys/${editingDeliveryBoy._id}`, updateData)
      
      if (response.data.success) {
        toast.success('Delivery boy updated successfully!')
        setShowEditModal(false)
        setEditingDeliveryBoy(null)
        setEditForm({ name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Bike', licenseNumber: '', password: '' })
        fetchDeliveryBoys()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update delivery boy')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery boy? This action cannot be undone.')) {
      return
    }

    setDeleting(id)
    try {
      const response = await api.delete(`/admin/delivery-boys/${id}`)
      
      if (response.data.success) {
        toast.success('Delivery boy deleted successfully!')
        fetchDeliveryBoys()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete delivery boy')
    } finally {
      setDeleting(null)
    }
  }

  const handleBlockToggle = async (deliveryBoy) => {
    const action = deliveryBoy.isBlocked ? 'unblock' : 'block'
    if (!confirm(`Are you sure you want to ${action} this delivery boy?`)) {
      return
    }

    setBlocking(deliveryBoy._id)
    try {
      const response = await api.patch(`/admin/delivery-boys/${deliveryBoy._id}/block`, {
        isBlocked: !deliveryBoy.isBlocked
      })
      
      if (response.data.success) {
        toast.success(`Delivery boy ${action}ed successfully!`)
        fetchDeliveryBoys()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} delivery boy`)
    } finally {
      setBlocking(null)
    }
  }

  const handleCreateDeliveryBoy = async (e) => {
    e.preventDefault()
    
    if (!createForm.name || !createForm.phone) {
      toast.error('Name and phone are required')
      return
    }

    setCreating(true)
    try {
      const response = await api.post('/admin/delivery-boys/create', createForm)
      
      if (response.data.success) {
        toast.success('Delivery boy account created successfully!')
        setCreatedDeliveryBoy(response.data.data)
        setCreateForm({ name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Bike', licenseNumber: '', password: '' })
        fetchDeliveryBoys()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create delivery boy')
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

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Delivery Boys Management</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">Manage delivery personnel</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <UserPlus size={18} />
          Create Delivery Boy
        </button>
      </div>

      {/* Create Delivery Boy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create Delivery Boy</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({ name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Bike', licenseNumber: '', password: '' })
                  setCreatedDeliveryBoy(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            {createdDeliveryBoy ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">✓ Delivery boy created successfully!</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {createdDeliveryBoy.deliveryBoy.name}</p>
                    <p><strong>Phone:</strong> {createdDeliveryBoy.deliveryBoy.phone}</p>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 font-semibold">Account Password:</p>
                      <p className="text-lg font-mono font-bold text-yellow-900">{createdDeliveryBoy.password}</p>
                      <p className="text-xs text-yellow-700 mt-1">Share this password with the delivery boy.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreatedDeliveryBoy(null)
                    setCreateForm({ name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Bike', licenseNumber: '', password: '' })
                  }}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateDeliveryBoy} className="space-y-4">
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
                    Vehicle Type
                  </label>
                  <select
                    value={createForm.vehicleType}
                    onChange={(e) => setCreateForm({ ...createForm, vehicleType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Car">Car</option>
                    <option value="Cycle">Cycle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={createForm.vehicleNumber}
                    onChange={(e) => setCreateForm({ ...createForm, vehicleNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={createForm.licenseNumber}
                    onChange={(e) => setCreateForm({ ...createForm, licenseNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setCreateForm({ name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Bike', licenseNumber: '', password: '' })
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
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDeliveryBoy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Delivery Boy</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingDeliveryBoy(null)
                  setEditForm({ name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Bike', licenseNumber: '', password: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateDeliveryBoy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  value={editForm.vehicleType}
                  onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Car">Car</option>
                  <option value="Cycle">Cycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={editForm.vehicleNumber}
                  onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={editForm.licenseNumber}
                  onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingDeliveryBoy(null)
                    setEditForm({ name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Bike', licenseNumber: '', password: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? 'Updating...' : 'Update'}
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
            placeholder="Search delivery boys by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Delivery Boys Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading delivery boys...</p>
          </div>
        ) : deliveryBoys.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Truck className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">No delivery boys found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Delivery Boy
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Stats
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
                  {deliveryBoys.map((db) => (
                    <tr key={db._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 border-2 border-orange-200">
                            <Truck size={20} className="text-orange-600" />
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm md:text-base font-semibold text-gray-900 truncate">
                              {db.name || 'Delivery Boy'}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">ID: {db._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base text-gray-900 flex items-center space-x-2">
                          <Phone size={14} className="flex-shrink-0 text-gray-400" />
                          <span className="truncate max-w-[140px]">{db.phone}</span>
                        </div>
                        {db.email && (
                          <div className="text-xs md:text-sm text-gray-500 flex items-center space-x-2 mt-1.5">
                            <Mail size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="truncate max-w-[140px]">{db.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{db.vehicleType || 'N/A'}</div>
                          {db.vehicleNumber && (
                            <div className="text-xs text-gray-500">{db.vehicleNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          <div>Completed: {db.stats?.completedDeliveries || 0}</div>
                          <div>Total: {db.stats?.totalDeliveries || 0}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full ${
                            db.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {db.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {db.isBlocked && (
                            <span className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full bg-red-100 text-red-800">
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(db)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleBlockToggle(db)}
                            disabled={blocking === db._id}
                            className={`p-2 rounded-lg transition-colors ${
                              db.isBlocked
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            } disabled:opacity-50`}
                            title={db.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {blocking === db._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : db.isBlocked ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Ban size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(db._id)}
                            disabled={deleting === db._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === db._id ? (
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
              {deliveryBoys.map((db) => (
                <div key={db._id} className="p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Truck size={24} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{db.name || 'Delivery Boy'}</h3>
                      <p className="text-xs text-gray-500">ID: {db._id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-900">{db.phone}</span>
                    </div>
                    {db.email && (
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-900 break-all">{db.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Truck size={14} className="text-gray-400" />
                      <span className="text-gray-900">{db.vehicleType || 'N/A'}</span>
                      {db.vehicleNumber && <span className="text-gray-500">- {db.vehicleNumber}</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="text-gray-900">Completed: {db.stats?.completedDeliveries || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        db.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {db.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {db.isBlocked && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(db)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit size={16} className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleBlockToggle(db)}
                      disabled={blocking === db._id}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                        db.isBlocked
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                    >
                      {db.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      onClick={() => handleDelete(db._id)}
                      disabled={deleting === db._id}
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
    </div>
  )
}

export default AdminDeliveryBoys


