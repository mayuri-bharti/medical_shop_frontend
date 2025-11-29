import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { X, Upload, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ClaimModal = ({ order, onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  const [selectedItems, setSelectedItems] = useState({})
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const reasons = [
    { value: 'Wrong product', label: 'Wrong product' },
    { value: 'Damaged item', label: 'Damaged item' },
    { value: 'Item missing', label: 'Item missing' },
    { value: 'Not delivered', label: 'Not delivered' },
    { value: 'Other', label: 'Other' }
  ]

  const handleItemToggle = (itemId, maxQuantity = 1) => {
    setSelectedItems((prev) => {
      if (prev[itemId]) {
        const newState = { ...prev }
        delete newState[itemId]
        return newState
      }
      return { ...prev, [itemId]: Math.min(1, maxQuantity) }
    })
  }

  const handleQuantityChange = (itemId, quantity, maxQuantity = 1) => {
    const qty = Math.min(Math.max(1, parseInt(quantity, 10) || 1), maxQuantity)
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: qty
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            file,
            preview: URL.createObjectURL(file)
          }
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    // Revoke object URL to prevent memory leaks
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview)
    }
    setImages(newImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.keys(selectedItems).length === 0) {
      toast.error('Please select at least one item for the claim')
      return
    }

    if (!reason) {
      toast.error('Please select a claim reason')
      return
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error('Please provide a detailed description (minimum 10 characters)')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      
      // Build items array safely with error handling
      const itemsArray = []
      
      for (const [itemId, quantity] of Object.entries(selectedItems)) {
        try {
          const item = order.items?.find(oi => {
            if (!oi) return false
            const id = (oi._id ? String(oi._id) : null) || (oi.orderItemId ? String(oi.orderItemId) : null) || ''
            return id === String(itemId)
          })
          
          if (!item) {
            console.warn(`Item not found for ID: ${itemId}`)
            continue
          }
          
          let productId = null
          if (item.product) {
            if (typeof item.product === 'object' && item.product._id) {
              productId = String(item.product._id)
            } else if (typeof item.product === 'string') {
              productId = item.product
            }
          }
          
          itemsArray.push({
            orderItemId: String(itemId),
            productId: productId,
            quantity: Number(quantity) || 1
          })
        } catch (itemError) {
          console.error(`Error processing item ${itemId}:`, itemError)
          // Continue with other items
        }
      }

      // Validate items array
      if (!itemsArray || itemsArray.length === 0) {
        toast.error('Please select at least one valid item for the claim')
        setSubmitting(false)
        return
      }

      // Validate order ID
      if (!order || !order._id) {
        toast.error('Invalid order data')
        setSubmitting(false)
        return
      }

      formData.append('orderId', String(order._id))
      formData.append('items', JSON.stringify(itemsArray))
      formData.append('reason', reason)
      formData.append('description', description.trim())
      
      console.log('Submitting claim with items:', itemsArray) // Debug log

      // Add images
      images.forEach((image) => {
        formData.append('images', image.file)
      })

      const response = await api.post('/claims', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Claim raised successfully!')
        // Invalidate queries to refetch claims
        queryClient.invalidateQueries(['my-claims-summary'])
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      }
    } catch (error) {
      console.error('Claim submission error:', error)
      toast.error(error?.response?.data?.message || 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Raise a Claim</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Order Information</p>
              <p>Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
              <p>Total: {formatCurrency(order.totalAmount || order.total)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Items to Claim</h3>
            <div className="space-y-3">
              {order.items?.filter(Boolean).map((item, index) => {
                const itemId = (item._id ? String(item._id) : null) || (item.orderItemId ? String(item.orderItemId) : null) || `item-${index}`
                const isSelected = !!selectedItems[itemId]
                const selectedQuantity = selectedItems[itemId] || 1

                return (
                  <div
                    key={itemId}
                    className={`border rounded-lg p-4 ${
                      isSelected ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleItemToggle(itemId, item.quantity)}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-contain rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Ordered: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                            {isSelected && (
                              <div className="mt-3 flex items-center gap-2">
                                <label className="text-sm text-gray-700">Quantity:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.quantity}
                                  value={selectedQuantity}
                                  onChange={(e) =>
                                    handleQuantityChange(itemId, e.target.value, item.quantity)
                                  }
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-sm text-gray-500">of {item.quantity}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Select a reason</option>
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Please provide detailed information about your claim..."
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/1000 characters (minimum 10)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Maximum 5 images (JPEG, PNG, WEBP - Max 5MB each)</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                'Submit Claim'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClaimModal

