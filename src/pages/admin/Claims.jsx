import { useState, useEffect } from 'react'
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, X, Image as ImageIcon } from 'lucide-react'
import { api } from '../../services/api'
import { getAdminToken } from '../../lib/api'
import toast from 'react-hot-toast'

const statusOptions = ['all', 'pending', 'approved', 'rejected', 'resolved']

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  resolved: { label: 'Resolved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

const AdminClaims = () => {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [action, setAction] = useState(null) // 'approve', 'reject', 'resolve'

  useEffect(() => {
    fetchClaims()
  }, [statusFilter])

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      // API interceptor will automatically use admin token since we're on an admin route
      const response = await api.get('/claims', { params })

      if (response.data.success) {
        setClaims(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
      const errorMessage = error.response?.data?.message || 'Failed to fetch claims'
      toast.error(errorMessage)
      
      // If access denied, redirect to admin login
      if (error.response?.status === 403 || error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/admin/login'
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (claim) => {
    setSelectedClaim(claim)
    setAdminNote(claim.adminNote || '')
    setAction(null)
    setShowDetailModal(true)
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedClaim) return

    setUpdating(true)
    try {
      // API interceptor will automatically use admin token since we're on an admin route
      const response = await api.patch(`/claims/${selectedClaim._id}`, {
        status: newStatus,
        adminNote: adminNote.trim() || undefined
      })

      if (response.data.success) {
        toast.success(`Claim ${newStatus} successfully`)
        setShowDetailModal(false)
        setSelectedClaim(null)
        setAdminNote('')
        fetchClaims()
      }
    } catch (error) {
      console.error('Update claim error:', error)
      toast.error(error?.response?.data?.message || 'Failed to update claim')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="px-6 sm:px-8 py-6 max-w-screen-xl mx-auto w-full space-y-6 pb-10">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Claims Management</h1>
        <p className="text-gray-600 mt-1.5 text-sm sm:text-base">Manage customer claims and disputes</p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} className="text-gray-400 flex-shrink-0" />
            <label className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">Status:</label>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white hover:border-gray-400 transition-colors"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Claims' : statusConfig[status]?.label || status}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-4">
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        )}

        {!loading && claims.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertTriangle className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600">No claims found</p>
          </div>
        )}

        {!loading && claims.length > 0 &&
          claims.map((claim) => {
            const StatusIcon = statusConfig[claim.status]?.icon || Clock
            return (
              <article
                key={claim._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        Claim #{claim._id.slice(-8).toUpperCase()}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[claim.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        <StatusIcon size={14} />
                        {statusConfig[claim.status]?.label || claim.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-700">User:</span>{' '}
                        {claim.user?.name || 'Unknown'} ({claim.user?.phone || 'N/A'})
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Order:</span>{' '}
                        #{claim.order?.orderNumber || claim.order?._id?.slice(-8) || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Reason:</span> {claim.reason}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date:</span> {formatDate(claim.createdAt)}
                      </div>
                    </div>
                    {claim.description && (
                      <p className="mt-3 text-sm text-gray-700 line-clamp-2">{claim.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleViewDetails(claim)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
      </section>

      {/* Detail Modal */}
      {showDetailModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Claim Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedClaim(null)
                  setAdminNote('')
                  setAction(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Claim Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Claim ID</p>
                  <p className="text-lg font-semibold text-gray-900">#{selectedClaim._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  {(() => {
                    const StatusIconComp = statusConfig[selectedClaim.status]?.icon || Clock
                    return (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[selectedClaim.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        <StatusIconComp size={14} />
                        {statusConfig[selectedClaim.status]?.label || selectedClaim.status}
                      </span>
                    )
                  })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <p className="text-gray-900">{selectedClaim.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{selectedClaim.user?.email || ''}</p>
                  <p className="text-sm text-gray-600">{selectedClaim.user?.phone || ''}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Order</p>
                  <p className="text-gray-900">#{selectedClaim.order?.orderNumber || selectedClaim.order?._id?.slice(-8) || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Total: {formatCurrency(selectedClaim.order?.total || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p className="text-gray-900">{selectedClaim.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-gray-900">{formatDate(selectedClaim.createdAt)}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Claimed Items</p>
                <div className="space-y-2">
                  {selectedClaim.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedClaim.description}</p>
              </div>

              {/* Images */}
              {selectedClaim.images && selectedClaim.images.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedClaim.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.url}
                          alt={`Claim image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                        >
                          <ImageIcon size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a note about this claim..."
                />
              </div>

              {/* Actions */}
              {selectedClaim.status !== 'resolved' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  {selectedClaim.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('approved')}
                        disabled={updating}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={updating}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </>
                  )}
                  {(selectedClaim.status === 'approved' || selectedClaim.status === 'rejected') && (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedClaim(null)
                      setAdminNote('')
                      setAction(null)
                    }}
                    disabled={updating}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              )}

              {selectedClaim.status === 'resolved' && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Resolved on {formatDate(selectedClaim.resolvedAt)} by {selectedClaim.resolvedBy?.name || 'Admin'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminClaims

