import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingBag, Filter, Calendar, User, ExternalLink, FileText, Download, Eye, Truck, X } from 'lucide-react'
import { getOrders, updateOrderStatus } from '../../lib/api'
import { getAdminToken, getAccessToken } from '../../lib/api'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const statusOptions = ['processing', 'out for delivery', 'delivered', 'cancelled']

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [deliveryBoys, setDeliveryBoys] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  useEffect(() => {
    fetchOrders({ startDate: startDateParam, endDate: endDateParam })
    fetchDeliveryBoys()
  }, [statusFilter, startDateParam, endDateParam])

  const fetchDeliveryBoys = async () => {
    try {
      const response = await api.get('/admin/delivery-boys', {
        params: { limit: 100, isActive: true }
      })
      if (response.data.success) {
        setDeliveryBoys(response.data.deliveryBoys || [])
      }
    } catch (error) {
      console.error('Failed to fetch delivery boys:', error)
    }
  }

  const fetchOrders = async ({ startDate, endDate } = {}) => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter === 'need-assignment') {
        params.needAssignment = 'true'
      } else if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter
      }
      
      if (startDate) {
        params.startDate = startDate
      }
      if (endDate) {
        params.endDate = endDate
      }
      
      const response = await getOrders(params)
      
      if (response && response.success) {
        setOrders(response.orders || [])
      } else if (response && response.data && response.data.success) {
        // Handle response wrapped in data property
        setOrders(response.data.orders || [])
      } else {
        console.error('Unexpected response format:', response)
        toast.error(response?.message || 'Failed to fetch orders')
        setOrders([])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error(error.message || 'Failed to fetch orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success('Status updated')
      fetchOrders({ startDate: startDateParam, endDate: endDateParam })
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  const handleAssignDeliveryBoy = async (orderId, deliveryBoyId) => {
    setAssigning(true)
    try {
      const response = await api.patch(`/admin/orders/${orderId}/assign-delivery-boy`, {
        deliveryBoyId
      })
      
      if (response.data.success) {
        toast.success('Delivery boy assigned successfully!')
        setShowAssignModal(false)
        setSelectedOrder(null)
        fetchOrders({ startDate: startDateParam, endDate: endDateParam })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign delivery boy')
    } finally {
      setAssigning(false)
    }
  }

  const openAssignModal = (order) => {
    setSelectedOrder(order)
    setShowAssignModal(true)
  }

  const handleUnassignDeliveryBoy = async (orderId) => {
    if (!confirm('Are you sure you want to unassign the delivery boy from this order?')) {
      return
    }

    setAssigning(true)
    try {
      const response = await api.patch(`/admin/orders/${orderId}/unassign-delivery-boy`)
      
      if (response.data.success) {
        toast.success('Delivery boy unassigned successfully!')
        fetchOrders({ startDate: startDateParam, endDate: endDateParam })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unassign delivery boy')
    } finally {
      setAssigning(false)
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)

  const handleDownloadPrescription = async (prescriptionId, originalName) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
      const token = getAdminToken() || getAccessToken()
      
      if (!token) {
        toast.error('Authentication required to download files.')
        return
      }

      const downloadUrl = `${apiBaseUrl}/admin/prescriptions/${prescriptionId}/download?token=${encodeURIComponent(token)}`
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to download file.')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = originalName || `prescription_${prescriptionId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Prescription downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error(error.message || 'Failed to download prescription.')
    }
  }

  return (
    <div className="px-6 sm:px-8 py-6 max-w-screen-xl mx-auto w-full space-y-6 pb-10">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-1.5 text-sm sm:text-base">View and manage pharmacy orders</p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <div className="flex flex-col gap-3">
          {startDateParam && endDateParam && (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">
                  Showing orders from {new Date(startDateParam).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams)
                  newParams.delete('startDate')
                  newParams.delete('endDate')
                  setSearchParams(newParams)
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                Clear filter
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400 flex-shrink-0" />
              <label className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">Status:</label>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white hover:border-gray-400 transition-colors"
            >
              <option value="all">All Orders</option>
              <option value="need-assignment">Need Assignment</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingBag className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600">No orders found</p>
          </div>
        )}

        {!loading && orders.length > 0 &&
          orders.map((order) => (
            <article
              key={order._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-lg transition-shadow duration-200 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </h3>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                    {order.status === 'processing' && !order.deliveryBoy && (
                      <button
                        onClick={() => openAssignModal(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors"
                        title="Assign Delivery Boy"
                      >
                        <Truck size={14} />
                        Assign
                      </button>
                    )}
                    {order.deliveryBoy && (
                      <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded-md">
                        <Truck size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          {order.deliveryBoy.name}
                        </span>
                        {(order.status === 'processing' || order.status === 'out for delivery') && (
                          <button
                            onClick={() => handleUnassignDeliveryBoy(order._id)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                            title="Unassign Delivery Boy"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm md:text-base text-gray-600 mt-2">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {order.user?.name || order.user?.phone || 'Unknown User'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    {order.prescription && (
                      <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                        <FileText size={14} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {order.prescription.originalName || 'Prescription'}
                        </span>
                        {order.prescription.fileUrl && (
                          <a
                            href={order.prescription.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="View prescription"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDownloadPrescription(order.prescription._id, order.prescription.originalName)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Download prescription"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    )}
                    {order.prescriptionUrl && !order.prescription && (
                      <a
                        href={order.prescriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-medical-600 hover:text-medical-700 text-sm"
                      >
                        Prescription
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-xl md:text-2xl font-bold text-gray-900">
                    {formatCurrency(order.totalAmount || order.total)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {order.items?.length || 0} item(s)
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 break-words">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {order.status === 'cancelled' && order.cancellation && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-1">
                    <p className="text-sm font-semibold text-red-700">
                      User cancelled this order
                    </p>
                    {order.cancellation.reason && (
                      <p className="text-sm text-red-600">
                        Reason: <span className="font-medium">{order.cancellation.reason}</span>
                      </p>
                    )}
                    <p className="text-xs text-red-500">
                      Cancelled on {formatDate(order.cancellation.cancelledAt || order.updatedAt)} by{' '}
                      {order.user?.name || order.user?.phone || 'User'}
                    </p>
                  </div>
                </div>
              )}

              {order.prescription && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      Prescription Details
                    </p>
                    <div className="flex items-center gap-2">
                      {order.prescription.fileUrl && (
                        <a
                          href={order.prescription.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                          View
                        </a>
                      )}
                      <button
                        onClick={() => handleDownloadPrescription(order.prescription._id, order.prescription.originalName)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.prescription.originalName || 'Prescription File'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Uploaded: {formatDate(order.prescription.createdAt)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.prescription.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.prescription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.prescription.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.prescription.status || 'Pending'}
                      </span>
                    </div>
                    {order.prescription.fileUrl && (
                      <div className="flex items-center gap-3 pt-2 border-t border-blue-200">
                        <a
                          href={order.prescription.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                        >
                          <Eye size={12} />
                          View in New Tab
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.shippingAddress && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Shipping Address</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.pincode}
                  </p>
                </div>
              )}
            </article>
          ))}
      </section>

      {/* Assign Delivery Boy Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Assign Delivery Boy</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Order: <span className="font-semibold">#{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Customer: <span className="font-semibold">{selectedOrder.user?.name || selectedOrder.user?.phone}</span>
              </p>
            </div>
            {deliveryBoys.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-600">No active delivery boys available</p>
                <a href="/admin/dashboard/delivery-boys" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  Create Delivery Boy
                </a>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {deliveryBoys.map((db) => (
                  <button
                    key={db._id}
                    onClick={() => handleAssignDeliveryBoy(selectedOrder._id, db._id)}
                    disabled={assigning}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{db.name}</p>
                        <p className="text-sm text-gray-600">{db.phone}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {db.vehicleType} {db.vehicleNumber && `- ${db.vehicleNumber}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Completed: {db.stats?.completedDeliveries || 0}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders

