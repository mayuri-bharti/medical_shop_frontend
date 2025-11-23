import { memo, useMemo, useCallback, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate } from '../lib/cartEvents'
import toast from 'react-hot-toast'

const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="220"%3E%3Crect width="400" height="220" fill="%23F3F4F6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="sans-serif" font-size="18"%3EMedicine%3C/text%3E%3C/svg%3E'

const MedicineCard = memo(({ medicine, onClick }) => {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

  const imageSrc = useMemo(() => {
    if (medicine?.images?.length) {
      return medicine.images[0]
    }
    if (medicine?.image) {
      return medicine.image
    }
    return fallbackImage
  }, [medicine?.images, medicine?.image])

  const handleClick = useCallback(() => {
    if (typeof onClick === 'function') {
      onClick(medicine)
      return
    }
    // Default navigation: go to medicine details page
    if (medicine?._id) {
      navigate(`/medicine/${medicine._id}`)
    }
  }, [medicine, onClick, navigate])

  const price = useMemo(() => {
    const raw = medicine?.price ?? medicine?.mrp ?? medicine?.['price(₹)'] ?? 0
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
      const sanitized = raw.replace(/[₹$,]/g, '').replace(/\s*(per|\/).*/i, '').trim()
      const parsed = Number(sanitized)
      return Number.isFinite(parsed) ? parsed : 0
    }
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }, [medicine?.price, medicine?.mrp, medicine?.['price(₹)']])

  const handleAddToCart = useCallback(async (event) => {
    event.stopPropagation()

    // If mapped to a product, add that product; otherwise add medicine directly

    const token = getAccessToken()
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent('/all-medicine')}`)
      return
    }

    setAdding(true)
    try {
      const payload = medicine?.productRef
        ? { productId: medicine.productRef, quantity: 1 }
        : { itemType: 'medicine', medicineId: medicine?._id, quantity: 1 }

      const response = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!response.ok || data?.success === false) {
        // Extract detailed error message from validation errors
        let errorMessage = data?.message || 'Failed to add to cart'
        if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const errorMessages = data.errors.map(err => err.msg || err.message).filter(Boolean)
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ')
          }
        }
        throw new Error(errorMessage)
      }
      toast.success('Added to cart')
      broadcastCartUpdate(data?.data || data)
    } catch (err) {
      // Show user-friendly error message
      const errorMsg = err?.response?.data?.message || 
                      err?.response?.data?.errors?.[0]?.msg ||
                      err?.message || 
                      'Failed to add to cart'
      toast.error(errorMsg)
    } finally {
      setAdding(false)
    }
  }, [API_BASE, medicine?.productRef, medicine?.name, navigate])

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleClick()
        }
      }}
      className="group flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-medical-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gray-50">
        <img
          src={imageSrc}
          alt={medicine?.name || 'Medicine'}
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = fallbackImage
          }}
        />
        {medicine?.tags?.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {medicine.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-medical-100 px-2 py-0.5 text-[10px] font-medium text-medical-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-medical-600">
          {medicine?.category || 'Medicine'}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">
          {medicine?.name || 'Unnamed Medicine'}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs text-gray-600">
          {medicine?.description || 'No description available for this medicine.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              ₹{price.toLocaleString()}
            </span>
            {medicine?.mrp && medicine.mrp > price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(medicine.mrp).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="px-3 py-1.5 rounded-md bg-medical-600 hover:bg-medical-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
            <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-medical-600 transition-colors duration-200 group-hover:text-medical-700">
              View Details
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

MedicineCard.displayName = 'MedicineCard'

export default MedicineCard









