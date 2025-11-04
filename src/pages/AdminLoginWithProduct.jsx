import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Send, Shield, CheckCircle, AlertCircle, Save, Lock } from 'lucide-react'
import { sendOtp, verifyOtp, setAccessToken, getUserRole } from '../lib/api'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const AdminLoginWithProduct = () => {
  const [step, setStep] = useState('phone') // 'phone', 'otp', or 'loggedIn'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [productLoading, setProductLoading] = useState(false)
  const navigate = useNavigate()
  
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    stock: ''
  })

  const categories = [
    'Prescription Medicines',
    'OTC Medicines',
    'Wellness Products',
    'Personal Care',
    'Health Supplements',
    'Baby Care',
    'Medical Devices',
    'Ayurvedic Products'
  ]

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)

    try {
      const response = await sendOtp(phone)
      
      if (response.success) {
        toast.success('OTP sent successfully!')
        setStep('otp')
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const response = await verifyOtp(phone, otp)
      
      if (response.success) {
        // Set token first
        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken)
        }
        
        // Get user role from response data first (most reliable)
        // Then fallback to token decoding if needed
        let userRole = response.data?.user?.role
        
        // If role not in response, try to get from token
        if (!userRole) {
          // Small delay to ensure token is set in storage
          await new Promise(resolve => setTimeout(resolve, 100))
          userRole = getUserRole()
        }
        
        console.log('User role from login:', userRole)
        console.log('User data:', response.data?.user)
        
        // Verify admin role
        if (userRole !== 'ADMIN') {
          toast.error('This account does not have admin privileges. Redirecting to user dashboard...')
          // Redirect regular users to their dashboard
          setTimeout(() => {
            navigate('/user/dashboard')
          }, 1500)
          return
        }
        
        toast.success('Admin login successful!')
        setStep('loggedIn')
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP')
      toast.error(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (e) => {
    const { name, value } = e.target
    setProductData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setProductLoading(true)

    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.description || !productData.category || !productData.stock) {
        toast.error('Please fill in all required fields')
        setProductLoading(false)
        return
      }

      // Prepare payload
      const payload = {
        name: productData.name.trim(),
        price: parseFloat(productData.price),
        mrp: parseFloat(productData.price) * 1.2, // Set MRP 20% higher
        description: productData.description.trim(),
        category: productData.category,
        images: productData.image ? [productData.image.trim()] : [],
        stock: parseInt(productData.stock),
        brand: 'Generic', // Default brand
        sku: `SKU-${Date.now()}` // Auto-generated SKU
      }

      const response = await api.post('/products', payload)

      if (response.data && (response.status === 201 || response.data.success)) {
        toast.success('Product added successfully!')
        // Reset form
        setProductData({
          name: '',
          price: '',
          description: '',
          category: '',
          image: '',
          stock: ''
        })
        // Optionally navigate to products page
        // navigate('/admin/dashboard/products')
      } else {
        throw new Error('Failed to add product')
      }
    } catch (error) {
      console.error('Add product error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to add product')
    } finally {
      setProductLoading(false)
    }
  }

  const handleResetProduct = () => {
    setProductData({
      name: '',
      price: '',
      description: '',
      category: '',
      image: '',
      stock: ''
    })
  }

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-medical-50 to-teal-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-medical-600 to-medical-700 rounded-2xl mb-4 shadow-lg">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600 text-lg">Medical Shop Administration</p>
          <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <Lock size={14} />
            <span>Admin Access Only</span>
          </div>
        </div>

        {step === 'phone' || step === 'otp' ? (
          /* Login Card */
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-medical-600 to-medical-700 p-8 text-white">
              <h2 className="text-2xl font-bold mb-1">
                {step === 'phone' ? 'Admin Login' : 'Verify OTP'}
              </h2>
              <p className="text-medical-100">
                {step === 'phone' 
                  ? 'Enter admin phone number to continue' 
                  : `Enter OTP sent to +91 ${phone}`}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-8">
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="text-gray-400" size={20} />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit phone number"
                        className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                        disabled={loading}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="text-red-600" size={20} />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Send OTP Button */}
                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-medical-600 hover:bg-medical-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="block w-full text-center text-4xl tracking-widest py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent font-bold"
                      disabled={loading}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="text-red-600" size={20} />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-medical-600 hover:bg-medical-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        <span>Verify & Login</span>
                      </>
                    )}
                  </button>

                  {/* Change Number Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone')
                      setOtp('')
                      setError('')
                    }}
                    className="w-full text-medical-600 hover:text-medical-700 text-sm font-medium transition-colors"
                  >
                    ← Change phone number
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Add Product Form - After Login */
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-green-800 font-medium">Admin logged in successfully!</p>
              </div>
              <button
                onClick={handleGoToDashboard}
                className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors text-sm"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Add Product Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-medical-600 to-medical-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">Add Product</h2>
                <p className="text-medical-100">Add a new product to your medical shop</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleAddProduct} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleProductChange}
                      required
                      placeholder="Enter product name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleProductChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={productData.stock}
                        onChange={handleProductChange}
                        required
                        min="0"
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={productData.category}
                      onChange={handleProductChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleProductChange}
                      required
                      rows={4}
                      placeholder="Enter product description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={productData.image}
                      onChange={handleProductChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                    {productData.image && (
                      <div className="mt-3">
                        <img
                          src={productData.image}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23E5E7EB" width="200" height="200"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid Image%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleResetProduct}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={productLoading}
                      className="flex items-center space-x-2 px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {productLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          <span>Add Product</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 mb-2">
            Regular user? <a href="/login" className="text-medical-600 hover:underline font-medium">Login here</a>
          </p>
          <p className="text-xs text-gray-500">
            Note: If you're not an admin, you'll be redirected to your user dashboard after login.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginWithProduct

