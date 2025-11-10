import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Shield, Clock, Truck, Upload } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import OtpModal from '../components/OtpModal'
import PromoBannerCarousel from '../components/PromoBannerCarousel'
import CategoryBar from '../components/CategoryBar'
import toast from 'react-hot-toast'
import { api } from '../services/api'

const Home = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)
  const [isHeroVisible, setIsHeroVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsHeroVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Memoize static data
  const features = useMemo(() => [
    { icon: Shield, title: 'Authentic Medicines', description: '100% genuine medicines from verified suppliers' },
    { icon: Clock, title: '24/7 Availability', description: 'Order medicines anytime, anywhere' },
    { icon: Truck, title: 'Fast Delivery', description: 'Quick and safe delivery to your doorstep' }
  ], [])

  const fallbackFeaturedProducts = useMemo(
    () => [
      {
        id: 'fallback-1',
        name: 'Lipicure Gold 10mg Capsules',
        image: 'https://images.unsplash.com/photo-1582719478250-428daf0c0d4b?w=640&q=80&auto=format&fit=crop',
        price: 92,
        mrp: 110,
        delivery: 'Delivery within 1 day',
        inStock: true
      },
      {
        id: 'fallback-2',
        name: 'Azulix-4MF Forte Tablets',
        image: 'https://images.unsplash.com/photo-1578302758068-22308e6e4daf?w=640&q=80&auto=format&fit=crop',
        price: 189,
        mrp: 210,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-3',
        name: 'Razel-Gold 10mg Capsules',
        image: 'https://images.unsplash.com/photo-1586374579358-93e04d95ccf5?w=640&q=80&auto=format&fit=crop',
        price: 287,
        mrp: 320,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-4',
        name: 'Euclide-M-OD 60mg Tablets',
        image: 'https://images.unsplash.com/photo-1580281658170-3f03f0c5fa1f?w=640&q=80&auto=format&fit=crop',
        price: 170,
        mrp: 195,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-5',
        name: 'Ascoril-Flu Syrup 60ml',
        image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=640&q=80&auto=format&fit=crop',
        price: 98,
        mrp: 115,
        delivery: 'Delivery within 1 day',
        inStock: true
      },
      {
        id: 'fallback-6',
        name: 'Dolo 650 Tablets (15)',
        image: 'https://images.unsplash.com/photo-1612632576808-1e655d60dddf?w=640&q=80&auto=format&fit=crop',
        price: 110,
        mrp: 125,
        delivery: 'Delivery within 1 day',
        inStock: true
      },
      {
        id: 'fallback-7',
        name: 'Shelcal 500 Tablets',
        image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=640&q=80&auto=format&fit=crop',
        price: 180,
        mrp: 215,
        delivery: 'Delivery within 2 hrs',
        inStock: true
      },
      {
        id: 'fallback-8',
        name: 'Cetzine 10mg Tablets',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b5cdae67?w=640&q=80&auto=format&fit=crop',
        price: 75,
        mrp: 90,
        delivery: 'Delivery within 1 day',
        inStock: true
      }
    ],
    []
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
        delivery: product.deliveryInfo || 'Delivery within 2 days',
        inStock: product.stock > 0
      }))
    }
    return fallbackFeaturedProducts
  }, [popularProductsData, fallbackFeaturedProducts])

  const mockSuggestions = useMemo(() => [
    'Paracetamol',
    'Crocin Advance',
    'Dolo 650',
    'Calpol 500',
    'Cetirizine',
    'Azithromycin',
    'Amoxicillin',
    'Vitamin D3'
  ], [])

  // Memoize filtered suggestions
  const filteredSuggestions = useMemo(() => {
    if (searchQuery.length === 0) return []
    return mockSuggestions.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, mockSuggestions])

  const handleSearch = useCallback((value) => {
    setSearchQuery(value)
    if (value.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [])

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
  }, [searchQuery, navigate])

  const performUpload = useCallback(async (file) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('prescription', file)

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken')
      
      
      if (!token) {
        toast.error('Please login to upload prescription')
        setShowOtpModal(true)
        return
      }

      console.log('Uploading to:', `${API_URL}/prescriptions`)
      console.log('File:', file.name, file.type, file.size)

      const response = await fetch(
        `${API_URL}/prescriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
        
      )

      const data = await response.json()
      console.log('Upload response:', response.status, data)

      if (response.ok && data.success) {
        toast.success('Prescription uploaded successfully!')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        navigate('/prescriptions')
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload prescription. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [navigate])

  const handlePrescriptionUpload = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    // Check if user is authenticated
    const token = getAccessToken()
    
    if (!token) {
      // Store file and show OTP modal
      setPendingFile(file)
      setShowOtpModal(true)
      return
    }

    // User is authenticated, proceed with upload
    await performUpload(file)
  }, [performUpload])

  const handleOtpSuccess = useCallback(() => {
    // User authenticated, upload pending file
    if (pendingFile) {
      performUpload(pendingFile)
      setPendingFile(null)
    }
  }, [pendingFile, performUpload])

  return (
    <>
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false)
          setPendingFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }}
        onSuccess={handleOtpSuccess}
      />
      <div className="space-y-6 px-2 pb-16 md:px-8">
      {/* Search Section */}
      <section
        className="relative -mx-4 flex min-h-[260px] w-auto items-center justify-center overflow-hidden bg-[url('https://res.cloudinary.com/dcu2kdrva/image/upload/v1762580905/products/id17gpdmioelovzlflvi.png')] bg-cover bg-center text-white md:-mx-8 md:min-h-[320px]"
      >
        <div className="absolute inset-0 bg-black/35"></div>
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.65) 1px, transparent 0)`,
            backgroundSize: '38px 38px'
          }}
        ></div>

        <div
          className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-8 text-center transition-all duration-700 ease-out md:px-12 md:py-10 ${
            isHeroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Find Your Medicines
          </h2>
          <p className="text-base md:text-lg mb-5 opacity-90">
            Search from thousands of authentic products
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl mx-auto mb-5">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/80" size={24} />
              <input
                type="text"
                placeholder="Search medicines, symptoms, or health concerns..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                className="w-full rounded-lg border border-white/50 bg-transparent pl-16 pr-4 py-2.5 text-white shadow-sm backdrop-blur-sm placeholder:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/80"
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        navigate(`/products?search=${encodeURIComponent(suggestion)}`)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-medical-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Shop Medicines</span>
              <ArrowRight size={20} />
            </Link>
            
            <label className="bg-white text-medical-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer">
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload Prescription'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handlePrescriptionUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="-mx-4 md:-mx-8">
        <CategoryBar />
      </section>

      {/* Promotional Banner Carousel */}
      <section className="-mx-4 -mt-4 md:-mx-8 md:-mt-6">
        <PromoBannerCarousel />
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Why Choose MediShop?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="text-medical-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            Popular Medicines
          </h2>
          <Link
            to="/products"
            className="text-sm font-semibold text-medical-600 hover:text-medical-700"
          >
            View all
          </Link>
        </div>
        {isPopularError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load featured products. Showing recommendations instead.
          </div>
        )}
        {isPopularLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="ml-auto h-5 w-5 rounded-full bg-slate-200" />
                  <div className="h-32 w-full rounded-lg bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                  <div className="mt-2 flex gap-2">
                    <div className="h-9 flex-1 rounded-full bg-slate-200" />
                    <div className="h-9 w-9 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {featuredProducts.map((product) => (
              <div
                key={product.id ?? product.name}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <button
                  type="button"
                  className="ml-auto text-slate-300 transition group-hover:text-medical-500"
                  aria-label="Add to wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a7 7 0 0 1 10 0l.35.35.35-.35a7 7 0 1 1 9.9 9.9l-10.25 10.2a1 1 0 0 1-1.4 0L5 14.9A7 7 0 0 1 5 5Z" />
                  </svg>
                </button>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-32 w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <h3 className="min-h-[40px] text-sm font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        ₹{Number(product.price ?? 0).toLocaleString()}
                      </span>
                      {product.mrp && product.mrp !== product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹{Number(product.mrp ?? 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-xs text-slate-600">
                      <span className={`inline-flex h-2 w-2 rounded-full ${product.inStock ? 'bg-medical-500' : 'bg-red-500'}`}></span>
                      {product.inStock ? product.delivery : 'Currently unavailable'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!product.inStock}
                    className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      product.inStock
                        ? 'border-medical-600 text-medical-600 hover:bg-medical-600 hover:text-white'
                        : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    }`}
                  >
                    {product.inStock ? 'Add to cart' : 'Out of stock'}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-medical-600 hover:text-medical-600"
                    aria-label="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      </div>
    </>
  )
}

export default Home
