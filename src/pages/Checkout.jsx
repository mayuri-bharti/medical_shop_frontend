import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, CreditCard, Smartphone, Wallet, CheckCircle } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import toast from 'react-hot-toast'

const Checkout = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState(null)
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

  const handlePrescriptionChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setPrescriptionFile(file)
    }
  }

  useEffect(() => {
    // Check if we need to add a product to cart (from Buy Now redirect)
    const productId = searchParams.get('productId')
    const quantity = parseInt(searchParams.get('quantity')) || 1
    
    if (productId) {
      addProductToCart(productId, quantity).then(() => {
        fetchCart()
        // Remove productId from URL
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('productId')
        newParams.delete('quantity')
        navigate(`/checkout?${newParams.toString()}`, { replace: true })
      })
    } else {
      fetchCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addProductToCart = async (productId, quantity) => {
    try {
      const token = getAccessToken()
      if (!token) {
        toast.error('Please login to continue')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Product added to cart!')
      } else {
        throw new Error(data.message || 'Failed to add product to cart')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error(error.message || 'Failed to add product to cart')
    }
  }

  const fetchCart = async () => {
    try {
      const token = getAccessToken()
      if (!token) {
        toast.error('Please login to continue')
        navigate('/login?redirect=' + encodeURIComponent('/checkout'))
        return
      }

      const response = await fetch(
        `${API_BASE}/cart`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      const data = await response.json()
      if (data.success) {
        setCart(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch cart')
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      toast.error('Failed to load cart')
      // If unauthorized, redirect to login
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        navigate('/login?redirect=' + encodeURIComponent('/checkout'))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) {
      return
    }

    try {
      const token = getAccessToken()
      if (!token) {
        toast.error('Please log in to place an order')
        return
      }

      if (!shippingAddress || !shippingAddress.name) {
        toast.error('Please select or add an address')
        return
      }

      const selectedItems = Array.isArray(cart?.items)
        ? cart.items.map((item) => ({
            cartItemId: item?._id || item?.id,
            productId: item?.product?._id || item?.product?.id || item?.product,
            quantity: item?.quantity ?? 1
          }))
        : []

      if (!selectedItems.length) {
        toast.error('Your cart is empty')
        return
      }

      setLoading(true)

      // Step 1: Upload prescription if file exists
      let prescriptionId = null
      if (prescriptionFile) {
        try {
          const formData = new FormData()
          formData.append('prescription', prescriptionFile)
          
          if (shippingAddress.description) {
            formData.append('description', shippingAddress.description)
          }

          const prescriptionResponse = await fetch(`${API_BASE}/prescriptions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
              // Don't set Content-Type - browser will set it with boundary for FormData
            },
            body: formData
          })

          const prescriptionData = await prescriptionResponse.json()
          
          if (prescriptionResponse.ok && prescriptionData.success) {
            prescriptionId = prescriptionData.data?.prescriptionId || prescriptionData.data?._id
            toast.success('Prescription uploaded successfully')
          } else {
            console.error('Prescription upload failed:', prescriptionData)
            toast.error('Failed to upload prescription, but continuing with order...')
          }
        } catch (error) {
          console.error('Prescription upload error:', error)
          toast.error('Failed to upload prescription, but continuing with order...')
        }
      }

      // Step 2: Create order with prescription ID
      const payload = {
        shippingAddress,
        paymentMethod,
        selectedItems,
        ...(prescriptionId && { prescriptionId })
      }

      const response = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Order placed successfully!')
        navigate('/orders')
      } else {
        throw new Error(data.message || 'Order failed')
      }
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }
  

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="text-medical-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phoneNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\\D/g, '').slice(0, 10)
                        setShippingAddress({ ...shippingAddress, phoneNumber: digitsOnly })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      placeholder="House/Flat No., Building Name"
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={shippingAddress.pincode}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\\D/g, '').slice(0, 6)
                        setShippingAddress({ ...shippingAddress, pincode: digitsOnly })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.landmark}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    placeholder="Near..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CreditCard className="text-medical-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-medical-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-medical-600"
                  />
                  <Smartphone size={24} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-medical-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-medical-600"
                  />
                  <CreditCard size={24} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Online Payment</div>
                    <div className="text-sm text-gray-600">Debit/Credit Card (Mock)</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-medical-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="WALLET"
                    checked={paymentMethod === 'WALLET'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-medical-600"
                  />
                  <Wallet size={24} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Wallet</div>
                    <div className="text-sm text-gray-600">Paytm/UPI (Mock)</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Prescription Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle className="text-medical-600" size={24} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Prescription</h2>
                  <p className="text-sm text-gray-600">Upload a clear photo or PDF of your prescription.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription File *
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePrescriptionChange}
                  className="w-full"
                  required
                />
                {prescriptionFile && (
                  <div className="rounded-lg border border-medical-100 bg-medical-50 px-4 py-3 text-sm text-medical-700">
                    <p className="font-medium">{prescriptionFile.name}</p>
                    <p className="text-xs text-medical-500">
                      {(prescriptionFile.size / 1024 / 1024).toFixed(2)} MB • {prescriptionFile.type}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-medical-600 hover:bg-medical-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : `Place Order - ₹${cart.total}`}
            </button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      <img
                        src={item.product?.image || '/placeholder.jpg'}
                        alt={item.product?.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">
                    {cart.deliveryFee === 0 ? 'Free' : `₹${cart.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span className="text-gray-900">₹{cart.taxes.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">₹{cart.total.toLocaleString()}</span>
                </div>
              </div>

              {cart.subtotal < 499 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  Add ₹{(499 - cart.subtotal).toLocaleString()} more for free delivery
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout

