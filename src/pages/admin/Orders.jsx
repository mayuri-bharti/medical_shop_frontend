import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingBag, Filter, Calendar, User, ExternalLink } from 'lucide-react'
import { getOrders, updateOrderStatus } from '../../lib/api'
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

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, searchParams])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter
      }
      
      // Handle date filtering from URL params
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')
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
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      )
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
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

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">View and manage pharmacy orders</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
        <div className="flex flex-col gap-3">
          {/* Date Filter Indicator */}
          {searchParams.get('startDate') && searchParams.get('endDate') && (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">
                  Showing orders from {new Date(searchParams.get('startDate')).toLocaleDateString('en-IN', {
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
              className="flex-1 sm:flex-none px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm md:text-base font-medium"
            >
              <option value="all">All Orders</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-5">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 sm:p-12 text-center">
            <ShoppingBag className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-5 md:p-6 lg:p-7 hover:shadow-lg transition-shadow duration-200 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                      Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </h3>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
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
                    {order.prescriptionUrl && (
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
                <div className="text-left sm:text-right">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {formatCurrency(order.totalAmount || order.total)}
                  </div>
                  <div className="text-sm md:text-base text-gray-500 mt-1">
                    {order.items?.length || 0} item(s)
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
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

              {order.shippingAddress && (
                <div className="border-t border-gray-200 pt-4 text-sm text-gray-700">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Shipping Address</p>
                  <p>
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.pincode}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminOrders

