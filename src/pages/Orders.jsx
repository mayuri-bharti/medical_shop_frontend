import { useQuery } from 'react-query'
import { Package, FileText, ExternalLink, MapPin } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const statusStyles = {
  processing: 'bg-purple-100 text-purple-800',
  'out for delivery': 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

const Orders = () => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery(
    ['my-orders'],
    async () => {
      const response = await api.get('/orders/my-orders')
      return response.data?.data || []
    },
    {
      onError: (err) => {
        console.error('Orders fetch error:', err)
        toast.error(err?.message || 'Failed to load orders')
      },
      refetchOnWindowFocus: false
    }
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Your order history will appear here once you place an order.</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-block px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">Track the status of your medicine orders.</p>
      </div>

      <div className="space-y-4">
        {data.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.orderNumber || order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusStyles[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {formatStatus(order.status)}
                </span>
                {order.prescriptionUrl && (
                  <a
                    href={order.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-medical-600 hover:text-medical-700"
                  >
                    <FileText size={16} />
                    View Prescription
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name || item.product?.name}
                    </p>
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

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/orders/${order._id}/track`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                >
                  <MapPin size={18} />
                  Track Order
                </button>
                {order.prescriptionUrl && (
                  <a
                    href={order.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-medical-600 hover:text-medical-700"
                  >
                    <FileText size={16} />
                    View Prescription
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <div className="text-sm text-gray-600">
                  Payment Method: <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                  <span className="ml-4">
                    Payment Status: <span className="font-medium text-gray-900">{order.paymentStatus}</span>
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  Total: {formatCurrency(order.totalAmount || order.total)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders