import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Package, MapPin, Phone, User, LogOut, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const DeliveryBoyDashboard = () => {
  const [deliveryBoy, setDeliveryBoy] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null)
  const [statusNote, setStatusNote] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
    fetchOrders()
  }, [statusFilter])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('deliveryBoyToken') || sessionStorage.getItem('deliveryBoyToken')
      const response = await api.get('/delivery-boy/auth/me', {
        params: { token }
      })
      if (response.data.success) {
        setDeliveryBoy(response.data.data.deliveryBoy)
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout()
      }
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('deliveryBoyToken') || sessionStorage.getItem('deliveryBoyToken')
      const params = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await api.get('/delivery-boy/orders', {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setOrders(response.data.data || [])
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout()
      } else {
        toast.error('Failed to fetch orders')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setSelectedOrderForStatus({ orderId, newStatus })
    setStatusNote('')
  }

  const confirmStatusUpdate = async () => {
    if (!selectedOrderForStatus) return
    
    setUpdatingStatus(true)
    try {
      const token = localStorage.getItem('deliveryBoyToken') || sessionStorage.getItem('deliveryBoyToken')
      const response = await api.patch(`/delivery-boy/orders/${selectedOrderForStatus.orderId}/status`, {
        status: selectedOrderForStatus.newStatus,
        note: statusNote.trim() || undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        toast.success('Order status updated successfully!')
        setSelectedOrderForStatus(null)
        setStatusNote('')
        fetchOrders()
        fetchProfile() // Refresh stats
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('deliveryBoyToken')
    sessionStorage.removeItem('deliveryBoyToken')
    localStorage.removeItem('userRole')
    sessionStorage.removeItem('userRole')
    toast.success('Logged out successfully')
    navigate('/delivery-boy/login')
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading && !deliveryBoy) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Truck size={24} className="text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Delivery Dashboard</h1>
                <p className="text-sm text-gray-600">{deliveryBoy?.name || 'Delivery Boy'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        {deliveryBoy && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryBoy.stats?.totalDeliveries || 0}</p>
                </div>
                <Package className="text-blue-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{deliveryBoy.stats?.completedDeliveries || 0}</p>
                </div>
                <CheckCircle className="text-green-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {orders.filter(o => o.status === 'out for delivery' || o.status === 'processing').length}
                  </p>
                </div>
                <Clock className="text-orange-600" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No orders assigned</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Order #{order.orderNumber || order._id.slice(-8)}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{order.user?.name || order.user?.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">DELIVERY ADDRESS</p>
                        <p className="text-sm text-gray-700">
                          {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                        {order.shippingAddress.phoneNumber && (
                          <div className="flex items-center gap-2 mt-2">
                            <a 
                              href={`tel:${order.shippingAddress.phoneNumber}`}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Phone size={14} />
                              {order.shippingAddress.phoneNumber}
                            </a>
                            {order.user?.phone && order.user.phone !== order.shippingAddress.phoneNumber && (
                              <a 
                                href={`tel:${order.user.phone}`}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <User size={14} />
                                {order.user.phone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'out for delivery')}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Start Delivery
                        </button>
                      )}
                      {order.status === 'out for delivery' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Update Order Status
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Change status to: <span className="font-semibold text-gray-900">
                {selectedOrderForStatus.newStatus}
              </span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about the status update..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedOrderForStatus(null)
                  setStatusNote('')
                }}
                disabled={updatingStatus}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={updatingStatus}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryBoyDashboard

