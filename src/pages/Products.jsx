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
        const response = await api.get('/products', {
          params: { search: searchTerm, category: selectedCategory, sort: sortBy }
        })
        
        // Handle both old and new response formats
        const responseData = response.data
        if (responseData && responseData.success !== undefined) {
          return responseData
        }
        // If no success field, assume success and add it
        return {
          success: true,
          products: responseData.products || responseData || [],
          pagination: responseData.pagination || {}
        }
      } catch (err) {
        console.error('Products API error:', err)
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
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading products. Please try again.</p>
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

      {/* Products Grid - Responsive: 1-2 mobile, 2-3 tablet, 6 laptop */}
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




