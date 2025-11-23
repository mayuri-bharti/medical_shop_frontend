import { useEffect, useState } from 'react'
import { X, MapPin, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const emptyForm = {
  _id: null,
  name: '',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  label: 'Home'
}

const labels = ['Home', 'Work', 'Other']

const AddressModal = ({
  open,
  onClose,
  initialData,
  onSave,
  loading = false
}) => {
  const { t } = useTranslation()
  const [form, setForm] = useState(emptyForm)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : emptyForm)
      setLocationError(null)
    }
  }, [open, initialData])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave?.(form)
  }

  // Reverse geocoding function to convert coordinates to address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API with better parameters for Indian addresses
      // Added zoom=18 for better accuracy and countrycodes=in to prioritize India
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=in&accept-language=en`,
        {
          headers: {
            'User-Agent': 'HealthPlus-Medical-Shop/1.0', // Required by Nominatim
            'Accept-Language': 'en-IN,en'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }

      const data = await response.json()
      
      if (!data || !data.address) {
        throw new Error('Address not found')
      }

      const addr = data.address
      
      // Better address mapping for Indian addresses
      // Build street address with priority order
      const streetParts = []
      
      // Add house number/building name first
      if (addr.house_number) {
        streetParts.push(addr.house_number)
      } else if (addr.house) {
        streetParts.push(addr.house)
      }
      
      // Add building name if available
      if (addr.building && !streetParts.includes(addr.building)) {
        streetParts.push(addr.building)
      }
      
      // Add road/street name
      if (addr.road) {
        streetParts.push(addr.road)
      } else if (addr.street) {
        streetParts.push(addr.street)
      } else if (addr.pedestrian) {
        streetParts.push(addr.pedestrian)
      }
      
      // Add locality/suburb
      if (addr.suburb) {
        streetParts.push(addr.suburb)
      } else if (addr.neighbourhood) {
        streetParts.push(addr.neighbourhood)
      } else if (addr.locality) {
        streetParts.push(addr.locality)
      }
      
      // Build complete street address
      const streetAddress = streetParts.filter(Boolean).join(', ') || 
                           data.display_name.split(',').slice(0, 2).join(', ').trim() || 
                           ''
      
      // City mapping with priority for Indian cities
      const city = addr.city || 
                   addr.town || 
                   addr.city_district ||
                   addr.municipality ||
                   addr.village || 
                   addr.county || 
                   ''
      
      // State mapping
      const state = addr.state || 
                    addr.region || 
                    addr.province ||
                    ''
      
      // Pincode/postcode
      const pincode = addr.postcode || 
                      addr.postal_code || 
                      ''
      
      return {
        address: streetAddress,
        city: city,
        state: state,
        pincode: pincode
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw error
    }
  }

  // Get user's current location
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError(t('address.locationNotSupported') || 'Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    setLocationError(null)

      navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords
          
          // Log coordinates for debugging
          console.log('📍 Location coordinates:', { latitude, longitude, accuracy: `${accuracy}m` })
          
          // Get address from coordinates
          const addressData = await reverseGeocode(latitude, longitude)
          
          // Log fetched address data for debugging
          console.log('🏠 Fetched address data:', addressData)
          
          // Update form with fetched address
          // Only update if we got valid data
          if (addressData.address || addressData.city || addressData.state) {
            setForm((prev) => ({
              ...prev,
              address: addressData.address || prev.address,
              city: addressData.city || prev.city,
              state: addressData.state || prev.state,
              pincode: addressData.pincode || prev.pincode
            }))
            
            // Show success message if address was found
            if (addressData.address && addressData.city) {
              setLocationError(null)
              // Show info message that user should verify
              console.log('✅ Address filled. Please verify the details.')
            } else {
              setLocationError(t('address.locationIncomplete') || 'Address found but incomplete. Please fill the remaining fields manually.')
            }
          } else {
            setLocationError(t('address.locationIncomplete') || 'Address found but incomplete. Please fill the remaining fields manually.')
          }
        } catch (error) {
          console.error('Error getting address:', error)
          setLocationError(t('address.locationFetchError') || 'Failed to fetch address. Please enter manually.')
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = t('address.locationError') || 'Failed to get your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('address.locationPermissionDenied') || 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('address.locationUnavailable') || 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = t('address.locationTimeout') || 'Location request timed out. Please try again.'
            break
        }
        
        setLocationError(errorMessage)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {form._id ? t('address.editAddress') || 'Edit Address' : t('address.addNewAddress') || 'Add New Address'}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {form._id ? t('address.updateDeliveryAddress') || 'Update delivery address' : t('address.saveDeliveryAddress') || 'Save delivery address'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('address.fullName') || 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={handleChange('name')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('address.phoneNumber') || 'Phone Number'}
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                value={form.phoneNumber}
                onChange={(e) =>
                  handleChange('phoneNumber')({
                    target: { value: e.target.value.replace(/\D/g, '').slice(0, 10) }
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                {t('address.streetAddress') || 'Street Address'}
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="flex items-center gap-2 rounded-lg border border-orange-500 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {gettingLocation ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{t('address.gettingLocation') || 'Getting Location...'}</span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    <span>{t('address.useMyLocation') || 'Use My Location'}</span>
                  </>
                )}
              </button>
            </div>
            {locationError && (
              <div className="mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-600">{locationError}</p>
              </div>
            )}
            {!locationError && form.address && form.city && (
              <div className="mb-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-600">
                  {t('address.locationVerify') || '📍 Address filled from your location. Please verify and edit if needed.'}
                </p>
              </div>
            )}
            <input
              type="text"
              required
              value={form.address}
              onChange={handleChange('address')}
              placeholder={t('address.streetAddressPlaceholder') || 'Enter street address'}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('address.city') || 'City'}
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={handleChange('city')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('address.state') || 'State'}
              </label>
              <input
                type="text"
                required
                value={form.state}
                onChange={handleChange('state')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('address.pincode') || 'Pincode'}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) =>
                  handleChange('pincode')({
                    target: { value: e.target.value.replace(/\D/g, '').slice(0, 6) }
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('address.label') || 'Label'}
              </label>
              <div className="mt-2 flex gap-3">
                {labels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, label }))
                    }
                    className={`rounded-full border px-4 py-1 text-sm font-medium transition ${
                      form.label === label
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-300 text-gray-600 hover:border-orange-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading || gettingLocation}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-70"
            >
              {loading ? (t('address.saving') || 'Saving...') : (t('address.saveAddress') || 'Save Address')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddressModal

