import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { api } from '../../services/api'
import { FileText, Search, Filter, User, Calendar, CheckCircle, Clock, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'

// Helper to get file URL
const getFileUrl = (fileUrl) => {
  if (!fileUrl) return ''
  if (fileUrl.startsWith('http')) return fileUrl
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
  const baseUrl = apiBaseUrl.replace('/api', '')
  return `${baseUrl}/${fileUrl.replace(/^\//, '')}`
}

const AdminPrescriptions = () => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('Pending')
  const [statusNotes, setStatusNotes] = useState('')
  const queryClient = useQueryClient()

  const { data: prescriptionsData, isLoading, refetch } = useQuery(
    ['admin-prescriptions', statusFilter],
    () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      return api.get(`/admin/prescriptions?${params.toString()}`).then(res => res.data)
    }
  )

  const prescriptions = prescriptionsData?.prescriptions || []

  const updateStatusMutation = useMutation(
    ({ id, status, notes }) => api.put(`/admin/prescriptions/${id}/status`, { status, notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-prescriptions')
        toast.success('Prescription status updated successfully')
        setShowStatusModal(false)
        setSelectedPrescription(null)
        setNewStatus('Pending')
        setStatusNotes('')
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to update prescription status'
        toast.error(message)
      }
    }
  )

  const handleStatusUpdate = () => {
    if (!selectedPrescription) return
    updateStatusMutation.mutate({
      id: selectedPrescription._id,
      status: newStatus,
      notes: statusNotes
    })
  }

  const openStatusModal = (prescription) => {
    setSelectedPrescription(prescription)
    setNewStatus(prescription.status || 'Pending')
    setStatusNotes(prescription.notes || '')
    setShowStatusModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': {
        icon: Clock,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      },
      'Verified': {
        icon: CheckCircle,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      },
      'Completed': {
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      }
    }

    const config = statusConfig[status] || statusConfig['Pending']
    const Icon = config.icon

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
        <Icon size={14} />
        <span className="text-xs font-medium">{status || 'Pending'}</span>
      </div>
    )
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        prescription.user?.name?.toLowerCase().includes(query) ||
        prescription.user?.email?.toLowerCase().includes(query) ||
        prescription.user?.phone?.toLowerCase().includes(query) ||
        prescription.description?.toLowerCase().includes(query) ||
        prescription.originalName?.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Prescriptions Management</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">View and manage all user prescriptions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <label className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">Status:</label>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm md:text-base font-medium"
          >
            <option value="all">All Prescriptions</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="flex-1 sm:flex-none flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2.5 md:py-3 border-2 border-gray-200">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm md:text-base"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600">Total Prescriptions</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{prescriptions.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600">Pending</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-1">
                {prescriptions.filter(p => p.status === 'Pending').length}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base text-gray-600">Completed</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">
                {prescriptions.filter(p => p.status === 'Completed').length}
              </p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Prescription
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 md:px-6 py-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">No prescriptions found</p>
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {prescription.fileType === 'application/pdf' || prescription.fileType?.includes('pdf') ? (
                            <FileText size={20} className="text-gray-400" />
                          ) : (
                            <img
                              src={getFileUrl(prescription.fileUrl)}
                              alt="Prescription"
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {prescription.description || 'Prescription'}
                          </p>
                          <p className="text-xs text-gray-500">{prescription.originalName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {prescription.user?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">{prescription.user?.email || prescription.user?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {getStatusBadge(prescription.status)}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(prescription.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <a
                          href={getFileUrl(prescription.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View prescription"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => openStatusModal(prescription)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Update status"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Update Prescription Status</h2>
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedPrescription(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <div>{getStatusBadge(selectedPrescription.status || 'Pending')}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this prescription..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedPrescription(null)
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updateStatusMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-medical-600 text-white rounded-lg font-medium hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPrescriptions

