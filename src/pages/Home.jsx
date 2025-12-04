import { useMemo, useState, useCallback } from 'react'
import { useQuery } from 'react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'
import { api } from '../services/api'
import { getAccessToken } from '../lib/api'
import { addToGuestCart, getGuestCartItemCount } from '../lib/guestCart'
import { broadcastCartUpdate } from '../lib/cartEvents'
import toast from 'react-hot-toast'
// Apollo Pharmacy Components
import HeroSection from '../components/home/HeroSection'
import CategoryNav from '../components/home/CategoryNav'
import FeatureCards from '../components/home/FeatureCards'
import HealthConditions from '../components/home/HealthConditions'
import BannerSlider from '../components/BannerSlider'
import HomepageBanner from '../components/HomepageBanner'

const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [addingToCart, setAddingToCart] = useState({})
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

  const fallbackFeaturedProducts = useMemo(
    () => [
      {
        id: 'fallback-1',
        name: 'Lipicure Gold 10mg Capsules',
        image: 'https://images.unsplash.com/photo-1582719478250-428daf0c0d4b?w=640&q=80&auto=format&fit=crop',
        price: 92,
        mrp: 110,
        delivery: `${t('home.delivery')} 1 day`,
        inStock: true
      },
      {
        id: 'fallback-2',
        name: 'Azulix-4MF Forte Tablets',
        image: 'https://images.unsplash.com/photo-1578302758068-22308e6e4daf?w=640&q=80&auto=format&fit=crop',
        price: 189,
        mrp: 210,
        delivery: `${t('home.delivery')} 2 hrs`,
        inStock: true
      },
      {
        id: 'fallback-3',
        name: 'Razel-Gold 10mg Capsules',
        image: 'https://images.unsplash.com/photo-1586374579358-93e04d95ccf5?w=640&q=80&auto=format&fit=crop',
        price: 287,
        mrp: 320,
        delivery: `${t('home.delivery')} 2 hrs`,
        inStock: true
      },
      {
        id: 'fallback-4',
        name: 'Euclide-M-OD 60mg Tablets',
        image: 'https://images.unsplash.com/photo-1580281658170-3f03f0c5fa1f?w=640&q=80&auto=format&fit=crop',
        price: 170,
        mrp: 195,
        delivery: `${t('home.delivery')} 2 hrs`,
        inStock: true
      },
      {
        id: 'fallback-5',
        name: 'Ascoril-Flu Syrup 60ml',
        image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=640&q=80&auto=format&fit=crop',
        price: 98,
        mrp: 115,
        delivery: `${t('home.delivery')} 1 day`,
        inStock: true
      },
      {
        id: 'fallback-6',
        name: 'Dolo 650 Tablets (15)',
        image: 'https://images.unsplash.com/photo-1612632576808-1e655d60dddf?w=640&q=80&auto=format&fit=crop',
        price: 110,
        mrp: 125,
        delivery: `${t('home.delivery')} 1 day`,
        inStock: true
      },
      {
        id: 'fallback-7',
        name: 'Shelcal 500 Tablets',
        image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=640&q=80&auto=format&fit=crop',
        price: 180,
        mrp: 215,
        delivery: `${t('home.delivery')} 2 hrs`,
        inStock: true
      },
      {
        id: 'fallback-8',
        name: 'Cetzine 10mg Tablets',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b5cdae67?w=640&q=80&auto=format&fit=crop',
        price: 75,
        mrp: 90,
        delivery: `${t('home.delivery')} 1 day`,
        inStock: true
      }
    ],
    [t]
  )

  const {
    data: popularProductsData,
    isLoading: isPopularLoading,
    isError: isPopularError
  } = useQuery(
    ['home-popular-products'],
    async () => {
      const response = await api.get('/products', {
        params: {
          page: 1,
          limit: 8,
          sort: 'rating'
        }
      })

      const responseData = response.data

      if (responseData?.success !== undefined) {
        if (responseData.success) {
          return responseData.products || []
        }
        throw new Error(responseData.message || 'Failed to load products')
      }

      if (Array.isArray(responseData)) {
        return responseData
      }

      if (responseData?.products) {
        return responseData.products
      }

      return []
    },
    {
      staleTime: 300000,
      cacheTime: 300000,
      refetchOnWindowFocus: false
    }
  )

  const featuredProducts = useMemo(() => {
    if (popularProductsData && popularProductsData.length > 0) {
      return popularProductsData.map((product) => ({
        id: product._id,
        name: product.name,
        image: product.images?.[0] || product.image || '/placeholder-medicine.jpg',
        price: product.price,
        mrp: product.mrp ?? product.price,
        delivery: product.deliveryInfo || `${t('home.delivery')} 2 days`,
        inStock: product.stock > 0
      }))
    }
    return fallbackFeaturedProducts
  }, [popularProductsData, fallbackFeaturedProducts])

  return (
    <>
      <div className="min-h-screen bg-[#F4F8F7]">
      {/* Apollo Pharmacy Category Navigation */}
      <CategoryNav />

      {/* Apollo Pharmacy Hero Section */}
      <HeroSection />

      {/* Dynamic Banner Slider */}
      <BannerSlider />

      {/* Apollo Pharmacy Feature Cards */}
      <FeatureCards />

      {/* Promotional Images (2-up) */}
     

      {/* Apollo Pharmacy Health Conditions */}
      <HealthConditions />

      {/* Dynamic Homepage Banners */}
      <HomepageBanner bannerType="banner1" />
      <HomepageBanner bannerType="banner2" />

      {/* Featured Products - Trending Medicines */}
      <section className="py-4 sm:py-6 md:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#1A1A1A] mb-1 md:mb-2 lg:mb-3">
                {t('home.trendingMedicines')}
              </h2>
              <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-[#6B7280] mt-0.5 sm:mt-1 md:mt-2">{t('home.mostPopular')}</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center space-x-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 border-apollo-700 text-apollo-700 hover:bg-apollo-50 font-semibold rounded-full transition-all duration-200 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              <span>{t('home.viewAll')}</span>
              <ArrowRight size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        {isPopularError && (
          <div className="mb-3 sm:mb-4 rounded-lg sm:rounded-xl border border-red-200 bg-red-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-700">
            {t('home.unableToLoad')}
          </div>
        )}
        {isPopularLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="flex h-full flex-col rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 animate-pulse">
                  <div className="ml-auto h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 rounded-full bg-slate-200" />
                  <div className="h-16 sm:h-20 md:h-28 lg:h-32 w-full rounded-lg bg-slate-200" />
                  <div className="h-2.5 sm:h-3 md:h-3.5 lg:h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-2.5 sm:h-3 md:h-3.5 lg:h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-2 sm:h-2.5 md:h-3 w-2/3 rounded bg-slate-200" />
                  <div className="mt-1 sm:mt-1.5 md:mt-2 flex gap-1 sm:gap-1.5 md:gap-2">
                    <div className="h-6 sm:h-7 md:h-8 lg:h-9 flex-1 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {featuredProducts.map((product) => {
              const discount = product.mrp && product.mrp !== product.price 
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0
              
              return (
                <div
                  key={product.id ?? product.name}
                  className="medicine-card group cursor-pointer relative flex flex-col h-full rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => {
                    if (product.id) {
                      navigate(`/product/${product.id}`)
                    } else {
                      navigate(`/products?search=${encodeURIComponent(product.name)}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (product.id) {
                        navigate(`/product/${product.id}`)
                      } else {
                        navigate(`/products?search=${encodeURIComponent(product.name)}`)
                      }
                    }
                  }}
                >
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 z-10">
                      <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] sm:text-[10px] md:text-xs font-bold px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 shadow-md">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                  
                  {/* Product Image */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-white p-2 sm:p-3 md:p-4 lg:p-6 flex items-center justify-center min-h-[90px] sm:min-h-[110px] md:min-h-[140px] lg:min-h-[180px] xl:min-h-[200px] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 sm:h-20 md:h-24 lg:h-32 xl:h-36 w-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-150"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/placeholder-medicine.jpg'
                      }}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-2 sm:p-3 md:p-4 lg:p-5 flex flex-1 flex-col">
                    <h3 className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-bold text-gray-900 line-clamp-2 mb-1 sm:mb-1.5 md:mb-2 lg:mb-3 min-h-[28px] sm:min-h-[32px] md:min-h-[36px] lg:min-h-[40px] leading-tight">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 flex-wrap">
                      <span className="text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold text-apollo-700">
                        ₹{Number(product.price ?? 0).toLocaleString()}
                      </span>
                      {product.mrp && product.mrp !== product.price && (
                        <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 line-through">
                          ₹{Number(product.mrp ?? 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Status - Responsive */}
                    <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
                      <span className={`inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                        {product.inStock ? product.delivery : t('home.outOfStock')}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto flex items-center gap-1 sm:gap-1.5 md:gap-2 pt-1 sm:pt-2">
                      <button
                        type="button"
                        disabled={!product.inStock || addingToCart[product.id || product._id]}
                        onClick={async (e) => {
                          e.stopPropagation()
                          
                          const productId = product.id || product._id
                          if (!productId) {
                            toast.error('Invalid product')
                            return
                          }

                          // Check if this is a demo product
                          const isDemoProduct = typeof productId === 'string' && (
                            productId.startsWith('demo-') || 
                            productId.startsWith('fallback-') ||
                            !productId.match(/^[0-9a-fA-F]{24}$/)
                          )

                          if (isDemoProduct) {
                            toast.error('This is a demo product. Please search for the actual product in our catalog to add it to cart.')
                            return
                          }

                          setAddingToCart(prev => ({ ...prev, [productId]: true }))
                          
                          try {
                            const token = getAccessToken()
                            
                            if (!token) {
                              // User not logged in - use guest cart
                              const price = Number(product.price) || 0
                              const image = product.image || product.images?.[0] || ''
                              
                              const guestCart = addToGuestCart({
                                itemType: 'product',
                                productId: productId,
                                quantity: 1,
                                price: price,
                                name: product.name,
                                image: image
                              })
                              
                              toast.success(`${product.name} ${t('common.addedToCart')}`)
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

                              toast.success(`${product.name} ${t('common.addedToCart')}`)
                              broadcastCartUpdate(data?.data || data)
                            }
                          } catch (error) {
                            const errorMsg = error?.response?.data?.message || 
                                          error?.response?.data?.errors?.[0]?.msg ||
                                          error?.message || 
                                          t('common.failedToAdd')
                            toast.error(errorMsg)
                          } finally {
                            setAddingToCart(prev => ({ ...prev, [productId]: false }))
                          }
                        }}
                        className={`flex-1 rounded-lg sm:rounded-xl md:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-[9px] sm:text-[10px] md:text-xs font-bold transition-all active:scale-95 ${
                          product.inStock && !addingToCart[product.id || product._id]
                            ? 'bg-apollo-700 text-white hover:bg-apollo-800 shadow-md hover:shadow-lg'
                            : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        }`}
                      >
                        {addingToCart[product.id || product._id] 
                          ? t('common.adding') || 'Adding...'
                          : product.inStock 
                            ? t('common.addToCart') 
                            : t('home.outOfStock')
                        }
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
          {/* View All Link for Mobile */}
          <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center space-x-1.5 px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-apollo-700 text-apollo-700 hover:bg-apollo-50 font-semibold rounded-full transition-all duration-200 text-xs sm:text-sm active:scale-95"
            >
              <span>{t('home.viewAllProducts')}</span>
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Health Packages Section */}
      <section className="py-16 bg-[#F4F8F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3">
              Health <span className="text-apollo-700">Packages</span>
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Curated wellness packages for your health needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Immunity Booster Pack', price: '₹1,299', originalPrice: '₹1,599', savings: 'Save ₹300', query: 'immunity' },
              { name: 'Diabetes Care Package', price: '₹2,499', originalPrice: '₹2,999', savings: 'Save ₹500', query: 'diabetes' },
              { name: 'Senior Wellness Kit', price: '₹1,999', originalPrice: '₹2,399', savings: 'Save ₹400', query: 'senior wellness'},
            ].map((pkg, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-soft text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-apollo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="text-apollo-700" size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#1A1A1A]">{pkg.name}</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-apollo-700">{pkg.price}</span>
                  <span className="text-sm text-[#6B7280] line-through ml-2">{pkg.originalPrice}</span>
                </div>
                <p className="text-sm text-green-600 font-semibold mb-4">{pkg.savings}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/products?search=${encodeURIComponent(pkg.query || pkg.name)}`)}
                  className="w-full text-center bg-apollo-700 hover:bg-apollo-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  View Related Products
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      </div>

    </>
  )
}

export default Home
