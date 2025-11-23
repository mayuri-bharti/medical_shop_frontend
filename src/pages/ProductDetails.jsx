import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Star, Zap, ShoppingCart } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate } from '../lib/cartEvents'
import toast from 'react-hot-toast'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/products/${id}`)
        if (isMounted) setProduct(data)
      } catch (e) {
        if (isMounted) setError(e?.response?.data?.message || 'Failed to load product')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchProduct()
    return () => { isMounted = false }
  }, [id])

  const priceInfo = useMemo(() => {
    if (!product) return { discount: 0 }
    const discount =
      product?.mrp > product?.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
    return { discount }
  }, [product])

  const handleAddToCart = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      const returnUrl = encodeURIComponent(`/product/${id}`)
      navigate(`/login?redirect=${returnUrl}`)
      return
    }
    try {
      setAdding(true)
      const resp = await api.post('/cart/items', {
        productId: id,
        quantity: qty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resp?.data?.success === false) {
        let errorMessage = resp?.data?.message || 'Failed to add to cart'
        if (resp?.data?.errors && Array.isArray(resp.data.errors) && resp.data.errors.length > 0) {
          const errorMessages = resp.data.errors.map(err => err.msg || err.message).filter(Boolean)
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ')
          }
        }
        throw new Error(errorMessage)
      }
      toast.success('Added to cart')
      broadcastCartUpdate(resp?.data)
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 
                      e?.response?.data?.errors?.[0]?.msg ||
                      e?.message || 
                      'Failed to add to cart'
      toast.error(errorMsg)
    } finally {
      setAdding(false)
    }
  }, [id, qty, navigate])

  const handleBuyNow = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      const returnUrl = encodeURIComponent(`/checkout?productId=${id}&quantity=${qty}`)
      navigate(`/login?redirect=${returnUrl}`)
      return
    }
    try {
      setBuying(true)
      const resp = await api.post('/cart/items', { productId: id, quantity: qty }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      broadcastCartUpdate(resp?.data)
      navigate('/checkout')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to proceed')
    } finally {
      setBuying(false)
    }
  }, [id, qty, navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image gallery (simple) */}
        <div className="bg-white rounded-lg border p-4 flex items-center justify-center">
          <img
            src={product.images?.[0] || product.image || '/placeholder-medicine.jpg'}
            alt={product.name}
            className="w-full h-80 object-contain"
          />
        </div>

        {/* Right: Details */}
        <div className="space-y-3">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{product.name}</h1>

          {/* Rating */}
          {(product.rating || product.ratings) && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium bg-green-600 text-white">
                {(product.rating || product.ratings).toFixed ? (product.rating || product.ratings).toFixed(1) : product.rating || product.ratings}
                <Star size={14} className="fill-white text-white" />
              </span>
              {product.ratingCount && (
                <span className="text-xs text-gray-500">({product.ratingCount.toLocaleString()})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">₹{Number(product.price).toLocaleString()}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-sm text-gray-500 line-through">₹{Number(product.mrp).toLocaleString()}</span>
                <span className="text-sm font-semibold text-green-700">{priceInfo.discount}% off</span>
              </>
            )}
          </div>

          {/* Manufacturer / brand */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Brand:</span> {product.brand || '—'}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Quantity:</span>
            <div className="inline-flex items-center border rounded">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2 py-1 text-gray-700"
              >
                −
              </button>
              <span className="px-3 py-1 text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="px-2 py-1 text-gray-700"
              >
                +
              </button>
            </div>
            {product.stock > 0 ? (
              <span className="text-xs text-green-700 ml-2">In stock</span>
            ) : (
              <span className="text-xs text-red-600 ml-2">Out of stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleBuyNow}
              disabled={buying || product.stock === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium disabled:opacity-50"
            >
              {buying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap size={16} />
              )}
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-medical-600 hover:bg-medical-700 text-white text-sm font-medium disabled:opacity-50"
            >
              {adding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <ShoppingCart size={16} />
              )}
              Add to Cart
            </button>
          </div>

          {/* Description */}
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Product Information</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{product.description || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails






