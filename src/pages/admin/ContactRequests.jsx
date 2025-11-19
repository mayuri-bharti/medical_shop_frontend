import { useState, useEffect } from 'react'
import { MessageCircle, Search, Mail, Phone, Calendar, MapPin, User, Loader2, CheckCircle2, Clock } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
]

const statusStyles = {
  new: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-700'
}

const priorityStyles = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-gray-100 text-gray-700'
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
    setUpdating(true)
    try {
      await api.patch(`/admin/contact/${selectedRequest._id}`, {
        status,
        resolutionNotes: selectedRequest.resolutionNotes,
        priority: selectedRequest.priority
      })
      toast.success('Contact request updated')
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

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Contact Requests</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">
          Track and respond to enquiries submitted via the contact page
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Open Requests</p>
            <p className="text-2xl font-semibold text-gray-900">
              {requests.filter((req) => req.status === 'new' || req.status === 'in_progress').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-3 rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Resolved Today</p>
            <p className="text-2xl font-semibold text-gray-900">
              {requests.filter((req) => req.status === 'resolved' || req.status === 'closed').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">Filter by status</p>
            <div className="flex gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    statusFilter === status.value ? 'bg-medical-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm md:text-base"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contact requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No contact requests found for the current filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <div
                key={request._id}
                className="p-4 md:p-5 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => handleOpenModal(request)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-medical-50 text-medical-600">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{request.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                        {request.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={14} /> {request.email}
                          </span>
                        )}
                        {request.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} /> {request.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{request.message}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[request.status]}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityStyles[request.priority]}`}>
                          {request.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} /> {formatDate(request.createdAt)}
                    </div>
                    {request.metadata?.ip && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> {request.metadata.ip}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedRequest.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Received on {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedRequest(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} /> {selectedRequest.email}
                </p>
                {selectedRequest.phone && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} /> {selectedRequest.phone}
                  </p>
                )}
                {selectedRequest.metadata?.ip && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} /> {selectedRequest.metadata.ip}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                <p className="flex items-center gap-2 text-gray-600">
                  <User size={16} /> Status: <span className="capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} /> Priority: <span className="capitalize">{selectedRequest.priority}</span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Message</p>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-800 leading-relaxed">
                {selectedRequest.message}
              </div>
            </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Resolution Notes</label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-medical-500 focus:border-transparent"
              rows={3}
              value={selectedRequest.resolutionNotes}
              onChange={(e) => setSelectedRequest({ ...selectedRequest, resolutionNotes: e.target.value })}
              placeholder="Add internal notes or next steps..."
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-end pt-2">
            {['new', 'in_progress', 'resolved', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border transition ${
                  selectedRequest.status === status
                    ? 'bg-medical-600 text-white border-medical-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {updating && selectedRequest.status !== status ? <Loader2 className="w-4 h-4 animate-spin" /> : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default AdminContactRequests

