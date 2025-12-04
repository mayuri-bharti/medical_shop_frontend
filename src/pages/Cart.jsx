import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate, normalizeCartData, CART_UPDATED_EVENT } from '../lib/cartEvents'
import { getGuestCart, updateGuestCartItem, removeFromGuestCart } from '../lib/guestCart'
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
    
    // Listen for cart updates (when items are added from other pages)
    const handleCartUpdate = () => {
      fetchCart()
    }
    
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate)
    
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate)
    }
  }, [])

  const fetchCart = async () => {
    try {
      const token = getAccessToken()
      
      if (!token) {
        // User not logged in - use guest cart
        const guestCart = getGuestCart()
        // Transform guest cart to match API format
        // For guest cart, preserve all item data (name, image, price) directly on item
        const normalizedCart = {
          items: guestCart.items.map(item => ({
            ...item,
            // Keep item data for display (name, image, price are on item itself)
            product: item.productId ? { 
              _id: item.productId,
              name: item.name,
              image: item.image,
              imageUrl: item.image,
              price: item.price
            } : null,
            medicine: item.medicineId ? { 
              _id: item.medicineId,
              name: item.name,
              image: item.image,
              imageUrl: item.image,
              price: item.price
            } : null
          })),
          subtotal: guestCart.subtotal,
          deliveryFee: guestCart.deliveryFee,
          taxes: guestCart.taxes,
          total: guestCart.total
        }
        setCart(normalizedCart)
        broadcastCartUpdate(normalizedCart)
        setSelectedProductIds((prev) => {
          const productIds = new Set(
            normalizedCart?.items?.map((item) => {
              // Use productId or medicineId directly for guest cart
              return item.productId || item.medicineId || getProductId(item?.product || item?.medicine)
            }).filter(Boolean) || []
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
      } else {
        // User logged in - fetch from API
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
            normalized?.items?.map((item) => getProductId(item?.product || item?.medicine)) || []
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
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      toast.error(t('cart.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1 || !cart || !cart.items) return
    
    const token = getAccessToken()
    
      if (!token) {
        // Guest cart - update in localStorage
        const item = cart.items.find((item) => {
          // Check both productId/medicineId (guest cart) and product._id/medicine._id (transformed)
          const itemId = item.productId || item.medicineId || getProductId(item.product || item.medicine)
          return itemId === productId
        })
        
        if (item) {
          const itemType = item.itemType || (item.productId ? 'product' : 'medicine')
          const productIdValue = item.productId || item.product?._id
          const medicineIdValue = item.medicineId || item.medicine?._id
          
          const updatedCart = updateGuestCartItem({
            itemType,
            productId: productIdValue,
            medicineId: medicineIdValue,
            quantity: newQuantity
          })
          
          // Transform to match API format, preserving all item data
          const normalizedCart = {
            items: updatedCart.items.map(item => ({
              ...item,
              product: item.productId ? { 
                _id: item.productId,
                name: item.name,
                image: item.image,
                imageUrl: item.image,
                price: item.price
              } : null,
              medicine: item.medicineId ? { 
                _id: item.medicineId,
                name: item.name,
                image: item.image,
                imageUrl: item.image,
                price: item.price
              } : null
            })),
            subtotal: updatedCart.subtotal,
            deliveryFee: updatedCart.deliveryFee,
            taxes: updatedCart.taxes,
            total: updatedCart.total
          }
          setCart(normalizedCart)
          broadcastCartUpdate(normalizedCart)
        }
    } else {
      // Logged in - update via API
      const item = cart.items.find((item) => {
        const product = item.product || item.medicine
        if (!product) return false
        return getProductId(product) === productId
      })
      
      if (item) {
        try {
          const itemType = item.itemType || (item.product ? 'product' : 'medicine')
          const productIdValue = item.productId || item.product?._id
          const medicineIdValue = item.medicineId || item.medicine?._id
          
          const url = itemType === 'medicine' 
            ? `${API_BASE}/cart/items/${medicineIdValue}`
            : `${API_BASE}/cart/items/${productIdValue}`
          
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQuantity })
          })
          
          if (response.ok) {
            fetchCart()
          } else {
            throw new Error('Failed to update quantity')
          }
        } catch (error) {
          toast.error(t('cart.failedToUpdate'))
        }
      }
    }
  }

  const handleRemoveItem = async (productId) => {
    try {
      const token = getAccessToken()
      
      if (!token) {
        // Guest cart - remove from localStorage
        const item = cart.items.find((item) => {
          // Check both productId/medicineId (guest cart) and product._id/medicine._id (transformed)
          const itemId = item.productId || item.medicineId || getProductId(item.product || item.medicine)
          return itemId === productId
        })
        
        if (item) {
          const itemType = item.itemType || (item.productId ? 'product' : 'medicine')
          const productIdValue = item.productId || item.product?._id
          const medicineIdValue = item.medicineId || item.medicine?._id
          
          const updatedCart = removeFromGuestCart({
            itemType,
            productId: productIdValue,
            medicineId: medicineIdValue
          })
          
          // Transform to match API format, preserving all item data
          const normalizedCart = {
            items: updatedCart.items.map(item => ({
              ...item,
              product: item.productId ? { 
                _id: item.productId,
                name: item.name,
                image: item.image,
                imageUrl: item.image,
                price: item.price
              } : null,
              medicine: item.medicineId ? { 
                _id: item.medicineId,
                name: item.name,
                image: item.image,
                imageUrl: item.image,
                price: item.price
              } : null
            })),
            subtotal: updatedCart.subtotal,
            deliveryFee: updatedCart.deliveryFee,
            taxes: updatedCart.taxes,
            total: updatedCart.total
          }
          setCart(normalizedCart)
          broadcastCartUpdate(normalizedCart)
          toast.success(t('cart.itemRemoved'))
        }
      } else {
        // Logged in - remove via API
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
          .filter(item => {
            if (!item) return false
            // Include items with product/medicine (logged-in) or productId/medicineId (guest)
            return item.product || item.medicine || item.productId || item.medicineId || item.name
          })
          .map((item) => {
            // Use productId/medicineId for guest cart, or getProductId for logged-in
            return item.productId || item.medicineId || getProductId(item.product || item.medicine) || item._id
          })
          .filter(Boolean)
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

  // Check if cart is empty - consider both logged-in and guest cart structures
  const hasItems = cart && cart.items && cart.items.length > 0 && cart.items.some(item => {
    if (!item) return false
    // Check for logged-in cart structure
    if (item.product || item.medicine) return true
    // Check for guest cart structure
    if (item.productId || item.medicineId || item.name) return true
    return false
  })

  if (!hasItems) {
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
                  checked={selectedProductIds.size > 0 && selectedProductIds.size === (cart.items || []).filter(item => {
                    if (!item) return false
                    return item.product || item.medicine || item.productId || item.medicineId || item.name
                  }).length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">{t('cart.selectAll')}</span>
              </div>
              <span className="text-sm text-gray-500">
                {selectedItems.length} {t('common.of')} {(cart.items || []).filter(item => {
                  if (!item) return false
                  return item.product || item.medicine || item.productId || item.medicineId || item.name
                }).length} {t('cart.selected')}
              </span>
            </div>
            {(cart.items || []).filter(item => {
              // For guest cart, check if item has productId or medicineId
              // For logged in cart, check if item has product or medicine
              if (!item) return false
              // Check for logged-in cart structure
              if (item.product || item.medicine) return true
              // Check for guest cart structure
              if (item.productId || item.medicineId) return true
              // Also check if item has name (guest cart items have name directly)
              if (item.name) return true
              return false
            }).map((item, index) => {
              // Get product data - either from nested product/medicine or from item itself (guest cart)
              const product = item.product || item.medicine || {}
              // For guest cart, use productId/medicineId directly; for logged-in, use product._id
              const productId = item.productId || item.medicineId || getProductId(product) || item._id || `item-${index}`
              const isSelected = selectedProductIds.has(productId)
              
              // Get display data - prefer product object, fallback to item data (for guest cart)
              const displayName = product.name || item.name || 'Unknown Product'
              const displayImage = product.image || product.imageUrl || item.image || '/placeholder-medicine.jpg'
              const displayBrand = product.brand || product.manufacturer || ''
              const displayPrice = item.price || product.price || 0
              
              // Don't skip - render all items that passed the filter
              
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
                          src={displayImage}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-medicine.jpg'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {displayName}
                      </h3>
                      {displayBrand && (
                        <p className="text-sm text-gray-600 mb-2">
                          {displayBrand}
                        </p>
                      )}
                      
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
                            ₹{(displayPrice * (item.quantity || 1)).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            ₹{displayPrice.toLocaleString()} {t('common.each')}
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
