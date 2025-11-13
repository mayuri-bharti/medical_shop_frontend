import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Send, Shield, ArrowRight, CheckCircle, AlertCircle, Lock, User, Eye, EyeOff } from 'lucide-react'
import { sendAdminOtp, verifyAdminOtp, setAdminToken, loginAdminWithPassword } from '../../lib/api'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const [loginMethod, setLoginMethod] = useState('otp') // 'otp' or 'password'
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)

    try {
      const response = await sendAdminOtp(phone)
      
      if (response.success) {
        toast.success('OTP sent successfully to admin phone!')
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
      const response = await verifyAdminOtp(phone, otp)
      
      if (response.success && response.data?.accessToken) {
        setAdminToken(response.data.accessToken)
        toast.success('Admin login successful!')
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP')
      toast.error(err.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!identifier || !password) {
      setError('Please enter your phone/email/username and password')
      return
    }

    setLoading(true)

    try {
      const response = await loginAdminWithPassword(identifier, password)
      
      if (response.success && response.data?.accessToken) {
        setAdminToken(response.data.accessToken)
        toast.success('Admin login successful!')
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials')
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-medical-600 to-medical-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Login to admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Login Method Toggle */}
          <div className="bg-gray-50 p-2 rounded-lg flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp')
                setStep('phone')
                setError('')
                setPhone('')
                setOtp('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-medical-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              OTP Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password')
                setError('')
                setIdentifier('')
                setPassword('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginMethod === 'password'
                  ? 'bg-medical-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Password Login
            </button>
          </div>

          {loginMethod === 'otp' ? (
            step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9022896203"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-lg"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send you an OTP ~ verify your admin number
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone || phone.length < 10}
                  className="w-full bg-medical-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
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
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setError('')
                  }}
                  className="text-medical-600 hover:text-medical-700 text-sm font-medium flex items-center space-x-1"
                >
                  <ArrowRight className="rotate-180" size={16} />
                  <span>Change phone number</span>
                </button>

                <div className="bg-medical-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">OTP sent to</p>
                  <p className="text-lg font-semibold text-gray-900">{phone}</p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-medical-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Verify OTP</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone, Email, Username, or Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter phone, email, username, or name"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-lg"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-lg"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !identifier || !password}
                className="w-full bg-medical-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 flex items-center justify-center space-x-1">
              <Shield size={14} />
              <span>Secure & encrypted</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
