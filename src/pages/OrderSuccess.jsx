import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Package, Home } from 'lucide-react'

const OrderSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
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










