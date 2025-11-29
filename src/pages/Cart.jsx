import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate, normalizeCartData } from '../lib/cartEvents'
import PageCarousel from '../components/PageCarousel'
import toast from 'react-hot-toast'

const Cart = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedProductIds, setSelectedProductIds] = useState(new Set())
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  const getProductId = (product) => product?._id || product?.id || product

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
      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to fetch cart')
      }
      const normalized = normalizeCartData(data?.data || data)
      setCart(normalized)
      broadcastCartUpdate(normalized)
      setSelectedProductIds((prev) => {
        const productIds = new Set(
          normalized?.items?.map((item) => getProductId(item?.product)) || []
        )
        if (!prev.size) {
          return productIds
        }
        const preserved = new Set()
        productIds.forEach((id) => {
          if (prev.has(id)) {
            preserved.add(id)
          }
        })
        return preserved.size ? preserved : productIds
      })
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      toast.error(t('cart.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1 || !cart || !cart.items) return
    
    // For now, just update locally
    // TODO: Implement API call to update quantity
    const updatedCart = { ...cart }
    const item = updatedCart.items.find((item) => {
      if (!item) return false
      const product = item.product || item.medicine
      if (!product) return false
      return getProductId(product) === productId
    })
    if (item) {
      item.quantity = newQuantity
    }
    setCart(updatedCart)
    broadcastCartUpdate(updatedCart)
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
        toast.success(t('cart.itemRemoved'))
        fetchCart()
      } else {
        throw new Error(t('cart.failedToRemove'))
      }
    } catch (error) {
      console.error('Remove item error:', error)
      toast.error(t('cart.failedToRemove'))
    }
  }

  const toggleItemSelection = (productId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const handleSelectAll = (checked) => {
    if (!cart?.items?.length) return
    if (checked) {
      setSelectedProductIds(new Set(
        cart.items
          .filter(item => item && (item.product || item.medicine))
          .map((item) => getProductId(item.product || item.medicine))
      ))
    } else {
      setSelectedProductIds(new Set())
    }
  }

  const selectedItems = useMemo(() => {
    if (!cart?.items?.length) return []
    if (!selectedProductIds.size) return []
    return cart.items.filter((item) => {
      if (!item) return false
      const product = item.product || item.medicine
      if (!product) return false
      return selectedProductIds.has(getProductId(product))
    })
  }, [cart, selectedProductIds])

  const selectionSummary = useMemo(() => {
    const subtotal = selectedItems.reduce(
      (sum, item) =>
        sum + ((item?.price ?? item?.product?.price ?? 0) * (item?.quantity ?? 1)),
      0
    )
    const baseSubtotal = cart?.subtotal || 0
    const taxRatio = baseSubtotal > 0 ? (cart?.taxes || 0) / baseSubtotal : 0
    const taxes = Math.round(subtotal * taxRatio)
    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : cart?.deliveryFee || 0
    const total = subtotal + taxes + deliveryFee
    return { subtotal, taxes, deliveryFee, total }
  }, [selectedItems, cart])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="text-center max-w-md">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-600 mb-6">{t('cart.addMedicines')}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-medical-600 text-white font-medium rounded-lg hover:bg-medical-700 transition-colors"
          >
            {t('home.shopNow')}
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
          <h1 className="text-3xl font-bold text-gray-900">{t('cart.title')}</h1>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-medical-600"
                  checked={selectedProductIds.size > 0 && selectedProductIds.size === (cart.items || []).filter(item => item && (item.product || item.medicine)).length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">{t('cart.selectAll')}</span>
              </div>
              <span className="text-sm text-gray-500">
                {selectedItems.length} {t('common.of')} {(cart.items || []).filter(item => item && (item.product || item.medicine)).length} {t('cart.selected')}
              </span>
            </div>
            {(cart.items || []).filter(item => item && (item.product || item.medicine)).map((item) => {
              const product = item.product || item.medicine || {}
              const productId = getProductId(product) || item._id
              const isSelected = selectedProductIds.has(productId)
              
              // Skip rendering if product is invalid
              if (!product || (!product._id && !product.id && !item._id)) {
                return null
              }
              
              return (
                <div
                  key={productId}
                  className={`rounded-lg bg-white p-6 shadow-md transition ${
                    !isSelected ? 'ring-1 ring-dashed ring-gray-200 opacity-80' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(productId)}
                        className="h-5 w-5 text-medical-600"
                      />
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img
                          src={product.image || product.imageUrl || '/placeholder-medicine.jpg'}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-medicine.jpg'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name || item.name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.brand || product.manufacturer || ''}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(productId, (item.quantity || 1) - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                          <button
                            onClick={() => handleQuantityChange(productId, (item.quantity || 1) + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            ₹{(item.price || 0).toLocaleString()} {t('common.each')}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(productId)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.orderSummary')}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span className="font-semibold">
                    ₹{selectionSummary.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.delivery')}</span>
                  <span className="font-semibold">
                    {selectionSummary.deliveryFee === 0
                      ? t('cart.free')
                      : `₹${selectionSummary.deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.taxes')}</span>
                  <span className="font-semibold">₹{selectionSummary.taxes.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">{t('cart.grandTotal')}</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{selectionSummary.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const selectedIds = Array.from(selectedProductIds)
                  if (!selectedIds.length) {
                    toast.error(t('cart.selectItemError'))
                    return
                  }
                  sessionStorage.setItem('checkoutSelectedProductIds', JSON.stringify(selectedIds))
                  navigate('/checkout', {
                    state: {
                      selectedCartItems: selectedItems
                    }
                  })
                }}
                disabled={!selectedItems.length}
                className="w-full py-3 bg-medical-600 text-white font-medium rounded-lg hover:bg-medical-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {selectedItems.length > 1
                  ? `${t('cart.checkoutItems')} ${selectedItems.length} ${t('cart.items')}`
                  : t('cart.checkoutItems')}
              </button>
              
              <p className="text-sm text-gray-600 text-center mt-4">
                {t('cart.freeDelivery')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
