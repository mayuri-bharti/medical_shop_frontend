import { useState, useMemo, useCallback, useDeferredValue, useEffect, useRef } from 'react'
import { useQuery } from 'react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { Search } from 'lucide-react'
import PageCarousel from '../components/PageCarousel'
import ProductCard from '../components/ProductCard'
import SearchResultCard from '../components/SearchResultCard'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')
  const [sortBy, setSortBy] = useState('name')
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false)
  const previousCategoryRef = useRef(selectedCategory)
  const previousSearchRef = useRef(searchTerm)
  const previousBrandRef = useRef(selectedBrand)
  
  // Use deferred value for search to reduce API calls
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { data, isLoading, error, isFetching } = useQuery(
    ['products', deferredSearchTerm, selectedCategory, selectedBrand, sortBy],
    async () => {
      try {
        const fullUrl = `${api.defaults.baseURL}/products`;
        console.log('🔍 Fetching products:', {
          baseURL: api.defaults.baseURL,
          relativeURL: '/products',
          fullURL: fullUrl,
          params: { search: searchTerm, category: selectedCategory, brand: selectedBrand, sort: sortBy }
        });
        
        const response = await api.get('/products', {
          params: { 
            search: deferredSearchTerm || undefined, 
            category: selectedCategory || undefined,
            brand: selectedBrand || undefined,
            sort: sortBy || undefined,
            page: 1,
            limit: 20
          },
          timeout: 60000, // 60 second timeout for mobile networks (increased)
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Products API response:', response.status, response.data)
        
        // Handle both old and new response formats
        const responseData = response.data
        
        // If response has success field, use it directly
        if (responseData && responseData.success !== undefined) {
          if (responseData.success && responseData.products) {
            console.log(`Successfully loaded ${responseData.products.length} products`)
            return responseData
          } else {
            console.warn('API returned success=false:', responseData)
            throw new Error(responseData.message || 'Failed to load products')
          }
        }
        
        // If no success field, check if products array exists
        if (responseData && (responseData.products || Array.isArray(responseData))) {
          const products = responseData.products || responseData || []
          console.log(`Loaded ${products.length} products (legacy format)`)
          return {
            success: true,
            products: products,
            pagination: responseData.pagination || {}
          }
        }
        
        // No products found
        console.warn('No products in response:', responseData)
        return {
          success: true,
          products: [],
          pagination: {}
        }
      } catch (err) {
        console.error('Products API error details:', {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url,
          baseURL: err.config?.baseURL
        })
        throw err
      }
    },
    {
      keepPreviousData: true,
      retry: 2,
      retryDelay: 1000,
      staleTime: 30000, // Cache for 30 seconds
      cacheTime: 300000 // Keep in cache for 5 minutes
    }
  )
  
  const products = useMemo(() => data?.products || [], [data?.products])

  const trimmedSearch = deferredSearchTerm?.trim() || ''

  const {
    data: combinedSearchResults = [],
    isLoading: isCombinedLoading,
    isFetching: isCombinedFetching,
    error: combinedSearchError,
    isError: hasCombinedError
  } = useQuery(
    ['combined-search', trimmedSearch],
    async () => {
      if (!trimmedSearch) {
        return []
      }

      const parseResponseData = (data) => {
        if (data?.success && Array.isArray(data.results)) {
          return data.results
        }
        return []
      }

      const tryFetch = async (url) => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        })

        if (!response.ok) {
          const error = new Error(`Request failed with status ${response.status}`)
          error.response = response
          throw error
        }

        const json = await response.json()
        return parseResponseData(json)
      }

      try {
        const response = await api.get('/search', {
          params: {
            search: trimmedSearch,
            _t: Date.now()
          },
          timeout: 45000,
          headers: {
            Accept: 'application/json'
          }
        })

        if (response.status === 304) {
          return []
        }

        if (response.data?.success && Array.isArray(response.data.results)) {
          return response.data.results
        }
      } catch (axiosError) {
        console.error('Combined search axios error:', axiosError)
        const attemptedUrls = new Set()

        if (api?.defaults?.baseURL) {
          const normalizedBase = api.defaults.baseURL.endsWith('/')
            ? api.defaults.baseURL.slice(0, -1)
            : api.defaults.baseURL

          const remoteUrl = `${normalizedBase}/search?search=${encodeURIComponent(trimmedSearch)}&_t=${Date.now()}`
          attemptedUrls.add(remoteUrl)
        }

        const localUrl = `http://localhost:4000/api/search?search=${encodeURIComponent(trimmedSearch)}&_t=${Date.now()}`
        attemptedUrls.add(localUrl)

        for (const url of attemptedUrls) {
          try {
            return await tryFetch(url)
          } catch (fallbackError) {
            console.error(`Combined search fallback failed for ${url}:`, fallbackError)
          }
        }

        throw axiosError
      }

      return []
    },
    {
      enabled: Boolean(trimmedSearch),
      staleTime: 0,
      cacheTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
      keepPreviousData: false
    }
  )

  const combinedErrorMessage = useMemo(() => {
    if (!hasCombinedError || !combinedSearchError) {
      return ''
    }

    if (combinedSearchError?.response?.data?.message) {
      return combinedSearchError.response.data.message
    }

    if (combinedSearchError?.message) {
      return combinedSearchError.message
    }

    return 'Failed to fetch combined results.'
  }, [combinedSearchError, hasCombinedError])

  useEffect(() => {
    const categoryParam = searchParams.get('category') || ''
    const searchParam = searchParams.get('search') || ''
    const brandParam = searchParams.get('brand') || ''

    setSelectedCategory((prev) => (prev === categoryParam ? prev : categoryParam))
    setSearchTerm((prev) => (prev === searchParam ? prev : searchParam))
    setSelectedBrand((prev) => (prev === brandParam ? prev : brandParam))

    const categoryChanged = previousCategoryRef.current !== categoryParam
    const searchChanged = previousSearchRef.current !== searchParam
    const brandChanged = previousBrandRef.current !== brandParam

    if ((categoryChanged || searchChanged || brandChanged) && (categoryParam || searchParam || brandParam)) {
      setIsFilterTransitioning(true)
    }

    previousCategoryRef.current = categoryParam
    previousSearchRef.current = searchParam
    previousBrandRef.current = brandParam
  }, [searchParams])

  useEffect(() => {
    if (isFetching && !isLoading) {
      setIsFilterTransitioning(true)
      return
    }
    if (!isFilterTransitioning) return

    const timeout = setTimeout(() => setIsFilterTransitioning(false), 350)
    return () => clearTimeout(timeout)
  }, [isFetching, isLoading, isFilterTransitioning])

  const categories = useMemo(() => [
    'Prescription Medicines',
    'OTC Medicines',
    'Wellness Products',
    'Personal Care',
    'Health Supplements',
    'Baby Care',
    'Medical Devices',
    'Ayurvedic Products',
    'Pain Relief',
    'Antibiotics',
    'Allergy & Cold',
    'Diabetes Care',
    'Cardiology Meds',
    'Thyroid & Hormones',
    'Fever & Flu',
    'Antiseptics',
    'Eye/Ear Drops',
    'Digestion & Acidity',
    'Laxatives',
    'Stomach Care',
    'Multivitamins',
    'Vitamin D & C',
    'Calcium & Iron',
    'Protein Powder',
    'Weight Management',
    'Herbal & Organic',
    'Moisturizers',
    'Serums & Toners',
    'Sunscreen',
    'Shampoos & Conditioners',
    'Deodorants & Perfumes',
    'Feminine Hygiene',
    'Diapers & Wipes',
    'Baby Food',
    'Bath & Skincare',
    'Maternity Care',
    'Breastfeeding Aids',
    'Postpartum Support',
    'BP Monitors',
    'Oximeters',
    'Thermometers',
    'Wheelchairs',
    'Supports & Braces',
    'Physiotherapy',
    'Adult Diapers',
    'Nutritional Drinks',
    'Walker & Sticks',
    'Heart Care',
    'Bone & Joint',
    'Memory Support',
    'Condoms',
    'Performance',
    'Lubricants',
    'Intimate Care',
    'Pregnancy Tests',
    'Wellness Kits'
  ], [])

  const filteredProducts = useMemo(() => {
    // If brand is selected, backend already filters by brand, so return products as-is
    // If only category is selected, filter by category on frontend
    if (selectedBrand) {
      // Backend already filtered by brand, but we can do additional frontend filtering if needed
      return products
    }
    
    if (!selectedCategory) return products

    const normalizedCategory = selectedCategory.toLowerCase()

    return products.filter((product) => {
      const searchableFields = [
        product.category,
        product.subcategory,
        product.subCategory,
        product.type,
        product.tag,
        ...(Array.isArray(product.tags) ? product.tags : []),
        product.name
      ]

      return searchableFields.some((field) => {
        if (typeof field === 'string') {
          return field.toLowerCase().includes(normalizedCategory)
        }
        return false
      })
    })
  }, [products, selectedCategory, selectedBrand])

  // Products Page Carousel
  const productBanners = useMemo(() => [
    {
      src: 'https://res.cloudinary.com/dcu2kdrva/image/upload/v1762580905/products/id17gpdmioelovzlflvi.png',
      alt: 'Medicine Collection',
      title: 'Huge Selection of Medicines',
      description: 'Browse thousands of authentic medicines and healthcare products'
    },
    {
      src: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&h=400&fit=crop',
      alt: 'Special Offers',
      title: 'Special Offers & Discounts',
      description: 'Save up to 30% on selected medicines and wellness products'
    },
    {
      src: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=1200&h=400&fit=crop',
      alt: 'Verified Products',
      title: '100% Verified Products',
      description: 'All medicines verified and approved by health authorities'
    }
  ], [])

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory) params.set('category', selectedCategory)
    setSearchParams(params, { replace: true })
  }, [searchTerm, selectedCategory, setSearchParams])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error) {
    console.error('Products loading error:', error)
    
    // Get more detailed error information
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Unknown error occurred'
    const errorStatus = error.response?.status
    const isNetworkError = error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
    const isCorsError = error.message?.includes('CORS') || error.message?.includes('cors')
    
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <p className="text-red-600 font-semibold text-lg mb-2">
              {isNetworkError 
                ? 'Network Error' 
                : isTimeout 
                  ? 'Connection Timeout' 
                  : isCorsError
                    ? 'Connection Error'
                    : 'Error loading products'}
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {isNetworkError 
                ? 'Please check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.'
                : isTimeout
                  ? 'The request took too long. This may be due to a slow connection. Please check your internet and try again.'
                  : isCorsError
                    ? 'Unable to connect to the server. Please try again or contact support if the issue persists.'
                    : errorMessage}
            </p>
            {errorStatus && (
              <p className="text-gray-500 text-xs mb-4">
                Status: {errorStatus}
              </p>
            )}
            <p className="text-gray-400 text-xs mb-4 font-mono break-all">
              API URL: {api.defaults.baseURL || 'Not set'}<br/>
              Full URL: {api.defaults.baseURL ? `${api.defaults.baseURL}/products` : 'Not set'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-medical-600 hover:bg-medical-700 text-white font-medium rounded-lg transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                // Force refetch by clearing cache and retrying
                window.location.href = '/products'
              }}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Products Page Carousel */}
      <PageCarousel 
        images={productBanners}
        autoSlide={true}
        interval={4000}
        height="h-32 md:h-40 lg:h-48"
      />

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form 
          className="flex-1 relative"
          onSubmit={handleSearchSubmit}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search medicines and products..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {/* Category Filter */}
        <select
          className="input-field md:w-48"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            // Update URL immediately when category changes
            const params = new URLSearchParams(searchParams)
            if (e.target.value) {
              params.set('category', e.target.value)
            } else {
              params.delete('category')
            }
            if (searchTerm) {
              params.set('search', searchTerm)
            } else {
              params.delete('search')
            }
            setSearchParams(params, { replace: true })
            if (e.target.value) {
              setIsFilterTransitioning(true)
            }
          }}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="input-field md:w-48"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      {(selectedCategory || selectedBrand) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-medical-100 bg-medical-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-medical-700">
              Showing results for{' '}
              {selectedBrand && (
                <span className="underline decoration-medical-400 decoration-2">{selectedBrand}</span>
              )}
              {selectedBrand && selectedCategory && ' • '}
              {selectedCategory && (
                <span className="underline decoration-medical-400 decoration-2">{selectedCategory}</span>
              )}
            </p>
            <p className="text-xs text-medical-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('')
              setSelectedBrand('')
              const params = new URLSearchParams(searchParams)
              params.delete('category')
              params.delete('brand')
              setSearchParams(params, { replace: true })
            }}
            className="rounded-full border border-medical-200 px-3 py-1 text-xs font-medium text-medical-700 transition-colors hover:bg-white hover:text-medical-800"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Products Grid - Responsive: 2 mobile, 2 tablet, 3 medium, 6 laptop */}
      {filteredProducts?.length > 0 ? (
        <div className="relative">
          {isFilterTransitioning && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[2px]">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-medical-300 border-t-medical-600"></div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found matching your criteria.</p>
        </div>
      )}

      {searchTerm?.trim() && (
        <div className="space-y-3 rounded-lg border border-medical-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-medical-700">
                Combined results for “{searchTerm.trim()}”
              </p>
              <p className="text-xs text-medical-500">
                {isCombinedLoading || isCombinedFetching
                  ? 'Searching medicines and products...'
                  : combinedSearchResults.length > 0
                    ? `Found ${combinedSearchResults.length} matching items.`
                    : combinedErrorMessage || 'No medicines or products found for this search.'}
              </p>
            </div>
            <Link
              to={`/all-medicine?search=${encodeURIComponent(searchTerm.trim())}`}
              className="inline-flex items-center justify-center rounded-md bg-medical-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-medical-700"
            >
              View medicines catalogue
            </Link>
          </div>

          {combinedSearchResults.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {combinedSearchResults.slice(0, 8).map((result) => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default Products




