import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import PageCarousel from '../components/PageCarousel'
import toast from 'react-hot-toast'

const Cart = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://medical-shop-backend.vercel.app/api'

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_BASE}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setCart(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    // For now, just update locally
    // TODO: Implement API call to update quantity
    const updatedCart = { ...cart }
    const item = updatedCart.items.find(item => item.product._id === productId)
    if (item) {
      item.quantity = newQuantity
    }
    setCart(updatedCart)
  }

  const handleRemoveItem = async (productId) => {
    try {
      const token = getAccessToken()
      const response = await fetch(`${API_BASE}/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        toast.success('Item removed from cart')
        fetchCart()
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (error) {
      console.error('Remove item error:', error)
      toast.error('Failed to remove item')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="text-center max-w-md">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some medicines to get started!</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-medical-600 text-white font-medium rounded-lg hover:bg-medical-700 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    )
  }

  // Cart Page Offers Carousel
  const cartOffers = [
    {
      src: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1200&h=300&fit=crop',
      alt: 'Free Delivery',
      title: 'Free Delivery on Orders Above ₹499',
      description: 'Shop more, save more on delivery charges'
    },
    {
      src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=300&fit=crop',
      alt: 'Save More',
      title: 'Extra 10% Off on First Order',
      description: 'Use code: FIRST10 at checkout'
    },
    {
      src: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&h=300&fit=crop',
      alt: 'Wallet Offers',
      title: 'Instant Cashback with Wallet',
      description: 'Get 5% cashback on payments via digital wallet'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cart Offers Carousel */}
        <div className="mb-8">
          <PageCarousel 
            images={cartOffers}
            autoSlide={true}
            interval={4000}
            height="h-32 md:h-40 lg:h-48"
          />
        </div>

        <div className="flex items-center space-x-2 mb-8">
          <ShoppingCart className="text-medical-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.product._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.product.image || '/placeholder-medicine.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.product.brand}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">₹{cart.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-semibold">₹{cart.taxes.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{cart.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3 bg-medical-600 text-white font-medium rounded-lg hover:bg-medical-700 transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-sm text-gray-600 text-center mt-4">
                Free delivery on orders above ₹499
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart ;