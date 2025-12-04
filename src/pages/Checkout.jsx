import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { MapPin, CreditCard, Smartphone, Wallet, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAccessToken } from '../lib/api'
import { broadcastCartUpdate, normalizeCartData } from '../lib/cartEvents'
import { getGuestCart, clearGuestCart } from '../lib/guestCart'
import AddressList from '../components/checkout/AddressList'
import AddressModal from '../components/checkout/AddressModal'
import { api } from '../services/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [prescriptionFile, setPrescriptionFile] = useState(null)

  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressSaving, setAddressSaving] = useState(false)
  const authToken = getAccessToken()
  const [selectedProductIds, setSelectedProductIds] = useState(new Set())
  const initialSelectionRef = useRef(null)
  const getProductId = (product) => product?._id || product?.id || product

  useEffect(() => {
    if (location.state?.selectedCartItems?.length) {
      const ids = location.state.selectedCartItems
        .map((item) => getProductId(item?.product))
        .filter(Boolean)
      initialSelectionRef.current = new Set(ids)
      sessionStorage.setItem('checkoutSelectedProductIds', JSON.stringify(ids))
    } else if (!initialSelectionRef.current) {
      const stored = sessionStorage.getItem('checkoutSelectedProductIds')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            initialSelectionRef.current = new Set(parsed)
          }
        } catch {
          initialSelectionRef.current = null
        }
      }
    }
  }, [location.state])

  const handlePrescriptionChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setPrescriptionFile(file)
    }
  }

  const normalizeAddresses = (list = []) =>
    list.map((addr) => ({
      ...addr,
      _id: addr._id || addr.id,
      phoneNumber: addr.phoneNumber || addr.phone
    }))

  const fetchAddresses = useCallback(async () => {
    const token = getAccessToken()
    if (!token) return
    setAddressesLoading(true)
    try {
      const { data } = await api.get('/addresses')
      if (data?.success) {
        const normalized = normalizeAddresses(data.data || [])
        setAddresses(normalized)
        const defaultId = data.defaultAddressId
        if (!selectedAddressId && (defaultId || normalized[0]?._id)) {
          setSelectedAddressId(defaultId || normalized[0]._id)
        }
        return
      }
    } catch (error) {
      try {
        const fallback = await api.get('/orders/saved-addresses')
        if (fallback?.data?.success) {
          const normalized = normalizeAddresses(fallback.data.data || [])
          setAddresses(normalized)
          if (!selectedAddressId && normalized[0]?._id) {
            setSelectedAddressId(normalized[0]._id)
          }
        }
      } catch (err) {
        console.error('Failed to load addresses', err)
      }
    } finally {
      setAddressesLoading(false)
    }
  }, [selectedAddressId])

  const addProductToCart = useCallback(
    async (productId, quantity) => {
      try {
        const currentToken = getAccessToken()
        if (!currentToken) {
          toast.error('Please login to continue')
          navigate('/login')
          return
        }

        const response = await fetch(`${API_BASE}/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`
          },
          body: JSON.stringify({ productId, quantity })
        })

        const data = await response.json()
        if (!response.ok || data?.success === false) {
          let errorMessage = data?.message || 'Failed to add product to cart'
          if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            const errorMessages = data.errors.map(err => err.msg || err.message).filter(Boolean)
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join(', ')
            }
          }
          throw new Error(errorMessage)
        }
        toast.success('Product added to cart!')
        broadcastCartUpdate(data?.data || data)
      } catch (error) {
        console.error('Add to cart error:', error)
        const errorMsg = error?.response?.data?.message || 
                        error?.response?.data?.errors?.[0]?.msg ||
                        error?.message || 
                        'Failed to add product to cart'
        toast.error(errorMsg)
      }
    },
    [navigate]
  )

  const fetchCart = useCallback(async () => {
    try {
      const currentToken = getAccessToken()
      if (!currentToken) {
        // Check if there's a guest cart
        const guestCart = getGuestCart()
        if (guestCart.items.length > 0) {
          // Redirect to login with guest cart data
          toast.error('Please login to continue checkout')
          navigate('/login?redirect=' + encodeURIComponent('/checkout'))
          return
        } else {
          toast.error('Your cart is empty')
          navigate('/cart')
          return
        }
      }

      // Merge guest cart if exists
      const guestCart = getGuestCart()
      if (guestCart.items.length > 0) {
        try {
          // Merge guest cart items into user cart
          for (const item of guestCart.items) {
            const itemType = item.itemType || (item.productId ? 'product' : 'medicine')
            const productId = item.productId
            const medicineId = item.medicineId
            const quantity = item.quantity || 1

            const url = itemType === 'medicine' 
              ? `${API_BASE}/cart/items`
              : `${API_BASE}/cart/items`
            
            const body = itemType === 'medicine'
              ? { medicineId, quantity }
              : { productId, quantity }

            await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
              },
              body: JSON.stringify(body)
            })
          }
          // Clear guest cart after merging
          clearGuestCart()
          toast.success('Cart items merged successfully')
        } catch (mergeError) {
          console.error('Failed to merge guest cart:', mergeError)
          // Continue anyway - user can manually add items
        }
      }

      const response = await fetch(`${API_BASE}/cart`, {
        headers: {
        Authorization: `Bearer ${currentToken}`
        }
      })
      const data = await response.json()
      if (!response.ok || data?.success === false) {
        throw new Error(data.message || 'Failed to fetch cart')
      }
      const normalized = normalizeCartData(data?.data || data)
      setCart(normalized)
      broadcastCartUpdate(normalized)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      toast.error('Failed to load cart')
      if (error.message?.includes('401')) {
        navigate('/login?redirect=' + encodeURIComponent('/checkout'))
      }
    }
  }, [navigate])

  useEffect(() => {
    const productId = searchParams.get('productId')
    const quantity = parseInt(searchParams.get('quantity')) || 1
    if (productId) {
      addProductToCart(productId, quantity).then(() => {
        fetchCart()
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('productId')
        newParams.delete('quantity')
        navigate(`/checkout?${newParams.toString()}`, { replace: true })
      })
    } else {
      fetchCart()
    }
    fetchAddresses()
  }, [addProductToCart, fetchCart, fetchAddresses, navigate, searchParams])

  const selectedAddress = useMemo(
    () => addresses.find((addr) => addr._id === selectedAddressId),
    [addresses, selectedAddressId]
  )

  const selectedCartItems = useMemo(() => {
    if (!cart?.items?.length) return []
    if (!selectedProductIds.size) return cart.items
    const filtered = cart.items.filter((item) =>
      selectedProductIds.has(getProductId(item.product))
    )
    return filtered.length ? filtered : cart.items
  }, [cart, selectedProductIds])

  const selectedCartTotals = useMemo(() => {
    if (!cart) {
      return { subtotal: 0, taxes: 0, deliveryFee: 0, total: 0 }
    }
    const subtotal = selectedCartItems.reduce(
      (sum, item) =>
        sum + ((item?.price ?? item?.product?.price ?? 0) * (item?.quantity ?? 1)),
      0
    )
    const baseSubtotal = cart?.subtotal || 0
    const taxRatio = baseSubtotal > 0 ? (cart?.taxes || 0) / baseSubtotal : 0
    const taxes = Math.round(subtotal * taxRatio)
    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : cart?.deliveryFee || 0
    const total = subtotal + taxes + deliveryFee
    return { subtotal, taxes, deliveryFee, total }
  }, [cart, selectedCartItems])

  const handleDeliverHere = async (address) => {
    const currentToken = getAccessToken()
    if (!currentToken) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }

    const addressId = address._id || address.id
    if (!addressId) {
      toast.error('Invalid address. Please edit and save again.')
      return
    }

    try {
      await api.post(
        '/orders/select-address',
        { addressId },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      )
      setSelectedAddressId(addressId)
      toast.success('Delivering to this address')
    } catch (error) {
      console.error('Select address error', error)
      toast.error(error.response?.data?.message || 'Failed to select address')
    }
  }

  useEffect(() => {
    if (!cart?.items?.length) return
    setSelectedProductIds((prev) => {
      let baseSelection = null
      if (initialSelectionRef.current) {
        baseSelection = new Set()
        cart.items.forEach((item) => {
          const id = getProductId(item.product)
          if (!id) return
          if (!initialSelectionRef.current.size || initialSelectionRef.current.has(id)) {
            baseSelection.add(id)
          }
        })
        initialSelectionRef.current = null
      }

      if (baseSelection?.size) {
        return baseSelection
      }

      if (prev.size) {
        const preserved = new Set()
        cart.items.forEach((item) => {
          const id = getProductId(item.product)
          if (prev.has(id)) {
            preserved.add(id)
          }
        })
        if (preserved.size) {
          return preserved
        }
      }

      return new Set(cart.items.map((item) => getProductId(item.product)))
    })
  }, [cart])

  const handleDeleteAddress = async (address) => {
    const currentToken = getAccessToken()
    if (!currentToken) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }

    const addressId = String(address._id || address.id || '').trim()
    if (!addressId) {
      toast.error('Invalid address. Please try again.')
      return
    }

    const confirmed = window.confirm('Are you sure you want to delete this address?')
    if (!confirmed) return

    try {
      const response = await api.delete(`/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      })
      
      if (response?.data?.success) {
        toast.success('Address deleted successfully')
        // Clear selection if deleted address was selected
        if (selectedAddressId === addressId || selectedAddressId === address._id || selectedAddressId === address.id) {
          setSelectedAddressId('')
        }
        // Refresh addresses list
        await fetchAddresses()
      } else {
        throw new Error(response?.data?.message || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Delete address error', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete address'
      toast.error(errorMessage)
    }
  }

  const handleSaveAddress = async (formData) => {
    const currentToken = getAccessToken()
    if (!currentToken) {
      toast.error('Please login to continue')
      return
    }
    setAddressSaving(true)
    try {
      const payload = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        label: formData.label
      }
      if (formData._id) {
        await api.put(`/addresses/${formData._id}`, payload, {
          headers: { Authorization: `Bearer ${currentToken}` }
        })
      } else {
        await api.post('/addresses', payload, {
          headers: { Authorization: `Bearer ${currentToken}` }
        })
      }
      toast.success('Address saved')
      setAddressModalOpen(false)
      setEditingAddress(null)
      await fetchAddresses()
    } catch (error) {
      console.error('Save address error', error)
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setAddressSaving(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return
    const currentToken = getAccessToken()
    if (!currentToken) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }
    if (!selectedAddressId) {
      toast.error('Please choose a delivery address')
      return
    }
    try {
      const selectedItems = Array.isArray(selectedCartItems)
        ? selectedCartItems.map((item) => ({
            cartItemId: item?._id || item?.id,
            productId: item?.product?._id || item?.product?.id || item?.product,
            quantity: item?.quantity ?? 1
          }))
        : []
      if (!selectedItems.length) {
        toast.error('Please select at least one cart item')
        return
      }

      setLoading(true)
      let prescriptionId = null
      if (prescriptionFile) {
        try {
          const formData = new FormData()
          formData.append('prescription', prescriptionFile)
          const prescriptionResponse = await fetch(`${API_BASE}/prescriptions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${currentToken}`
            },
            body: formData
          })
          const prescriptionData = await prescriptionResponse.json()
          if (prescriptionResponse.ok && prescriptionData.success) {
            prescriptionId =
              prescriptionData.data?.prescriptionId || prescriptionData.data?._id
            toast.success('Prescription uploaded successfully')
          } else {
            toast.error('Failed to upload prescription, continuing...')
          }
        } catch (error) {
          console.error('Prescription upload error', error)
          toast.error('Failed to upload prescription')
        }
      }

      const payload = {
        paymentMethod,
        selectedItems,
        addressId: selectedAddressId,
        ...(selectedAddress && { shippingAddress: selectedAddress }),
        ...(prescriptionId && { prescriptionId })
      }

      const response = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!response.ok || data.success === false) {
        const validationMessage = Array.isArray(data?.errors)
          ? data.errors
              .map((err) => err?.msg || err?.message)
              .filter(Boolean)
              .join(', ')
          : ''
        const backendMessage =
          validationMessage ||
          data?.details ||
          data?.message ||
          data?.error ||
          'Order failed'
        throw new Error(backendMessage)
      }
      
      // Extract order data from response
      const orderData = data.data || data.order || data
      
      // Get selected address for fallback
      const currentSelectedAddress = addresses.find((addr) => addr._id === selectedAddressId) || selectedAddress
      
      // Format order data for OrderSuccess page
      const formattedOrder = {
        orderNumber: orderData.orderNumber || orderData._id?.slice(-8).toUpperCase() || '—',
        orderId: orderData._id || orderData.id || '—',
        status: orderData.status || 'processing',
        total: orderData.totalAmount || orderData.total || orderData.amount || 0,
        items: (orderData.items || []).map(item => ({
          name: item.name || item.product?.name || 'Item',
          qty: item.quantity || item.qty || 1,
          price: item.price || item.product?.price || 0
        })),
        address: {
          name: orderData.shippingAddress?.name || currentSelectedAddress?.name || '—',
          street: orderData.shippingAddress?.address || orderData.shippingAddress?.street || currentSelectedAddress?.address || '—',
          city: orderData.shippingAddress?.city || currentSelectedAddress?.city || '—',
          state: orderData.shippingAddress?.state || currentSelectedAddress?.state || '—',
          pincode: orderData.shippingAddress?.pincode || currentSelectedAddress?.pincode || '—',
          phone: orderData.shippingAddress?.phoneNumber || orderData.shippingAddress?.phone || currentSelectedAddress?.phoneNumber || '—'
        }
      }
      
      toast.success('Order placed successfully!')
      
      // Store order in sessionStorage as backup (in case of page refresh)
      sessionStorage.setItem('lastPlacedOrder', JSON.stringify(formattedOrder))
      
      // Navigate immediately with order data - no delay
      navigate('/order-success', {
        state: { order: formattedOrder },
        replace: true
      })
      
      // Clear session storage
      sessionStorage.removeItem('checkoutSelectedProductIds')
      sessionStorage.removeItem('orderSuccess')
      sessionStorage.removeItem('redirectAfterSuccess')
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (!cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-medical-600" />
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="rounded-lg bg-medical-600 px-4 py-2 text-white hover:bg-medical-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Login</p>
                <p className="text-lg font-semibold text-gray-900">
                  +91 {authToken ? '••••••••••' : 'Login Required'}
                </p>
              </div>
              <CheckCircle className="text-green-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Delivery Address
                </p>
                {selectedAddress && (
                  <p className="text-sm text-gray-600">
                    Deliver to {selectedAddress.name}, {selectedAddress.pincode}
                  </p>
                )}
              </div>
              {selectedAddress && (
                <button
                  type="button"
                  onClick={() => handleDeliverHere(selectedAddress)}
                  className="text-sm font-semibold text-orange-500"
                >
                  Deliver Here
                </button>
              )}
            </div>

            <AddressList
              addresses={addresses}
              selectedId={selectedAddressId}
              loading={addressesLoading}
              onSelect={(address) => setSelectedAddressId(address._id)}
              onDeliver={handleDeliverHere}
              onEdit={(address) => {
                setEditingAddress(address)
                setAddressModalOpen(true)
              }}
              onDelete={handleDeleteAddress}
              onAddNew={() => {
                setEditingAddress(null)
                setAddressModalOpen(true)
              }}
            />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <CreditCard className="text-medical-600" size={22} />
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Payment Method
                </p>
                <p className="text-base font-semibold text-gray-900">
                  Choose how you want to pay
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-200 p-4 hover:border-medical-500">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-medical-600"
                />
                <Smartphone size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when the order arrives</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-200 p-4 hover:border-medical-500">
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-medical-600"
                />
                <CreditCard size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Online Payment</p>
                  <p className="text-sm text-gray-600">Pay via card/UPI (demo)</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-200 p-4 hover:border-medical-500">
                <input
                  type="radio"
                  name="payment"
                  value="WALLET"
                  checked={paymentMethod === 'WALLET'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-medical-600"
                />
                <Wallet size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Wallet</p>
                  <p className="text-sm text-gray-600">Use wallet balance (demo)</p>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle className="text-medical-600" size={22} />
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Prescription
                </p>
                <p className="text-base font-semibold text-gray-900">
                  Upload prescription (if required)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handlePrescriptionChange}
                className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600"
              />
              {prescriptionFile && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {prescriptionFile.name}{' '}
                  <span className="text-gray-500">
                    ({(prescriptionFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || selectedCartItems.length === 0}
            className="w-full rounded-xl bg-medical-600 py-4 text-lg font-semibold text-white transition hover:bg-medical-700 disabled:opacity-70"
          >
            {loading
              ? 'Placing Order...'
              : `Place Order - ₹${selectedCartTotals.total.toLocaleString()}`}
          </button>
        </section>

        <aside className="space-y-4">
          <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-4 border-b pb-4">
              {selectedCartItems.length === 0 && (
                <p className="text-sm text-gray-500">No items selected for checkout.</p>
              )}
              {selectedCartItems.map((item) => (
                <div key={getProductId(item.product)} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={item.product?.image || '/placeholder-medicine.jpg'}
                      alt={item.product?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{selectedCartTotals.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {selectedCartTotals.deliveryFee === 0
                    ? 'Free'
                    : `₹${selectedCartTotals.deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span className="font-medium">₹{selectedCartTotals.taxes.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between border-t pt-3 text-lg font-semibold">
              <span>Total</span>
              <span>₹{selectedCartTotals.total.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false)
          setEditingAddress(null)
        }}
        initialData={editingAddress}
        onSave={handleSaveAddress}
        loading={addressSaving}
      />
    </div>
  )
}

export default Checkout

