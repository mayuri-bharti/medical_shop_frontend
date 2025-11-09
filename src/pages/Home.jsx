import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Shield, Clock, Truck, Upload, FileText, Pill, Heart, Baby, Stethoscope, Leaf } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import OtpModal from '../components/OtpModal'
import PromoBannerCarousel from '../components/PromoBannerCarousel'
import CategoryBar from '../components/CategoryBar'
import toast from 'react-hot-toast'

const Home = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)
  const [isHeroVisible, setIsHeroVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsHeroVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Memoize static data
  const features = useMemo(() => [
    { icon: Shield, title: 'Authentic Medicines', description: '100% genuine medicines from verified suppliers' },
    { icon: Clock, title: '24/7 Availability', description: 'Order medicines anytime, anywhere' },
    { icon: Truck, title: 'Fast Delivery', description: 'Quick and safe delivery to your doorstep' }
  ], [])

  const categories = useMemo(() => [
    { name: 'Prescription Medicines', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { name: 'OTC Medicines', icon: Pill, color: 'bg-green-100 text-green-600' },
    { name: 'HealthPlus Products', icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { name: 'Personal Care', icon: Shield, color: 'bg-purple-100 text-purple-600' },
    { name: 'Health Supplements', icon: Pill, color: 'bg-orange-100 text-orange-600' },
    { name: 'Baby Care', icon: Baby, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Medical Devices', icon: Stethoscope, color: 'bg-red-100 text-red-600' },
    { name: 'Ayurvedic Products', icon: Leaf, color: 'bg-emerald-100 text-emerald-600' }
  ], [])

  const mockSuggestions = useMemo(() => [
    'Paracetamol',
    'Crocin Advance',
    'Dolo 650',
    'Calpol 500',
    'Cetirizine',
    'Azithromycin',
    'Amoxicillin',
    'Vitamin D3'
  ], [])

  // Memoize filtered suggestions
  const filteredSuggestions = useMemo(() => {
    if (searchQuery.length === 0) return []
    return mockSuggestions.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, mockSuggestions])

  const handleSearch = useCallback((value) => {
    setSearchQuery(value)
    if (value.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [])

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
  }, [searchQuery, navigate])

  const performUpload = useCallback(async (file) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('prescription', file)

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken')
      
      
      if (!token) {
        toast.error('Please login to upload prescription')
        setShowOtpModal(true)
        return
      }

      console.log('Uploading to:', `${API_URL}/prescriptions`)
      console.log('File:', file.name, file.type, file.size)

      const response = await fetch(
        `${API_URL}/prescriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
        
      )

      const data = await response.json()
      console.log('Upload response:', response.status, data)

      if (response.ok && data.success) {
        toast.success('Prescription uploaded successfully!')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        navigate('/prescriptions')
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload prescription. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [navigate])

  const handlePrescriptionUpload = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    // Check if user is authenticated
    const token = getAccessToken()
    
    if (!token) {
      // Store file and show OTP modal
      setPendingFile(file)
      setShowOtpModal(true)
      return
    }

    // User is authenticated, proceed with upload
    await performUpload(file)
  }, [performUpload])

  const handleOtpSuccess = useCallback(() => {
    // User authenticated, upload pending file
    if (pendingFile) {
      performUpload(pendingFile)
      setPendingFile(null)
    }
  }, [pendingFile, performUpload])

  return (
    <>
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false)
          setPendingFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }}
        onSuccess={handleOtpSuccess}
      />
      <div className="space-y-6 px-2 pb-16 md:px-8">
      {/* Search Section */}
      <section
        className="relative -mx-4 flex min-h-[260px] w-auto items-center justify-center overflow-hidden bg-[url('https://res.cloudinary.com/dcu2kdrva/image/upload/v1762580905/products/id17gpdmioelovzlflvi.png')] bg-cover bg-center text-white md:-mx-8 md:min-h-[320px]"
      >
        <div className="absolute inset-0 bg-black/35"></div>
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.65) 1px, transparent 0)`,
            backgroundSize: '38px 38px'
          }}
        ></div>

        <div
          className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-8 text-center transition-all duration-700 ease-out md:px-12 md:py-10 ${
            isHeroVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Find Your Medicines
          </h2>
          <p className="text-base md:text-lg mb-5 opacity-90">
            Search from thousands of authentic products
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl mx-auto mb-5">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/80" size={24} />
              <input
                type="text"
                placeholder="Search medicines, symptoms, or health concerns..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                className="w-full rounded-lg border border-white/50 bg-transparent pl-16 pr-4 py-2.5 text-white shadow-sm backdrop-blur-sm placeholder:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/80"
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        navigate(`/products?search=${encodeURIComponent(suggestion)}`)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-medical-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Shop Medicines</span>
              <ArrowRight size={20} />
            </Link>
            
            <label className="bg-white text-medical-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer">
              <Upload size={20} />
              <span>{uploading ? 'Uploading...' : 'Upload Prescription'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handlePrescriptionUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="-mx-4 md:-mx-8">
        <CategoryBar />
      </section>

      {/* Promotional Banner Carousel */}
      <section className="-mx-4 -mt-4 md:-mx-8 md:-mt-6">
        <PromoBannerCarousel />
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Why Choose MediShop?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="text-medical-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Link
                key={index}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg mx-auto mb-4 flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {category.name}
                </h3>
              </Link>
            )
          })}
        </div>
      </section>

      </div>
    </>
  )
}

export default Home
