import { useState, useEffect } from 'react'
import { Image, Trash2, Plus, X, Upload, Edit, GripVertical, Eye, EyeOff, Search } from 'lucide-react'
import { useQuery, useQueryClient } from 'react-query'
import { getAdminBanners, createBanner, updateBanner, deleteBanner, reorderBanners } from '../../lib/api'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const ManageBanners = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    offerText: '',
    image: null,
    imageUrl: '',
    order: 0,
    isActive: true
  })
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [imageSource, setImageSource] = useState('upload') // 'upload' or 'url'
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState([])
  const [showProductSearch, setShowProductSearch] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    'admin-banners',
    async () => {
      const response = await getAdminBanners()
      if (response.success) {
        return response.data || []
      }
      return []
    },
    {
      refetchOnWindowFocus: true,
      staleTime: 10000
    }
  )

  const banners = data || []

  // Search products
  const searchProducts = async (query) => {
    if (!query || query.length < 2) {
      setProductResults([])
      return
    }
    try {
      const response = await api.get('/products', {
        params: { search: query, limit: 10 }
      })
      if (response.data?.success) {
        setProductResults(response.data.products || [])
      } else if (Array.isArray(response.data)) {
        setProductResults(response.data.slice(0, 10))
      }
    } catch (error) {
      console.error('Product search error:', error)
      setProductResults([])
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (productSearch) {
        searchProducts(productSearch)
      } else {
        setProductResults([])
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [productSearch])

  const handleProductSelect = (product) => {
    setFormData({
      ...formData,
      link: `/product/${product._id}`,
      title: product.name
    })
    setProductSearch('')
    setProductResults([])
    setShowProductSearch(false)
    toast.success(`Linked to product: ${product.name}`)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      offerText: banner.offerText || '',
      image: null,
      imageUrl: banner.imageUrl || '',
      order: banner.order || 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true
    })
    setPreview(banner.imageUrl)
    setImageSource(banner.imageUrl && !banner.imageUrl.startsWith('/uploads/') ? 'url' : 'upload')
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingBanner(null)
    setFormData({ title: '', subtitle: '', link: '', offerText: '', image: null, imageUrl: '', order: 0, isActive: true })
    setPreview(null)
    setImageSource('upload')
    setProductSearch('')
    setProductResults([])
    setShowProductSearch(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.link.trim()) {
      toast.error('Link is required')
      return
    }
    
    // Validate image source
    if (!editingBanner) {
      if (imageSource === 'upload' && !formData.image) {
        toast.error('Please upload a banner image or provide an image URL')
        return
      }
      if (imageSource === 'url' && !formData.imageUrl.trim()) {
        toast.error('Please provide an image URL')
        return
      }
      if (imageSource === 'url') {
        // Validate URL
        try {
          new URL(formData.imageUrl.trim())
        } catch {
          toast.error('Please enter a valid image URL')
          return
        }
      }
    } else {
      // For editing, validate only if changing image
      if (imageSource === 'url' && formData.imageUrl.trim()) {
        try {
          new URL(formData.imageUrl.trim())
        } catch {
          toast.error('Please enter a valid image URL')
          return
        }
      }
    }

    const link = formData.link.trim()
    const isExternalUrl = link.startsWith('http://') || link.startsWith('https://')
    const isInternalRoute = link.startsWith('/')
    
    if (!isExternalUrl && !isInternalRoute) {
      toast.error('Please enter a valid URL or internal route')
      return
    }
    
    if (isExternalUrl) {
      try {
        new URL(link)
      } catch {
        toast.error('Please enter a valid URL')
        return
      }
    }

    setUploading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('subtitle', formData.subtitle.trim())
      formDataToSend.append('link', formData.link.trim())
      formDataToSend.append('offerText', formData.offerText.trim())
      
      // Handle image: either upload file or use URL
      if (imageSource === 'upload' && formData.image) {
        formDataToSend.append('image', formData.image)
      } else if (imageSource === 'url' && formData.imageUrl.trim()) {
        // For URL, we need to send it differently - backend should handle it
        // We'll send it as imageUrl field if no file is uploaded
        if (!formData.image) {
          formDataToSend.append('imageUrl', formData.imageUrl.trim())
        } else {
          formDataToSend.append('image', formData.image)
        }
      }
      
      formDataToSend.append('order', formData.order)
      formDataToSend.append('isActive', formData.isActive)

      let response
      if (editingBanner) {
        response = await updateBanner(editingBanner._id || editingBanner.id, formDataToSend)
        if (response.success) {
          toast.success('Banner updated successfully!')
        }
      } else {
        response = await createBanner(formDataToSend)
        if (response.success) {
          toast.success('Banner added successfully!')
        }
      }

      if (response.success) {
        handleCloseModal()
        queryClient.invalidateQueries('admin-banners')
        queryClient.invalidateQueries('banners')
        refetch()
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${editingBanner ? 'update' : 'create'} banner`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      const response = await deleteBanner(bannerId)
      if (response.success) {
        toast.success('Banner deleted successfully')
        queryClient.invalidateQueries('admin-banners')
        queryClient.invalidateQueries('banners')
        refetch()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete banner')
    }
  }

  const handleToggleActive = async (banner) => {
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('isActive', !banner.isActive)
      
      const response = await updateBanner(banner._id || banner.id, formDataToSend)
      if (response.success) {
        toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'} successfully`)
        queryClient.invalidateQueries('admin-banners')
        queryClient.invalidateQueries('banners')
        refetch()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update banner status')
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newBanners = [...banners]
    const draggedBanner = newBanners[draggedIndex]
    newBanners.splice(draggedIndex, 1)
    newBanners.splice(dropIndex, 0, draggedBanner)

    // Update order based on new positions
    const bannerIds = newBanners.map(banner => banner._id || banner.id)

    try {
      const response = await reorderBanners(bannerIds)
      if (response.success) {
        toast.success('Banners reordered successfully')
        queryClient.invalidateQueries('admin-banners')
        queryClient.invalidateQueries('banners')
        refetch()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reorder banners')
    }

    setDraggedIndex(null)
  }

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Manage Banners</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">
            Add, edit, delete, and reorder homepage banners. Drag banners to reorder them.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 md:px-6 md:py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto font-medium"
        >
          <Plus size={20} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Image className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">No banners found</p>
            <p className="mt-2 text-gray-500 text-xs sm:text-sm">Click "Add Banner" to create your first banner</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {banners.map((banner, index) => (
              <div
                key={banner._id || banner.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                  <GripVertical size={20} />
                </div>

                {/* Banner Image */}
                <div className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x224?text=Banner+Image'
                    }}
                  />
                </div>

                {/* Banner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
                    {banner.offerText && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        {banner.offerText}
                      </span>
                    )}
                    {!banner.isActive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 truncate mb-1">{banner.subtitle}</p>
                  )}
                  <a
                    href={banner.link}
                    target={banner.link.startsWith('/') ? undefined : '_blank'}
                    rel={banner.link.startsWith('/') ? undefined : 'noopener noreferrer'}
                    className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {banner.link}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Order: {banner.order}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id || banner.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter banner title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle (optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter banner subtitle"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setShowProductSearch(!showProductSearch)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Search size={14} />
                      <span>Link to Product</span>
                    </button>
                  </div>
                  
                  {showProductSearch && (
                    <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search for a product..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      />
                      {productResults.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                          {productResults.map((product) => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => handleProductSelect(product)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 text-sm"
                            >
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.brand} - ₹{product.price}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/products or https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This link will open when the banner is clicked
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Text / Label (optional)
                </label>
                <input
                  type="text"
                  value={formData.offerText}
                  onChange={(e) => setFormData({ ...formData, offerText: e.target.value })}
                  placeholder="e.g., 50% OFF, New Arrival, Limited Time"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This text will appear as a badge on the banner
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image {!editingBanner && <span className="text-red-500">*</span>}
                  {editingBanner && <span className="text-gray-500 text-xs ml-2">(Optional - leave empty to keep current image)</span>}
                </label>
                
                {/* Image Source Toggle */}
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageSource('upload')
                      setFormData({ ...formData, imageUrl: '' })
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      imageSource === 'upload'
                        ? 'bg-medical-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSource('url')
                      setFormData({ ...formData, image: null })
                      if (editingBanner && editingBanner.imageUrl && !editingBanner.imageUrl.startsWith('/uploads/')) {
                        setFormData({ ...formData, imageUrl: editingBanner.imageUrl, image: null })
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      imageSource === 'url'
                        ? 'bg-medical-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {imageSource === 'url' ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value })
                        if (e.target.value.trim()) {
                          setPreview(e.target.value.trim())
                        }
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      required={!editingBanner}
                    />
                    <p className="text-xs text-gray-500">
                      Enter the full URL of the banner image
                    </p>
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-48 object-contain rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            toast.error('Failed to load image from URL')
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-medical-500 transition-colors">
                    <div className="space-y-1 text-center">
                      {preview ? (
                        <div className="relative">
                          <img
                            src={preview}
                            alt="Preview"
                            className="mx-auto h-48 object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, image: null, imageUrl: '' })
                              if (editingBanner) {
                                setPreview(editingBanner.imageUrl)
                              } else {
                                setPreview(null)
                              }
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            {editingBanner ? 'Reset to original' : 'Remove image'}
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-medical-600 hover:text-medical-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-medical-500">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                                required={!editingBanner && imageSource === 'upload'}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{editingBanner ? 'Updating...' : 'Uploading...'}</span>
                    </>
                  ) : (
                    <>
                      {editingBanner ? <Edit size={16} /> : <Plus size={16} />}
                      <span>{editingBanner ? 'Update Banner' : 'Add Banner'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageBanners

