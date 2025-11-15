import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  Package, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  ArrowLeft,
  RefreshCw,
  Clock,
  XCircle
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const statusConfig = {
  'processing': {
    label: 'Processing',
    icon: Package,
    color: 'bg-purple-500',
    description: 'Your order is being processed'
  },
  'out for delivery': {
    label: 'Out for Delivery',
    icon: Truck,
    color: 'bg-indigo-500',
    description: 'Your order is on the way'
  },
  'delivered': {
    label: 'Delivered',
    icon: CheckCircle2,
    color: 'bg-green-500',
    description: 'Your order has been delivered'
  },
  'cancelled': {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-red-500',
    description: 'Your order has been cancelled'
  }
}

const statusOrder = ['processing', 'out for delivery', 'delivered']

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const OrderTracking = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useQuery(
    ['order-tracking', id],
    async () => {
      const response = await api.get(`/orders/${id}/tracking`)
      return response.data?.data || null
    },
    {
      onError: (err) => {
        console.error('Order tracking error:', err)
        toast.error(err?.response?.data?.message || 'Failed to load order tracking')
      },
      refetchInterval: 30000, // Auto-refresh every 30 seconds
      refetchOnWindowFocus: true
    }
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">Unable to load order tracking information.</p>
          <button
            onClick={() => navigate('/orders')}
            className="inline-block px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  const currentStatus = data.status?.toLowerCase() || 'processing'
  const isCancelled = currentStatus === 'cancelled'
  const currentStatusIndex = statusOrder.indexOf(currentStatus)
  const statusHistory = data.statusHistory || []

  // Get all statuses that should be shown
  const statusesToShow = isCancelled 
    ? ['processing', 'cancelled']
    : statusOrder

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-medical-600 hover:text-medical-700 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
            <p className="mt-2 text-gray-600">
              Order #{data.orderNumber || data._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-medical-100 text-medical-700 rounded-lg hover:bg-medical-200 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(data.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-base font-semibold text-gray-900">
              {formatCurrency(data.totalAmount || data.total)}
            </p>
          </div>
        </div>
        {data.shippingAddress && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-2">Delivery Address</p>
            <p className="text-sm text-gray-900">
              {data.shippingAddress.name}, {data.shippingAddress.phoneNumber}
              <br />
              {data.shippingAddress.address}, {data.shippingAddress.city}, {data.shippingAddress.state} - {data.shippingAddress.pincode}
            </p>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
        
        <div className="relative">
          {/* Timeline line */}
          {!isCancelled && (
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          )}
          
          <div className="space-y-6">
            {statusesToShow.map((status, index) => {
              const statusKey = status.toLowerCase()
              const config = statusConfig[statusKey] || statusConfig['processing']
              const Icon = config.icon
              const isCompleted = isCancelled 
                ? (statusKey === 'cancelled' || statusKey === 'processing')
                : currentStatusIndex >= index
              const isCurrent = currentStatus === statusKey
              const historyEntry = statusHistory.find(h => h.status?.toLowerCase() === statusKey)
              
              // For cancelled orders, show processing as completed
              if (isCancelled && statusKey === 'processing') {
                return (
                  <div key={status} className="relative flex items-start gap-4">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-semibold text-gray-900">Processing</h3>
                      <p className="text-sm text-gray-600 mt-1">Order was being processed</p>
                      {historyEntry?.changedAt && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(historyEntry.changedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <div key={status} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                    isCompleted 
                      ? `${config.color} text-white` 
                      : 'bg-gray-200 text-gray-400'
                  } transition-all duration-300`}>
                    <Icon size={24} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {config.label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {config.description}
                        </p>
                        {historyEntry?.changedAt && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(historyEntry.changedAt)}
                          </p>
                        )}
                        {historyEntry?.note && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            {historyEntry.note}
                          </p>
                        )}
                      </div>
                      {isCurrent && (
                        <span className="px-3 py-1 bg-medical-100 text-medical-700 rounded-full text-xs font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-3">
          {data.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name || item.product?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Quantity: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(data.totalAmount || data.total)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking


