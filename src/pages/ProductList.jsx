import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')

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

  useEffect(() => {
    fetchProducts()
  }, [page, searchTerm, selectedCategory])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get API base URL from environment or use default
      const getDefaultApiUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:4000/api'
        }
        return 'https://medical-shop-backend.vercel.app/api'
      }
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl()
      
      console.log('Fetching products from:', API_BASE_URL)
      
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: {
          page,
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(selectedCategory && { category: selectedCategory })
        },
        timeout: 30000, // 30 second timeout for mobile networks
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (response.data && response.data.success) {
        const productsData = response.data.products || []
        setProducts(productsData)
        setTotalPages(response.data.pagination?.pages || 1)
        console.log(`Loaded ${productsData.length} products`)
      } else {
        console.error('Invalid response format:', response.data)
        setError('Failed to load products: Invalid response format')
      }
    } catch (err) {
      console.error('Fetch products error:', err)
      
      // Better error messages for mobile users
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection and try again.')
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection.')
      } else if (err.response?.status === 0) {
        setError('Cannot connect to server. Please check your internet connection.')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load products. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchParams({
      page: 1,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory })
    })
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    setPage(1)
    setSearchParams({
      page: 1,
      ...(searchTerm && { search: searchTerm }),
      ...(category !== selectedCategory && category && { category })
    })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    setSearchParams({
      page: newPage,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory })
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-medical-600 hover:bg-medical-700 text-white font-medium rounded-lg transition-colors"
              >
                Search
              </button>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-medical-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Products Grid - Responsive: 2 mobile, 2 tablet, 3 medium, 6 laptop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 mb-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-medical-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="px-2">...</span>
                  }
                  return null
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ProductList






