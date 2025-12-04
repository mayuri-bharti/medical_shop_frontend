import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Star, Zap, ShoppingCart, ChevronRight, Home as HomeIcon, ArrowRight } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate } from '../lib/cartEvents'
import { addToGuestCart, getGuestCartItemCount } from '../lib/guestCart'
import toast from 'react-hot-toast'
import { getSubcategoryData } from '../data/subcategoryProducts'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPackSize, setSelectedPackSize] = useState(null)
  const [mainSwiper, setMainSwiper] = useState(null)
  const [addingToCart, setAddingToCart] = useState({})

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

  // Fetch trending products
  const {
    data: trendingProductsData,
    isLoading: isTrendingLoading
  } = useQuery(
    ['trending-products'],
    async () => {
      const response = await api.get('/products', {
        params: {
          page: 1,
          limit: 3,
          sort: 'rating'
        }
      })

      const responseData = response.data

      if (responseData?.success !== undefined) {
        if (responseData.success) {
          return responseData.products || []
        }
        return []
      }

      if (Array.isArray(responseData)) {
        return responseData.slice(0, 3)
      }

      if (responseData?.products) {
        return responseData.products.slice(0, 3)
      }

      return []
    },
    {
      staleTime: 300000,
      cacheTime: 300000,
      refetchOnWindowFocus: false
    }
  )

  const trendingProducts = useMemo(() => {
    if (trendingProductsData && trendingProductsData.length > 0) {
      return trendingProductsData
        .filter(p => p._id !== id) // Exclude current product
        .slice(0, 3)
        .map((product) => ({
          id: product._id,
          name: product.name,
          image: product.images?.[0] || product.image || '/placeholder-medicine.jpg',
          price: product.price,
          mrp: product.mrp ?? product.price,
          inStock: product.stock > 0
        }))
    }
    return []
  }, [trendingProductsData, id])

  // Check if ID is a demo product
  const isDemoProduct = useMemo(() => {
    return typeof id === 'string' && (
      id.startsWith('demo-') || 
      !id.match(/^[0-9a-fA-F]{24}$/)
    )
  }, [id])

  // Find demo product in subcategory data
  const findDemoProduct = useCallback((productId) => {
    const subcategories = [
      'pain-relief', 'antibiotics', 'vitamins', 'skincare', 
      'digestive', 'respiratory', 'diabetes', 'elderly-care', 
      'cold-immunity'
    ]
    
    for (const slug of subcategories) {
      const subcategory = getSubcategoryData(slug)
      if (subcategory?.products) {
        const foundProduct = subcategory.products.find(p => p._id === productId)
        if (foundProduct) {
          return foundProduct
        }
      }
    }
    return null
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      
      try {
        // If it's a demo product, try to find it in frontend data first
        if (isDemoProduct) {
          const demoProduct = findDemoProduct(id)
          if (demoProduct) {
            if (isMounted) {
              setProduct(demoProduct)
              setLoading(false)
            }
            return
          }
          // If demo product not found in frontend data, try API as fallback
        }
        
        // Try to fetch from API
        const { data } = await api.get(`/products/${id}`)
        if (isMounted) setProduct(data)
      } catch (e) {
        if (isMounted) {
          // If it's a demo product and API failed, show helpful message
          if (isDemoProduct) {
            setError('This is a demo product. Please search for similar products in our catalog.')
          } else {
            setError(e?.response?.data?.message || 'Failed to load product')
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchProduct()
    return () => { isMounted = false }
  }, [id, isDemoProduct, findDemoProduct])

  const priceInfo = useMemo(() => {
    if (!product) return { discount: 0 }
    const discount =
      product?.mrp > product?.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
    return { discount }
  }, [product])

  const handleAddToCart = useCallback(async () => {
    // Check if this is a demo product
    if (isDemoProduct) {
      toast.error('This is a demo product. Please search for the actual product in our catalog to add it to cart.')
      return
    }
    
    const token = getAccessToken()
    setAdding(true)
    
    try {
      if (!token) {
        // User not logged in - use guest cart
        const { addToGuestCart, getGuestCartItemCount } = await import('../lib/guestCart')
        const price = Number(product?.price) || 0
        const image = product?.images?.[0] || product?.image || ''
        
        const guestCart = addToGuestCart({
          itemType: 'product',
          productId: id,
          quantity: qty,
          price: price,
          name: product?.name || '',
          image: image
        })
        
        toast.success('Added to cart')
        broadcastCartUpdate(guestCart, getGuestCartItemCount())
      } else {
        // User logged in - use API
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
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 
                      e?.response?.data?.errors?.[0]?.msg ||
                      e?.message || 
                      'Failed to add to cart'
      toast.error(errorMsg)
    } finally {
      setAdding(false)
    }
  }, [id, qty, product, isDemoProduct])

  const handleBuyNow = useCallback(async () => {
    // Check if this is a demo product
    if (isDemoProduct) {
      toast.error('This is a demo product. Please search for the actual product in our catalog to purchase.')
      return
    }
    
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
  }, [id, qty, navigate, isDemoProduct])

  // Calculate product images and display images (must be before early returns)
  const productImages = useMemo(() => {
    if (!product) return ['/placeholder-medicine.jpg']
    return product.images && product.images.length > 0 
      ? product.images 
      : product.image 
        ? [product.image] 
        : ['/placeholder-medicine.jpg']
  }, [product])

  // Ensure we have at least 3 images for the slider (duplicate if needed)
  const displayImages = useMemo(() => {
    if (productImages.length >= 3) {
      return productImages.slice(0, 3)
    }
    // If less than 3, duplicate images to make 3
    const images = [...productImages]
    while (images.length < 3) {
      images.push(...productImages)
    }
    return images.slice(0, 3)
  }, [productImages])

  const packSizes = useMemo(() => {
    if (!product) return []
    return product.packSizes || [
      { size: '1 Piece', value: '1PC', price: product.price },
      { size: '2 Pieces', value: '2PC', price: product.price * 2 },
      { size: '3 Pieces', value: '3PC', price: product.price * 3 }
    ]
  }, [product])

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
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-gray-600">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="hover:text-gray-900 flex items-center">
              <HomeIcon size={16} className="mr-1" />
              Home
            </Link>
          </li>
          <ChevronRight size={16} className="text-gray-400" />
          <li>
            <Link to="/products" className="hover:text-gray-900">
              Products
            </Link>
          </li>
          {product.category && (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              <li className="text-gray-900">{product.category}</li>
            </>
          )}
          <ChevronRight size={16} className="text-gray-400" />
          <li className="text-gray-900 truncate max-w-xs">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image gallery with autoplay slider */}
        <div className="space-y-3">
          {/* Main Image Slider */}
          <div className="flex items-center justify-center min-h-[300px] max-h-[400px] w-full bg-white rounded-lg">
            <Swiper
              onSwiper={setMainSwiper}
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              loop={true}
              className="main-product-swiper w-full"
              onSlideChange={(swiper) => setSelectedImage(swiper.realIndex)}
            >
              {displayImages.map((img, index) => (
                <SwiperSlide key={index}>
                  <div className="flex items-center justify-center h-full w-full p-4">
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="max-h-[400px] w-full object-contain"
                      onError={(e) => {
                        e.target.src = '/placeholder-medicine.jpg'
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          
          {/* Thumbnail Images - Centered below main image */}
          <div className="w-full flex justify-center px-4">
            <div className="flex gap-2 sm:gap-3 justify-center items-center flex-wrap">
              {displayImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedImage(index)
                    // Update main swiper if available
                    if (mainSwiper && !mainSwiper.destroyed) {
                      mainSwiper.slideToLoop(index)
                    }
                  }}
                  className={`overflow-hidden cursor-pointer rounded bg-white flex items-center justify-center h-16 sm:h-20 w-16 sm:w-20 border-2 transition-all shadow-sm hover:shadow-md ${
                    selectedImage === index 
                      ? 'border-apollo-700 ring-2 ring-apollo-200 scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="h-full w-full object-contain p-1.5"
                    onError={(e) => {
                      e.target.src = '/placeholder-medicine.jpg'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              {product.brand && (
                <>
                  <span className="font-medium">Marketed by {product.brand}</span>
                  <span>•</span>
                </>
              )}
              {selectedPackSize ? (
                <span>{selectedPackSize.value}</span>
              ) : (
                <span>{packSizes[0]?.value || '1PC'}</span>
              )}
              <span>•</span>
              <span className="text-green-600 font-medium">In Stock</span>
            </div>
          </div>

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
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">M.R.P.: ₹{Number(selectedPackSize?.price || product.price).toLocaleString()}</span>
            </div>
            {product.mrp > product.price && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">₹{Number(product.mrp).toLocaleString()}</span>
                <span className="text-sm font-semibold text-green-700">{priceInfo.discount}% off</span>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Delivery Info */}
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Delivery within 2 hrs</span>
          </div>

          {/* Pack Size Selection */}
          {packSizes.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Choose pack size</h3>
              <div className="flex flex-wrap gap-2">
                {packSizes.map((pack, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPackSize(pack)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedPackSize?.value === pack.value || (!selectedPackSize && index === 0)
                        ? 'border-apollo-700 bg-apollo-50 text-apollo-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {pack.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="inline-flex items-center border border-gray-300 rounded-lg">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
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
          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-apollo-700 hover:bg-apollo-800 text-white text-base font-semibold disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {adding ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <ShoppingCart size={20} />
              )}
              Add to Cart
            </button>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Product description</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{product.description || product.name || '—'}</p>
          </div>
        </div>
      </div>

      {/* Trending Products Section */}
      {trendingProducts && trendingProducts.length > 0 && (
        <section className="mt-12 pt-12 border-t border-gray-200">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Trending Products</h2>
              <p className="text-sm text-gray-600">Most popular and trusted products</p>
            </div>
            <Link
              to="/products"
              className="flex items-center space-x-2 px-5 py-2.5 border-2 border-apollo-700 text-apollo-700 hover:bg-apollo-50 font-semibold rounded-full transition-all duration-200 text-sm"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={trendingProducts.length > 1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            className="trending-products-swiper"
          >
            {trendingProducts.map((trendingProduct, index) => {
              const discount = trendingProduct.mrp && trendingProduct.mrp !== trendingProduct.price 
                ? Math.round(((trendingProduct.mrp - trendingProduct.price) / trendingProduct.mrp) * 100)
                : 0

              return (
                <SwiperSlide key={trendingProduct.id || index}>
                  <div
                    onClick={() => navigate(`/product/${trendingProduct.id}`)}
                    className="group cursor-pointer relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full"
                  >
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-2 py-1 shadow-md">
                          {discount}% OFF
                        </span>
                      </div>
                    )}

                    <div className="relative bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 md:p-10 flex items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] overflow-hidden">
                      <img
                        src={trendingProduct.image}
                        alt={trendingProduct.name}
                        className="h-32 sm:h-40 md:h-48 w-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-150"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/placeholder-medicine.jpg'
                        }}
                      />
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                        {trendingProduct.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base sm:text-lg font-bold text-apollo-700">
                          ₹{Number(trendingProduct.price ?? 0).toLocaleString()}
                        </span>
                        {trendingProduct.mrp && trendingProduct.mrp !== trendingProduct.price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            ₹{Number(trendingProduct.mrp ?? 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${trendingProduct.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <p className="text-xs text-gray-600">
                          {trendingProduct.inStock ? 'Delivery within 2 days' : 'Out of Stock'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!trendingProduct.inStock || addingToCart[trendingProduct.id]}
                        onClick={async (e) => {
                          e.stopPropagation()
                          
                          const productId = trendingProduct.id
                          if (!productId) {
                            toast.error('Invalid product')
                            return
                          }

                          setAddingToCart(prev => ({ ...prev, [productId]: true }))
                          
                          try {
                            const token = getAccessToken()
                            
                            if (!token) {
                              // User not logged in - use guest cart
                              const price = Number(trendingProduct.price) || 0
                              const image = trendingProduct.image || ''
                              
                              const guestCart = addToGuestCart({
                                itemType: 'product',
                                productId: productId,
                                quantity: 1,
                                price: price,
                                name: trendingProduct.name,
                                image: image
                              })
                              
                              toast.success(`${trendingProduct.name} added to cart`)
                              broadcastCartUpdate(guestCart, getGuestCartItemCount())
                            } else {
                              // User logged in - use API
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
                                let errorMessage = data?.message || 'Failed to add to cart'
                                if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                                  errorMessage = data.errors.map(err => err.msg || err.message).join(', ') || errorMessage
                                }
                                throw new Error(errorMessage)
                              }

                              toast.success(`${trendingProduct.name} added to cart`)
                              broadcastCartUpdate(data?.data || data)
                            }
                          } catch (error) {
                            const errorMsg = error?.response?.data?.message || 
                                          error?.response?.data?.errors?.[0]?.msg ||
                                          error?.message || 
                                          'Failed to add to cart'
                            toast.error(errorMsg)
                          } finally {
                            setAddingToCart(prev => ({ ...prev, [productId]: false }))
                          }
                        }}
                        className={`w-full rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                          trendingProduct.inStock && !addingToCart[trendingProduct.id]
                            ? 'bg-apollo-700 text-white hover:bg-apollo-800 shadow-md hover:shadow-lg'
                            : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        }`}
                      >
                        {addingToCart[trendingProduct.id] 
                          ? 'Adding...'
                          : trendingProduct.inStock 
                            ? 'Add to Cart' 
                            : 'Out of Stock'
                        }
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </section>
      )}
    </div>
  )
}

export default ProductDetails






