import { useState, useEffect } from 'react'
import { Package, Edit, Trash2, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAdminProducts, deleteProduct } from '../../lib/api'
import toast from 'react-hot-toast'

const ManageProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      }
      const response = await getAdminProducts(params)
      if (response.success) {
        setProducts(response.data?.products || [])
        setTotalPages(response.data?.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await deleteProduct(productId)
      if (response.success) {
        toast.success('Product deleted successfully')
        fetchProducts()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete product')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">View, edit, and delete products</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard/add-product')}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 md:px-6 md:py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto font-medium"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name, brand, or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Package className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">No products found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm md:text-base font-semibold text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base text-gray-900 font-mono font-medium">{product.sku}</div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base font-semibold text-gray-900">{formatCurrency(product.price)}</div>
                        {product.mrp > product.price && (
                          <div className="text-xs text-gray-500 line-through">{formatCurrency(product.mrp)}</div>
                        )}
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full ${
                          product.stock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base text-gray-900 truncate max-w-[150px]">{product.category || 'N/A'}</div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/dashboard/edit-product/${product._id}`)}
                            className="p-2 text-medical-600 hover:bg-medical-50 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {products.map((product) => (
                <div key={product._id} className="p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <div className="font-medium text-gray-900">{formatCurrency(product.price)}</div>
                      {product.mrp > product.price && (
                        <div className="text-xs text-gray-500 line-through">{formatCurrency(product.mrp)}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <div className="text-gray-900">{product.category || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/admin/dashboard/edit-product/${product._id}`)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-sm md:text-base text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ManageProducts







