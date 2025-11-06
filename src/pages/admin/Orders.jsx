import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Filter, Calendar, Package, User } from 'lucide-react'
import { getOrders } from '../../lib/api'
import toast from 'react-hot-toast'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(statusFilter !== 'all' && { status: statusFilter })
      }
      const response = await getOrders(params)
      if (response.success) {
        setOrders(response.orders || [])
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase()
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[statusUpper] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">View and manage all orders</p>
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
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm md:text-base font-medium"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
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
            <div key={order._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 md:p-6 lg:p-7 hover:shadow-lg transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`px-4 py-1.5 text-xs md:text-sm font-semibold rounded-full w-fit ${getStatusColor(order.status)}`}>
                      {order.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm md:text-base text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">{order.user?.name || order.user?.phone || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-sm md:text-base text-gray-500 mt-1">
                    {order.items?.length || 0} item(s)
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-sm text-gray-500 pt-2">
                      +{order.items.length - 3} more item(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Shipping Address:</p>
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          <span className="text-sm md:text-base text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminOrders

