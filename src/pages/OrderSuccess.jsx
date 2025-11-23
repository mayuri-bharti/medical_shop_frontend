import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Package, Home } from 'lucide-react'
import { getAccessToken } from '../lib/api'

const OrderSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState('')

  useEffect(() => {
    // If order is already passed via state, use it immediately
    if (order) {
      setLoading(false)
      return
    }

    // Fallback: Try to fetch from sessionStorage first (in case of page refresh)
    const storedOrder = sessionStorage.getItem('lastPlacedOrder')
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder)
        setOrder(parsedOrder)
        setLoading(false)
        sessionStorage.removeItem('lastPlacedOrder')
        return
      } catch (e) {
        console.error('Failed to parse stored order:', e)
      }
    }

    // Last resort: Fetch from API (with retry logic for eventual consistency)
    const fetchLatestOrder = async (retries = 3) => {
      setLoading(true)
      setError('')
      try {
        const token = getAccessToken()
        if (!token) {
          navigate('/login?redirect=' + encodeURIComponent('/order-success'))
          return
        }
        
        // Fetch user's orders and pick the most recent one
        const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await resp.json()
        if (!resp.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to load orders')
        }
        const list = Array.isArray(data?.orders) ? data.orders : (Array.isArray(data?.data) ? data.data : [])
        
        if (list.length > 0) {
          // Sort by createdAt desc to get the most recent
          const sorted = [...list].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0)
            const dateB = new Date(b.createdAt || b.created_at || 0)
            return dateB - dateA
          })
          const latest = sorted[0]
          setOrder({
            orderNumber: latest.orderNumber || latest._id?.slice(-8).toUpperCase() || '—',
            orderId: latest._id || latest.id || '—',
            status: latest.status || 'processing',
            total: latest.totalAmount || latest.total || latest.amount || 0,
            items: (latest.items || []).map(it => ({
              name: it.name || it.product?.name || 'Item',
              qty: it.quantity || it.qty || 1,
              price: it.price || it.product?.price || 0
            })),
            address: {
              name: latest.shippingAddress?.name || '—',
              street: latest.shippingAddress?.address || latest.shippingAddress?.street || '—',
              city: latest.shippingAddress?.city || '—',
              state: latest.shippingAddress?.state || '—',
              pincode: latest.shippingAddress?.pincode || '—',
              phone: latest.shippingAddress?.phoneNumber || latest.shippingAddress?.phone || '—'
            }
          })
          setLoading(false)
        } else if (retries > 0) {
          // Retry after a short delay if no orders found (eventual consistency)
          setTimeout(() => fetchLatestOrder(retries - 1), 1000)
        } else {
          setError('No recent order found')
          setLoading(false)
        }
      } catch (e) {
        if (retries > 0) {
          // Retry on error
          setTimeout(() => fetchLatestOrder(retries - 1), 1000)
        } else {
          setError(e.message || 'Failed to fetch order')
          setLoading(false)
        }
      }
    }

    fetchLatestOrder()
  }, [order, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="text-green-600" size={48} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 mb-8">
            Your order has been confirmed and will be delivered soon
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold text-gray-900">{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold text-gray-900 font-mono text-sm">
                  {order.orderId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-xl text-gray-900">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Package className="text-medical-600" size={20} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.qty} × ₹{item.price}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{order.address.name}</p>
              <p className="text-gray-600">{order.address.street}</p>
              <p className="text-gray-600">
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p className="text-gray-600">Phone: {order.address.phone}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
            >
              <Package size={20} />
              <span>View My Orders</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home size={20} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess






