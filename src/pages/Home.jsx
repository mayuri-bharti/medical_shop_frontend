import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Shield, Clock, Truck, Upload, FileText, Pill, Heart, Baby, Stethoscope, Leaf } from 'lucide-react'
import { getAccessToken } from '../lib/api'
import OtpModal from '../components/OtpModal'
import PromoBannerCarousel from '../components/PromoBannerCarousel'
import toast from 'react-hot-toast'

const Home = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)

  const features = [
    { icon: Shield, title: 'Authentic Medicines', description: '100% genuine medicines from verified suppliers' },
    { icon: Clock, title: '24/7 Availability', description: 'Order medicines anytime, anywhere' },
    { icon: Truck, title: 'Fast Delivery', description: 'Quick and safe delivery to your doorstep' }
  ]

  const categories = [
    { name: 'Prescription Medicines', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { name: 'OTC Medicines', icon: Pill, color: 'bg-green-100 text-green-600' },
    { name: 'HealthPlus Products', icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { name: 'Personal Care', icon: Shield, color: 'bg-purple-100 text-purple-600' },
    { name: 'Health Supplements', icon: Pill, color: 'bg-orange-100 text-orange-600' },
    { name: 'Baby Care', icon: Baby, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Medical Devices', icon: Stethoscope, color: 'bg-red-100 text-red-600' },
    { name: 'Ayurvedic Products', icon: Leaf, color: 'bg-emerald-100 text-emerald-600' }
  ]

  const mockSuggestions = [
    'Paracetamol',
    'Crocin Advance',
    'Dolo 650',
    'Calpol 500',
    'Cetirizine',
    'Azithromycin',
    'Amoxicillin',
    'Vitamin D3'
  ]


  const handleSearch = (value) => {
    setSearchQuery(value)
    if (value.length > 0) {
      setSuggestions(mockSuggestions.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      ))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
  }

  const handlePrescriptionUpload = async (e) => {
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
  }

  const performUpload = async (file) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('prescription', file)

      const getDefaultApiUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:4000'
        }
        return 'https://medical-shop-backend.vercel.app'
      }
      const API_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl()
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken')
      
      if (!token) {
        toast.error('Please login to upload prescription')
        setShowOtpModal(true)
        return
      }

      console.log('Uploading to:', `${API_URL}/api/prescriptions`)
      console.log('File:', file.name, file.type, file.size)

      const response = await fetch(
        `${API_URL}/api/prescriptions`,
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
  }

  const handleOtpSuccess = () => {
    // User authenticated, upload pending file
    if (pendingFile) {
      performUpload(pendingFile)
      setPendingFile(null)
    }
  }

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
      <div className="space-y-16">
      {/* Search Section */}
      <section className="bg-gradient-to-r from-medical-600 to-medical-700 rounded-2xl text-white p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Medicines
          </h2>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Search from thousands of authentic products
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search medicines, symptoms, or health concerns..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                className="w-full pl-14 pr-4 py-4 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
                  {suggestions.map((suggestion, index) => (
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

      {/* Promotional Banner Carousel */}
      <section className="mb-8">
        <PromoBannerCarousel />
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Why Choose HealthPlus?
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
