import { ShoppingCart, Zap, Star, Heart } from 'lucide-react'
import { useState, memo, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate } from '../lib/cartEvents'
import toast from 'react-hot-toast'

const ProductCard = memo(({ product }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [wish, setWish] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

  // Memoize discount calculation
  const discountPercentage = useMemo(() => {
    return product.mrp > product.price 
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0
  }, [product.mrp, product.price])

  // Rating values if available
  const ratingValue = Number(product.rating || product.ratings || 0)
  const ratingCount = Number(product.ratingCount || product.reviews || 0)

  // Memoize image source
  const imageSrc = useMemo(() => {
    return product.images?.[0] || product.image || '/placeholder-medicine.jpg'
  }, [product.images, product.image])

  const handleAddToCart = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent('/products')}`)
      return
    }

    setAdding(true)
    try {
      // Validate product ID before sending
      const productId = product._id || product.id
      if (!productId) {
        toast.error(t('cart.invalidProduct'))
        setAdding(false)
        return
      }

      // Check if this is a demo product (IDs starting with 'demo-' are not valid MongoDB ObjectIds)
      const isDemoProduct = typeof productId === 'string' && (
        productId.startsWith('demo-') || 
        !productId.match(/^[0-9a-fA-F]{24}$/)
      )

      if (isDemoProduct) {
        toast.error(t('cart.demoProductMessage') || 'This is a demo product. Please search for the actual product in our catalog to add it to cart.')
        setAdding(false)
        return
      }

      const response = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        })
      })

      const data = await response.json()

      if (!response.ok || data?.success === false) {
        // Extract detailed error message from validation errors
        let errorMessage = data?.message || 'Failed to add to cart'
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map(err => err.msg || err.message).join(', ') || errorMessage
        }
        throw new Error(errorMessage)
      }

      toast.success(`${product.name} ${t('common.addedToCart')}`)
      broadcastCartUpdate(data?.data || data)
    } catch (error) {
      // Show user-friendly error message
      const errorMsg = error?.response?.data?.message || 
                      error?.response?.data?.errors?.[0]?.msg ||
                      error?.message || 
                      t('common.failedToAdd')
      toast.error(errorMsg)
    } finally {
      setAdding(false)
    }
  }, [API_BASE, product._id, product.id, product.name, navigate, t])

  const handleBuyNow = useCallback(async () => {
    // Check if user is authenticated
    const token = getAccessToken()
    
    if (!token) {
      // User not logged in, redirect to login with return URL
      const returnUrl = encodeURIComponent(`/checkout?productId=${product._id}&quantity=1`)
      navigate(`/login?redirect=${returnUrl}`)
      return
    }

    // User is authenticated, proceed with buy now
    setBuying(true)
    try {
      // Add product to cart
      const response = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        })
      })

      const data = await response.json()

      if (!response.ok || data?.success === false) {
        throw new Error(data.message || 'Failed to add product to cart')
      }
      toast.success('Product added to cart!')
      broadcastCartUpdate(data?.data || data)
      navigate('/checkout')
    } catch (error) {
      console.error('Buy now error:', error)
      toast.error(error.message || 'Failed to proceed with purchase')
    } finally {
      setBuying(false)
    }
  }, [product._id, navigate])

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-medical-300 transition-all duration-200 flex flex-col">
      {/* Product Image */}
      <div
        className="h-24 md:h-40 w-full bg-gray-50 relative overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => navigate(`/product/${product._id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigate(`/product/${product._id}`)
        }}
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-contain p-0.5 md:p-2"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23E5E7EB" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EMedicine%3C/text%3E%3C/svg%3E'
          }}
        />
        {/* Wishlist */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={() => setWish((w) => !w)}
          className="absolute top-0.5 right-0.5 md:top-1 md:right-1 inline-flex items-center justify-center rounded-full bg-white/90 shadow p-0.5 md:p-1 hover:bg-white transition"
        >
          <Heart className="w-[10px] h-[10px] md:w-[14px] md:h-[14px]" fill={wish ? '#ef4444' : 'none'} stroke={wish ? '#ef4444' : '#4b5563'} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-1 py-0.5 md:px-1.5 md:py-0.5 rounded text-[8px] md:text-[10px] font-medium">
              {t('home.outOfStock')}
            </span>
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1">
            <span className="bg-red-500 text-white text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded font-semibold">
              {discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-1 md:p-2 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <p className="text-[7px] md:text-[10px] text-gray-500 mb-0 md:mb-0.5 line-clamp-1">{product.brand}</p>
        )}
        
        {/* Name */}
        <h3
          className="text-[10px] md:text-[13px] font-semibold text-gray-900 mb-0.5 md:mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-medical-700"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h3>

        {/* Rating + Assurance - Hidden on mobile to save space */}
        {(ratingValue > 0 || ratingCount > 0) && (
          <div className="hidden md:flex items-center gap-2 mb-1">
            {ratingValue > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium bg-green-600 text-white">
                {ratingValue.toFixed(1)}
                <Star className="w-[11px] h-[11px]" fill="white" />
              </span>
            )}
            {ratingCount > 0 && (
              <span className="text-[10px] text-gray-500">({ratingCount.toLocaleString()})</span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 rounded bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 text-[9px]">
              <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] text-blue-600"><path fill="currentColor" d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 17l-5.5 2.5 1-6.3L3 8.9 9 8z"/></svg>
              Assured
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-0 md:mb-1 flex-wrap">
          <span className="text-xs md:text-base font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.mrp > product.price && (
            <span className="text-[7px] md:text-[10px] text-gray-500 line-through">
              ₹{product.mrp.toLocaleString()}
            </span>
          )}
        </div>

        {/* Offer line - Hidden on mobile */}
        {discountPercentage > 0 && (
          <p className="hidden md:block text-[10px] text-green-700 font-medium mb-1">
            {t('common.saveExtra')} {discountPercentage}% {t('common.withOffers')}
          </p>
        )}

        {/* Stock Info - Hidden on mobile */}
        {product.stock > 0 && product.stock < 10 && (
          <p className="hidden md:block text-[10px] text-orange-600 mb-1 font-medium">
            Only {product.stock} left
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-row gap-1 md:gap-1.5 mt-0.5 md:mt-auto">
          {/* Add to Cart Button (keep on card) */}
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="group flex-1 flex items-center justify-center gap-0.5 md:gap-1 py-0.5 md:py-1.5 bg-medical-600 hover:bg-medical-700 text-white text-[8px] md:text-[11px] font-medium rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed md:hover:scale-105 md:hover:shadow-lg active:scale-95 transform"
          >
            {adding ? (
              <>
                <div className="animate-spin rounded-full h-2 w-2 md:h-3 md:w-3 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-[8px] h-[8px] md:w-[11px] md:h-[11px] transition-transform duration-300 md:group-hover:scale-110 md:group-hover:-translate-y-0.5" />
                <span className="transition-all duration-300">{t('common.addToCart')}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Info - Hidden on mobile to save space */}
        <div className="hidden md:flex items-center justify-between mt-1 text-[10px] text-gray-500">
          <span className="truncate">{product.category || 'Product'}</span>
          {product.stock > 0 && (
            <span className="text-green-600 font-medium ml-1">{t('home.inStock')}</span>
          )}
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard

