import { useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Save, Loader2 } from 'lucide-react'
import { useQuery, useQueryClient } from 'react-query'
import { getAdminHomepageBanner, saveHomepageBanner, updateHomepageBanner } from '../../lib/api'
import toast from 'react-hot-toast'

const ManageHomepageBanner = ({ bannerType = 'banner1' }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    ctaLink: '',
    bannerImage: null,
    bannerImageUrl: '',
    cashbackPartnerLogos: [],
    cashbackPartnerLogosUrls: [],
    isActive: true,
    bannerType
  })
  const [preview, setPreview] = useState(null)
  const [logoPreviews, setLogoPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [imageSource, setImageSource] = useState('upload') // 'upload' or 'url'
  const [logoImageSource, setLogoImageSource] = useState('upload') // 'upload' or 'url'

  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery(
    [`admin-homepage-banner`, bannerType],
    async () => {
      const response = await getAdminHomepageBanner(bannerType)
      if (response.success) {
        return response.data
      }
      return null
    },
    {
      refetchOnWindowFocus: true,
      staleTime: 10000
    }
  )

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        ctaLink: data.ctaLink || '',
        bannerImage: null,
        bannerImageUrl: data.bannerImage || '',
        cashbackPartnerLogos: [],
        cashbackPartnerLogosUrls: data.cashbackPartnerLogos || [],
        isActive: data.isActive !== false
      })
      setPreview(data.bannerImage || null)
      setLogoPreviews(data.cashbackPartnerLogos || [])
      setImageSource(data.bannerImage ? 'url' : 'upload')
    }
  }, [data])

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setFormData({ ...formData, bannerImage: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 10) {
      toast.error('Maximum 10 logos allowed')
      return
    }
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} size should be less than 2MB`)
        return false
      }
      return true
    })

    setFormData({ ...formData, cashbackPartnerLogos: [...formData.cashbackPartnerLogos, ...validFiles] })
    
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeLogo = (index) => {
    const newLogos = [...formData.cashbackPartnerLogos]
    const newPreviews = [...logoPreviews]
    newLogos.splice(index, 1)
    newPreviews.splice(index, 1)
    setFormData({ ...formData, cashbackPartnerLogos: newLogos })
    setLogoPreviews(newPreviews)
  }

  const removeLogoUrl = (index) => {
    const newUrls = [...formData.cashbackPartnerLogosUrls]
    newUrls.splice(index, 1)
    setFormData({ ...formData, cashbackPartnerLogosUrls: newUrls })
    setLogoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const addLogoUrl = () => {
    const url = prompt('Enter logo image URL:')
    if (url && url.trim()) {
      try {
        new URL(url.trim())
        setFormData({
          ...formData,
          cashbackPartnerLogosUrls: [...formData.cashbackPartnerLogosUrls, url.trim()]
        })
        setLogoPreviews(prev => [...prev, url.trim()])
      } catch {
        toast.error('Invalid URL format')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!formData.ctaLink.trim()) {
      toast.error('CTA link is required')
      return
    }

    // Validate CTA link
    const link = formData.ctaLink.trim()
    const isExternalUrl = link.startsWith('http://') || link.startsWith('https://')
    const isInternalRoute = link.startsWith('/')
    
    if (!isExternalUrl && !isInternalRoute) {
      toast.error('Please enter a valid URL or internal route')
      return
    }

    setUploading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('subtitle', formData.subtitle.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('ctaLink', formData.ctaLink.trim())
      formDataToSend.append('isActive', formData.isActive)
      formDataToSend.append('bannerType', bannerType)

      // Handle banner image
      if (imageSource === 'upload' && formData.bannerImage) {
        formDataToSend.append('bannerImage', formData.bannerImage)
      } else if (imageSource === 'url' && formData.bannerImageUrl.trim()) {
        formDataToSend.append('bannerImageUrl', formData.bannerImageUrl.trim())
      } else if (!data && !formData.bannerImage && !formData.bannerImageUrl.trim()) {
        toast.error('Banner image is required')
        setUploading(false)
        return
      }

      // Handle cashback partner logos
      if (logoImageSource === 'upload' && formData.cashbackPartnerLogos.length > 0) {
        formData.cashbackPartnerLogos.forEach(logo => {
          formDataToSend.append('cashbackPartnerLogos', logo)
        })
      }
      
      if (formData.cashbackPartnerLogosUrls.length > 0) {
        formDataToSend.append('cashbackPartnerLogosUrls', JSON.stringify(formData.cashbackPartnerLogosUrls))
      }

      let response
      if (data && data._id) {
        response = await updateHomepageBanner(data._id, formDataToSend)
        if (response.success) {
          toast.success('Homepage banner updated successfully!')
        }
      } else {
        response = await saveHomepageBanner(formDataToSend)
        if (response.success) {
          toast.success('Homepage banner created successfully!')
        }
      }

      if (response.success) {
        queryClient.invalidateQueries(['admin-homepage-banner', bannerType])
        queryClient.invalidateQueries(['homepage-banner', bannerType])
        queryClient.invalidateQueries('homepage-banner')
        refetch()
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${data ? 'update' : 'create'} homepage banner`)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-apollo-700" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Homepage Banner {bannerType === 'banner2' ? '2' : '1'}</h1>
        <p className="text-gray-600 mt-2">Update the {bannerType === 'banner2' ? 'second' : 'main'} promotional banner displayed on the homepage</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="imageSource"
                checked={imageSource === 'upload'}
                onChange={() => setImageSource('upload')}
              />
              Upload Image
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="imageSource"
                checked={imageSource === 'url'}
                onChange={() => setImageSource('url')}
              />
              Image URL
            </label>
          </div>

          {imageSource === 'upload' ? (
            <div>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                {preview ? (
                  <div className="relative w-full h-full">
                    <img src={preview} alt="Banner preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null)
                        setFormData({ ...formData, bannerImage: null })
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleBannerImageChange}
                    />
                  </div>
                )}
              </label>
              {!preview && (
                <input
                  type="file"
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-apollo-50 file:text-apollo-700 hover:file:bg-apollo-100"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleBannerImageChange}
                />
              )}
            </div>
          ) : (
            <input
              type="url"
              value={formData.bannerImageUrl}
              onChange={(e) => {
                setFormData({ ...formData, bannerImageUrl: e.target.value })
                setPreview(e.target.value)
              }}
              placeholder="https://example.com/banner.jpg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-apollo-500 focus:ring-apollo-500"
            />
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Himalaya Products - Ayurvedic Wellness"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-apollo-500 focus:ring-apollo-500"
            required
          />
        </div>

        {/* Subtitle / Offer Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle / Offer Text
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g., Get 7.5% Cashback"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-apollo-500 focus:ring-apollo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fancy Description Text
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter a fancy description for the banner..."
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-apollo-500 focus:ring-apollo-500"
          />
        </div>

        {/* CTA Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTA Link (Shop Now URL) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.ctaLink}
            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
            placeholder="/products?brand=Himalaya or https://example.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-apollo-500 focus:ring-apollo-500"
            required
          />
        </div>

        {/* Cashback Partner Logos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cashback Partner Logos (Optional)
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="logoImageSource"
                checked={logoImageSource === 'upload'}
                onChange={() => setLogoImageSource('upload')}
              />
              Upload Images
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="logoImageSource"
                checked={logoImageSource === 'url'}
                onChange={() => setLogoImageSource('url')}
              />
              Image URLs
            </label>
          </div>

          {logoImageSource === 'upload' ? (
            <div>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleLogoImageChange}
                className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-apollo-50 file:text-apollo-700 hover:file:bg-apollo-100"
              />
              <div className="grid grid-cols-4 gap-4">
                {logoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Logo ${index + 1}`} className="w-full h-24 object-contain border rounded" />
                    <button
                      type="button"
                      onClick={() => removeLogo(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={addLogoUrl}
                className="mb-4 px-4 py-2 bg-apollo-50 text-apollo-700 rounded-md hover:bg-apollo-100"
              >
                + Add Logo URL
              </button>
              <div className="grid grid-cols-4 gap-4">
                {logoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Logo ${index + 1}`} className="w-full h-24 object-contain border rounded" />
                    <button
                      type="button"
                      onClick={() => removeLogoUrl(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300 text-apollo-600 focus:ring-apollo-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active (Show on homepage)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-2 bg-apollo-700 text-white rounded-md hover:bg-apollo-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {data ? 'Update Banner' : 'Create Banner'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ManageHomepageBanner

