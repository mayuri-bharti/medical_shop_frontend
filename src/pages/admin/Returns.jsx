import { useState, useEffect } from 'react'
import { RefreshCw, Filter, CheckCircle, X, Clock, Package, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

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

const AdminReturns = () => {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateData, setUpdateData] = useState({
    status: '',
    note: '',
    pickupDate: '',
    pickupTimeSlot: '',
    trackingNumber: '',
    refundTransactionId: '',
    adminNotes: ''
  })

  useEffect(() => {
    fetchReturns()
  }, [statusFilter])

  const fetchReturns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await api.get(`/returns/admin/all${params.toString() ? `?${params.toString()}` : ''}`)

      if (response.data?.success) {
        setReturns(response.data.data || [])
      } else {
        setReturns([])
        toast.error(response.data?.message || 'Failed to fetch returns')
      }
    } catch (error) {
      console.error('Failed to fetch returns:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch returns')
      setReturns([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/returns/admin/${selectedReturn._id}/status`, updateData)
      toast.success('Return status updated successfully')
      setShowUpdateModal(false)
      setSelectedReturn(null)
      setUpdateData({
        status: '',
        note: '',
        pickupDate: '',
        pickupTimeSlot: '',
        trackingNumber: '',
        refundTransactionId: '',
        adminNotes: ''
      })
      fetchReturns()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update return status')
    }
  }

  const openUpdateModal = (returnRequest) => {
    setSelectedReturn(returnRequest)
    setUpdateData({
      status: returnRequest.status,
      note: '',
      pickupDate: returnRequest.pickupDate ? new Date(returnRequest.pickupDate).toISOString().split('T')[0] : '',
      pickupTimeSlot: returnRequest.pickupTimeSlot || '',
      trackingNumber: returnRequest.trackingNumber || '',
      refundTransactionId: returnRequest.refundTransactionId || '',
      adminNotes: returnRequest.adminNotes || ''
    })
    setShowUpdateModal(true)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Returns & Refunds</h1>
          <p className="text-gray-600 mt-1">Manage return and refund requests</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
          >
            <option value="all">All Status</option>
            {Object.keys(statusConfig).map((status) => (
              <option key={status} value={status}>
                {statusConfig[status].label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchReturns}
            className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <RefreshCw className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Returns Found</h2>
          <p className="text-gray-600">No return requests match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnRequest) => {
            const StatusIcon = statusConfig[returnRequest.status]?.icon || AlertCircle
            const statusInfo = statusConfig[returnRequest.status] || statusConfig.pending

            return (
              <div
                key={returnRequest._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
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
                      <p className="text-sm text-gray-600">
                        User: {returnRequest.user?.name || 'N/A'} ({returnRequest.user?.phone || 'N/A'})
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

                  <div className="border-t border-gray-200 pt-4 mb-4">
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

                  <div className="border-t border-gray-200 pt-4 mb-4">
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

                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => openUpdateModal(returnRequest)}
                      className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showUpdateModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Update Return Status</h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false)
                  setSelectedReturn(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                >
                  {Object.keys(statusConfig).map((status) => (
                    <option key={status} value={status}>
                      {statusConfig[status].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={updateData.note}
                  onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  placeholder="Add a note about this status update..."
                />
              </div>

              {['pickup_scheduled', 'picked_up'].includes(updateData.status) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                    <input
                      type="date"
                      value={updateData.pickupDate}
                      onChange={(e) => setUpdateData({ ...updateData, pickupDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time Slot</label>
                    <input
                      type="text"
                      value={updateData.pickupTimeSlot}
                      onChange={(e) => setUpdateData({ ...updateData, pickupTimeSlot: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      placeholder="e.g., 10:00 AM - 2:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={updateData.trackingNumber}
                      onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      placeholder="Enter tracking number"
                    />
                  </div>
                </>
              )}

              {['refund_processed', 'completed'].includes(updateData.status) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Refund Transaction ID</label>
                  <input
                    type="text"
                    value={updateData.refundTransactionId}
                    onChange={(e) => setUpdateData({ ...updateData, refundTransactionId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                    placeholder="Enter transaction ID"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  placeholder="Internal notes (not visible to customer)..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedReturn(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReturns












