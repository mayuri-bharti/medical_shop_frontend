import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ReturnRequestForm = ({ order, onClose }) => {
  const [selectedItems, setSelectedItems] = useState({})
  const [reason, setReason] = useState('')
  const [reasonDescription, setReasonDescription] = useState('')
  const [refundMethod, setRefundMethod] = useState('original')
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const reasons = [
    { value: 'defective', label: 'Defective Product' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'damaged', label: 'Damaged During Delivery' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'expired', label: 'Expired Product' },
    { value: 'other', label: 'Other' }
  ]

  const handleItemToggle = (itemId, maxQuantity) => {
    setSelectedItems((prev) => {
      if (prev[itemId]) {
        const newState = { ...prev }
        delete newState[itemId]
        return newState
      }
      return { ...prev, [itemId]: maxQuantity }
    })
  }

  const handleQuantityChange = (itemId, quantity, maxQuantity) => {
    const qty = Math.min(Math.max(1, parseInt(quantity) || 1), maxQuantity)
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
    
    const imageUrls = files.map(file => URL.createObjectURL(file))
    setImages([...images, ...imageUrls])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const calculateRefund = () => {
    return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = order.items.find(i => i._id === itemId)
      return total + (item ? item.price * quantity : 0)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.keys(selectedItems).length === 0) {
      toast.error('Please select at least one item to return')
      return
    }

    if (!reason) {
      toast.error('Please select a reason for return')
      return
    }

    if (!reasonDescription || reasonDescription.trim().length < 10) {
      toast.error('Please provide a detailed description (minimum 10 characters)')
      return
    }

    setSubmitting(true)

    try {
      const returnItems = Object.entries(selectedItems).map(([itemId, quantity]) => ({
        orderItemId: itemId,
        quantity
      }))

      await api.post('/returns', {
        orderId: order._id,
        items: returnItems,
        reason,
        reasonDescription: reasonDescription.trim(),
        refundMethod,
        images: [] // In production, upload images to cloud storage first
      })

      toast.success('Return request submitted successfully')
      onClose()
    } catch (error) {
      console.error('Return request error:', error)
      toast.error(error?.response?.data?.message || 'Failed to submit return request')
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
          <h2 className="text-xl font-bold text-gray-900">Request Return/Refund</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Items to Return</h3>
            <div className="space-y-3">
              {order.items?.map((item) => {
                const isSelected = !!selectedItems[item._id]
                const selectedQuantity = selectedItems[item._id] || 0

                return (
                  <div
                    key={item._id}
                    className={`border rounded-lg p-4 ${
                      isSelected ? 'border-medical-600 bg-medical-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleItemToggle(item._id, item.quantity)}
                        className="mt-1 h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
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
                                    handleQuantityChange(item._id, e.target.value, item.quantity)
                                  }
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-sm text-gray-500">
                                  of {item.quantity}
                                </span>
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
              Reason for Return <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
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
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reasonDescription}
              onChange={(e) => setReasonDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
              placeholder="Please provide detailed information about why you want to return this item..."
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-gray-500">
              {reasonDescription.length}/1000 characters (minimum 10)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Method
            </label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
            >
              <option value="original">Original Payment Method</option>
              <option value="wallet">Wallet Credit</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
            />
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Maximum 5 images (for damaged/defective items)</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Estimated Refund Amount:</span>
              <span className="text-xl font-bold text-medical-600">
                {formatCurrency(calculateRefund())}
              </span>
            </div>
            {Object.keys(selectedItems).length === 0 && (
              <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle size={12} />
                Select items to see refund amount
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Object.keys(selectedItems).length === 0}
              className="flex-1 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReturnRequestForm


