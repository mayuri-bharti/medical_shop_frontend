import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Search, Filter, ShoppingCart } from 'lucide-react'
import PageCarousel from '../components/PageCarousel'

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const { data, isLoading, error } = useQuery(
    ['products', searchTerm, selectedCategory, sortBy],
    () => api.get('/products', {
      params: { search: searchTerm, category: selectedCategory, sort: sortBy }
    }).then(res => res.data),
    {
      keepPreviousData: true
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

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products?.map((product) => (
          <div key={product._id} className="card p-3 hover:shadow-lg transition-shadow duration-200">
            <div className="h-32 w-full bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
              <img
                src={product.images?.[0] || product.image || '/placeholder-medicine.jpg'}
                alt={product.name}
                className="h-32 w-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-medicine.jpg'
                }}
              />
            </div>
            
            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through ml-1">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              {product.discount && (
                <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <button className="w-full bg-teal-600 text-white text-xs px-2 py-1 rounded hover:bg-teal-700">
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {products?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Products




