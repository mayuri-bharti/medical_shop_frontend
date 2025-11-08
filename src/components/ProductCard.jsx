import { ShoppingCart, Zap } from 'lucide-react'
import { useState, memo, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '../lib/api'
import toast from 'react-hot-toast'

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

  // Memoize discount calculation
  const discountPercentage = useMemo(() => {
    return product.mrp > product.price 
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0
  }, [product.mrp, product.price])

  // Memoize image source
  const imageSrc = useMemo(() => {
    return product.images?.[0] || product.image || '/placeholder-medicine.jpg'
  }, [product.images, product.image])

  const handleAddToCart = useCallback(async () => {
    setAdding(true)
    try {
      // TODO: Implement add to cart API call
      // await addToCart(product._id, 1)
      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }, [product._id, product.name])

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

      if (response.ok && data.success) {
        toast.success('Product added to cart!')
        // Navigate to checkout
        navigate('/checkout')
      } else {
        throw new Error(data.message || 'Failed to add product to cart')
      }
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
      <div className="h-20 w-full bg-gray-50 relative overflow-hidden flex items-center justify-center">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-contain p-1"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23E5E7EB" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EMedicine%3C/text%3E%3C/svg%3E'
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
              Out of Stock
            </span>
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-1 right-1">
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
              {discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-1.5 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] text-gray-400 mb-0.5 line-clamp-1">{product.brand}</p>
        )}
        
        {/* Name */}
        <h3 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1 flex-wrap">
          <span className="text-sm font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.mrp > product.price && (
            <span className="text-[10px] text-gray-500 line-through">
              ₹{product.mrp.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Info */}
        {product.stock > 0 && product.stock < 10 && (
          <p className="text-[10px] text-orange-600 mb-1 font-medium">
            Only {product.stock} left
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-row gap-1.5 mt-auto">
          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={buying || product.stock === 0}
            className="group flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-medium rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg active:scale-95 transform"
          >
            {buying ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap size={11} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span className="transition-all duration-300">Buy Now</span>
              </>
            )}
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="group flex-1 flex items-center justify-center gap-1 py-1.5 bg-medical-600 hover:bg-medical-700 text-white text-[11px] font-medium rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg active:scale-95 transform"
          >
            {adding ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={11} className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                <span className="transition-all duration-300">Add to Cart</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Info */}
        <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
          <span className="truncate">{product.category || 'Product'}</span>
          {product.stock > 0 && (
            <span className="text-green-600 font-medium ml-1">In Stock</span>
          )}
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard

