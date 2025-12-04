import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate } from '../lib/cartEvents'

const MedicineDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    let active = true
    const fetchMedicine = async () => {
      try {
        const resp = await api.get(`/allmedecine/${id}`)
        if (!active) return
        if (resp?.data?.success) {
          setMedicine(resp.data.medicine)
        } else {
          throw new Error(resp?.data?.message || 'Failed to load medicine')
        }
      } catch (e) {
        if (!active) return
        setError(e.message || 'Failed to load medicine')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchMedicine()
    return () => { active = false }
  }, [id])

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
  }, [medicine])

  const mainImage = useMemo(() => {
    return medicine?.image || medicine?.images?.[0] || '/placeholder-medicine.jpg'
  }, [medicine])

  const handleAddToCart = useCallback(async () => {
    const token = getAccessToken()
    setAdding(true)
    
    try {
      if (!token) {
        // User not logged in - use guest cart
        const { addToGuestCart, getGuestCartItemCount } = await import('../lib/guestCart')
        const price = computedPrice || 0
        const image = medicine?.images?.[0] || medicine?.image || ''
        
        if (medicine?.productRef) {
          // Add as product
          const guestCart = addToGuestCart({
            itemType: 'product',
            productId: medicine.productRef,
            quantity: qty,
            price: price,
            name: medicine?.name || '',
            image: image
          })
          toast.success('Added to cart')
          broadcastCartUpdate(guestCart, getGuestCartItemCount())
        } else {
          // Add as medicine
          const guestCart = addToGuestCart({
            itemType: 'medicine',
            medicineId: id,
            quantity: qty,
            price: price,
            name: medicine?.name || '',
            image: image
          })
          toast.success('Added to cart')
          broadcastCartUpdate(guestCart, getGuestCartItemCount())
        }
      } else {
        // User logged in - use API
        if (medicine?.productRef) {
          const resp = await api.post('/cart/items', {
            productId: medicine.productRef,
            quantity: qty
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (resp?.data?.success === false) {
            let errorMessage = resp?.data?.message || 'Failed to add to cart'
            if (resp?.data?.errors && Array.isArray(resp.data.errors) && resp.data.errors.length > 0) {
              const errorMessages = resp.data.errors.map(err => err.msg || err.message).filter(Boolean)
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join(', ')
              }
            }
            throw new Error(errorMessage)
          }
          toast.success('Added to cart')
          broadcastCartUpdate(resp?.data)
        } else {
          const resp = await api.post('/cart/items', {
            itemType: 'medicine',
            medicineId: id,
            quantity: qty
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (resp?.data?.success === false) {
            let errorMessage = resp?.data?.message || 'Failed to add to cart'
            if (resp?.data?.errors && Array.isArray(resp.data.errors) && resp.data.errors.length > 0) {
              const errorMessages = resp.data.errors.map(err => err.msg || err.message).filter(Boolean)
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join(', ')
              }
            }
            throw new Error(errorMessage)
          }
          toast.success('Added to cart')
          broadcastCartUpdate(resp?.data)
        }
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 
                      e?.response?.data?.errors?.[0]?.msg ||
                      e?.message || 
                      'Failed to add to cart'
      toast.error(errorMsg)
    } finally {
      setAdding(false)
    }
  }, [id, qty, medicine, computedPrice])

  const handleBuyNow = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      const returnUrl = encodeURIComponent(`/medicine/${id}`)
      navigate(`/login?redirect=${returnUrl}`)
      return
    }
    try {
      setBuying(true)
      if (medicine?.productRef) {
        const resp = await api.post('/cart/items', { productId: medicine.productRef, quantity: qty }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        broadcastCartUpdate(resp?.data)
        navigate('/checkout')
      } else {
        const resp = await api.post('/cart/items', {
          itemType: 'medicine',
          medicineId: id,
          quantity: qty
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        broadcastCartUpdate(resp?.data)
        navigate('/checkout')
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to proceed')
    } finally {
      setBuying(false)
    }
  }, [id, qty, navigate, medicine?.productRef])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error || !medicine) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Medicine not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <img src={mainImage} alt={medicine.name} className="w-full h-72 object-contain" />
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{medicine.name}</h1>
          <p className="text-sm text-gray-600">{medicine.category || 'Medicine'}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-gray-900">₹{price}</span>
            {medicine?.mrp && Number(medicine.mrp) > price && (
              <span className="text-sm text-gray-500 line-through">₹{medicine.mrp}</span>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            {medicine?.salt_composition && <p><span className="font-medium">Salt Composition:</span> {medicine.salt_composition}</p>}
            {medicine?.uses && <p><span className="font-medium">Uses:</span> {Array.isArray(medicine.uses) ? medicine.uses.join(', ') : medicine.uses}</p>}
            {medicine?.side_effects && <p><span className="font-medium">Side Effects:</span> {Array.isArray(medicine.side_effects) ? medicine.side_effects.join(', ') : medicine.side_effects}</p>}
            {medicine?.description && <p className="text-gray-600">{medicine.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Qty</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={buying}
              className="px-4 py-2 border border-medical-300 text-medical-700 rounded-lg hover:bg-medical-50 disabled:opacity-50"
            >
              {buying ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicineDetails


