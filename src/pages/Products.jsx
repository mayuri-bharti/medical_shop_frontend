import { useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Search } from 'lucide-react'
import PageCarousel from '../components/PageCarousel'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const { data, isLoading, error } = useQuery(
    ['products', searchTerm, selectedCategory, sortBy],
    async () => {
      try {
        const fullUrl = `${api.defaults.baseURL}/products`;
        console.log('🔍 Fetching products:', {
          baseURL: api.defaults.baseURL,
          relativeURL: '/products',
          fullURL: fullUrl,
          params: { search: searchTerm, category: selectedCategory, sort: sortBy }
        });
        
        const response = await api.get('/products', {
          params: { 
            search: searchTerm || undefined, 
            category: selectedCategory || undefined, 
            sort: sortBy || undefined 
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
      retryDelay: 1000
    }
  )
  
  const products = data?.products || []

  const categories = [
    'Prescription Medicines',
    'OTC Medicines',
    'Wellness Products',
    'Personal Care',
    'Health Supplements',
    'Baby Care',
    'Medical Devices',
    'Ayurvedic Products'
  ]

  // Products Page Carousel
  const productBanners = [
    {
      src: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=400&fit=crop',
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
  ]

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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search medicines and products..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          className="input-field md:w-48"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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

      {/* Products Grid - Responsive: 1 mobile, 2 tablet, 3 medium, 6 laptop */}
      {products?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found matching your criteria.</p>
        </div>
      )}

    </div>
  )
}

export default Products




