import { useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle, XCircle, Clock, X, Image as ImageIcon, Eye } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
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

const Claims = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { data, isLoading, error, refetch } = useQuery(
    ['my-claims'],
    async () => {
      const response = await api.get('/claims/my-claims')
      return response.data?.data || []
    },
    {
      onError: (err) => {
        console.error('Claims fetch error:', err)
        toast.error(err?.response?.data?.message || 'Failed to load claims')
      },
      refetchOnWindowFocus: false
    }
  )

  // If viewing a specific claim
  const { data: claimDetail } = useQuery(
    ['claim-detail', id],
    async () => {
      if (!id) return null
      const response = await api.get(`/claims/${id}`)
      return response.data?.data || null
    },
    {
      enabled: !!id,
      onError: (err) => {
        console.error('Claim detail error:', err)
        toast.error(err?.response?.data?.message || 'Failed to load claim details')
      }
    }
  )

  const handleViewDetails = (claim) => {
    setSelectedClaim(claim)
    setShowDetailModal(true)
  }

  const displayClaim = id ? claimDetail : selectedClaim

  // If viewing a single claim detail
  if (id && claimDetail) {
    const StatusIcon = statusConfig[claimDetail.status]?.icon || Clock
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/claims')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Claims
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Claim #{claimDetail._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Order #{claimDetail.order?.orderNumber || claimDetail.order?._id?.slice(-8) || 'N/A'}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[claimDetail.status]?.color || 'bg-gray-100 text-gray-800'}`}>
              <StatusIcon size={14} />
              {statusConfig[claimDetail.status]?.label || claimDetail.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-gray-500">Reason</p>
              <p className="text-gray-900">{claimDetail.reason}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date Submitted</p>
              <p className="text-gray-900">{formatDate(claimDetail.createdAt)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{claimDetail.description}</p>
          </div>

          {claimDetail.items && claimDetail.items.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Claimed Items</p>
              <div className="space-y-2">
                {claimDetail.items.map((item, index) => (
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
          )}

          {claimDetail.images && claimDetail.images.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Images</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {claimDetail.images.map((img, index) => (
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

          {/* Admin Reply Section */}
          {claimDetail.adminNote && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CheckCircle className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Admin Reply</p>
                  <p className="text-sm text-gray-700">{claimDetail.adminNote}</p>
                  {claimDetail.resolvedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Replied on {formatDate(claimDetail.resolvedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!claimDetail.adminNote && claimDetail.status !== 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Your claim has been {claimDetail.status}. Admin will contact you soon if needed.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Claims</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Claims Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't raised any claims yet. Claims can be created for delivered orders.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors font-medium"
          >
            View My Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Claims</h1>
      </div>

      <div className="space-y-4">
        {data.map((claim) => {
          const StatusIcon = statusConfig[claim.status]?.icon || Clock
          const statusInfo = statusConfig[claim.status] || statusConfig.pending

          return (
            <div
              key={claim._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Claim #{claim._id.slice(-8).toUpperCase()}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Order: {claim.order?.orderNumber || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reason: {claim.reason}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted on {formatDate(claim.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleViewDetails(claim)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                  </div>
                </div>

                {claim.description && (
                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">{claim.description}</p>
                )}

                {/* Admin Reply Preview */}
                {claim.adminNote && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Admin Reply:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{claim.adminNote}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Claim Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

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
                  <p className="text-sm font-medium text-gray-500">Order</p>
                  <p className="text-gray-900">#{selectedClaim.order?.orderNumber || selectedClaim.order?._id?.slice(-8) || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Total: {formatCurrency(selectedClaim.order?.total || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p className="text-gray-900">{selectedClaim.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Submitted</p>
                  <p className="text-gray-900">{formatDate(selectedClaim.createdAt)}</p>
                </div>
              </div>

              {/* Items */}
              {selectedClaim.items && selectedClaim.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Claimed Items</p>
                  <div className="space-y-2">
                    {selectedClaim.items.map((item, index) => (
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
              )}

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Description</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedClaim.description}</p>
              </div>

              {/* Images */}
              {selectedClaim.images && selectedClaim.images.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Uploaded Images</p>
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

              {/* Admin Reply - Highlighted */}
              {selectedClaim.adminNote ? (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <CheckCircle className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900 mb-2">Admin Reply</p>
                      <p className="text-gray-900 leading-relaxed">{selectedClaim.adminNote}</p>
                      {selectedClaim.resolvedAt && (
                        <p className="text-xs text-gray-600 mt-3">
                          Replied on {formatDate(selectedClaim.resolvedAt)}
                          {selectedClaim.resolvedBy && ` by ${selectedClaim.resolvedBy.name || 'Admin'}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedClaim.status !== 'pending' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Your claim has been {selectedClaim.status}. {selectedClaim.status === 'approved' ? 'We will process it soon.' : 'If you have questions, please contact support.'}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Your claim is under review. We will update you soon.
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

export default Claims

