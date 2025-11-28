import { useState, useEffect } from 'react'
import { MessageCircle, Search, Mail, Phone, Calendar, MapPin, User, Loader2, CheckCircle2, Clock, X, AlertCircle, TrendingUp } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'all', label: 'All Requests' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
]

const statusStyles = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-50 text-gray-700 border-gray-200'
}

const priorityStyles = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-orange-50 text-orange-700 border-orange-200',
  low: 'bg-gray-50 text-gray-600 border-gray-200'
}

const AdminContactRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('new')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, searchTerm])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm.trim())

      const response = await api.get(`/admin/contact${params.toString() ? `?${params.toString()}` : ''}`)
      setRequests(response.data?.data || response.data?.messages || [])
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch contact requests'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const handleOpenModal = (request) => {
    setSelectedRequest({
      ...request,
      resolutionNotes: request.resolutionNotes || ''
    })
    setShowModal(true)
  }

  const handleStatusUpdate = async (status) => {
    if (!selectedRequest) return
    
    // If admin reply is provided, validate it
    if (selectedRequest.adminReply && selectedRequest.adminReply.trim().length < 10) {
      toast.error('Reply must be at least 10 characters')
      return
    }
    
    setUpdating(true)
    try {
      const updateData = {
        status,
        resolutionNotes: selectedRequest.resolutionNotes,
        priority: selectedRequest.priority
      }
      
      // Include admin reply if provided
      if (selectedRequest.adminReply && selectedRequest.adminReply.trim()) {
        updateData.adminReply = selectedRequest.adminReply.trim()
      }
      
      await api.patch(`/admin/contact/${selectedRequest._id}`, updateData)
      
      if (updateData.adminReply) {
        toast.success('Reply sent successfully! User has been notified via email and SMS.')
      } else {
        toast.success('Contact request updated')
      }
      
      setShowModal(false)
      setSelectedRequest(null)
      fetchRequests()
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update'
      toast.error(message)
    } finally {
      setUpdating(false)
    }
  }

  const openRequests = requests.filter((req) => req.status === 'new' || req.status === 'in_progress').length
  const resolvedRequests = requests.filter((req) => req.status === 'resolved' || req.status === 'closed').length
  const newRequests = requests.filter((req) => req.status === 'new').length
  const totalRequests = requests.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contact Requests</h1>
        <p className="text-gray-600 mt-1.5 text-sm sm:text-base">
          Manage and respond to customer enquiries
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalRequests}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <MessageCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Requests</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{newRequests}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <AlertCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Requests</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{openRequests}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{resolvedRequests}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    statusFilter === status.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contact requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 font-medium">No contact requests found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <div
                key={request._id}
                className="p-5 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => handleOpenModal(request)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      request.status === 'new' ? 'bg-blue-50 text-blue-600' :
                      request.status === 'in_progress' ? 'bg-amber-50 text-amber-600' :
                      request.status === 'resolved' ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      <MessageCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {request.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusStyles[request.status] || statusStyles.closed}`}>
                            {request.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                        {request.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} className="text-gray-400" />
                            <span className="truncate max-w-[200px]">{request.email}</span>
                          </span>
                        )}
                        {request.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone size={14} className="text-gray-400" />
                            <span>{request.phone}</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">{request.message}</p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {request.priority && (
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${priorityStyles[request.priority] || priorityStyles.low}`}>
                            {request.priority} Priority
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={12} />
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedRequest.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Received on {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedRequest(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Mail size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="break-all">{selectedRequest.email}</span>
                    </div>
                    {selectedRequest.phone && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <Phone size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{selectedRequest.phone}</span>
                      </div>
                    )}
                    {selectedRequest.metadata?.ip && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{selectedRequest.metadata.ip}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request Details</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusStyles[selectedRequest.status] || statusStyles.closed}`}>
                        {selectedRequest.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${priorityStyles[selectedRequest.priority] || priorityStyles.low}`}>
                        {selectedRequest.priority || 'Low'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Message</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.message}
                </div>
              </div>

              {/* Admin Reply (Visible to User) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Reply to User <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  rows={5}
                  value={selectedRequest.adminReply || ''}
                  onChange={(e) => setSelectedRequest({ ...selectedRequest, adminReply: e.target.value })}
                  placeholder="Type your reply to the user. This will be sent via email and SMS..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  This reply will be sent to the user via email and SMS notification
                </p>
                {selectedRequest.adminReply && selectedRequest.repliedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Replied on {formatDate(selectedRequest.repliedAt)}
                  </p>
                )}
              </div>

              {/* Resolution Notes (Internal) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Resolution Notes (Internal)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  rows={3}
                  value={selectedRequest.resolutionNotes || ''}
                  onChange={(e) => setSelectedRequest({ ...selectedRequest, resolutionNotes: e.target.value })}
                  placeholder="Add internal notes, action items, or resolution steps..."
                />
                <p className="text-xs text-gray-500 mt-1.5">These notes are for internal use only</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                {['new', 'in_progress', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                      selectedRequest.status === status
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                  >
                    {updating && selectedRequest.status !== status ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContactRequests

