import { useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, RefreshCw, X, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import ReturnRequestForm from '../components/ReturnRequestForm'

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: X },
  pickup_scheduled: { label: 'Pickup Scheduled', color: 'bg-indigo-100 text-indigo-800', icon: Clock },
  picked_up: { label: 'Picked Up', color: 'bg-purple-100 text-purple-800', icon: Package },
  refund_processed: { label: 'Refund Processed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: X }
}

const Returns = () => {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data, isLoading, error, refetch } = useQuery(
    ['my-returns'],
    async () => {
      const response = await api.get('/returns/my-returns')
      return response.data?.data || []
    },
    {
      onError: (err) => {
        console.error('Returns fetch error:', err)
        toast.error(err?.response?.data?.message || 'Failed to load returns')
      },
      refetchOnWindowFocus: false
    }
  )

  const handleCreateReturn = (order) => {
    setSelectedOrder(order)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedOrder(null)
    refetch()
  }

  const handleCancelReturn = async (returnId) => {
    if (!window.confirm('Are you sure you want to cancel this return request?')) {
      return
    }

    try {
      await api.post(`/returns/${returnId}/cancel`)
      toast.success('Return request cancelled')
      refetch()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel return')
    }
  }

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Returns & Refunds</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Returns Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't requested any returns yet. Return requests can be created for delivered orders.
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Returns & Refunds</h1>
      </div>

      <div className="space-y-4">
        {data.map((returnRequest) => {
          const StatusIcon = statusConfig[returnRequest.status]?.icon || AlertCircle
          const statusInfo = statusConfig[returnRequest.status] || statusConfig.pending

          return (
            <div
              key={returnRequest._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Return #{returnRequest.returnNumber}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Order: {returnRequest.order?.orderNumber || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested on {formatDate(returnRequest.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(returnRequest.refundAmount)}
                    </p>
                    <p className="text-xs text-gray-500">Refund Amount</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Items to Return:</h4>
                  <div className="space-y-2">
                    {returnRequest.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-contain rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Reason:</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {returnRequest.reason?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Refund Method:</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {returnRequest.refundMethod?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    {returnRequest.reasonDescription && (
                      <div className="md:col-span-2">
                        <p className="text-gray-600 mb-1">Description:</p>
                        <p className="text-gray-900">{returnRequest.reasonDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

                {returnRequest.statusHistory && returnRequest.statusHistory.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Status History:</h4>
                    <div className="space-y-2">
                      {returnRequest.statusHistory
                        .slice()
                        .reverse()
                        .map((history, index) => (
                          <div key={index} className="flex items-start gap-3 text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {statusConfig[history.status]?.label || history.status}
                              </p>
                              {history.note && (
                                <p className="text-gray-600 text-xs mt-1">{history.note}</p>
                              )}
                              <p className="text-gray-500 text-xs mt-1">
                                {formatDate(history.changedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {returnRequest.trackingNumber && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                      Tracking Number: <span className="font-medium text-gray-900">{returnRequest.trackingNumber}</span>
                    </p>
                  </div>
                )}

                {['pending', 'approved'].includes(returnRequest.status) && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <button
                      onClick={() => handleCancelReturn(returnRequest._id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Cancel Return Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && selectedOrder && (
        <ReturnRequestForm
          order={selectedOrder}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Returns


