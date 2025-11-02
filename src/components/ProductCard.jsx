import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async () => {
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
  }

  const discountPercentage = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={product.image || '/placeholder-medicine.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23E5E7EB" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EMedicine%3C/text%3E%3C/svg%3E'
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        
        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.mrp > product.price && (
            <>
              <span className="text-sm text-gray-500 line-through">
                ₹{product.mrp.toLocaleString()}
              </span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                {discountPercentage}% OFF
              </span>
            </>
          )}
        </div>

        {/* Stock Info */}
        {product.stock > 0 && product.stock < 10 && (
          <p className="text-xs text-orange-600 mb-3">
            Only {product.stock} left!
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-medical-600 hover:bg-medical-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* Quick Info */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{product.packSize}</span>
          {product.rating?.average > 0 && (
            <span className="flex items-center">
              ⭐ {product.rating.average}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard

