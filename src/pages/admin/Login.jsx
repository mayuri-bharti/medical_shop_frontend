import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Send, Shield, ArrowRight, CheckCircle, AlertCircle, Lock, User, Eye, EyeOff, X } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-3xl w-full">
        {/* Split Modal Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[450px]">
          {/* Left Section - Green Branding Panel */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 md:w-2/5 p-6 md:p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            {/* Logo and Branding */}
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-xl">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                  <Shield className="text-primary-600" size={28} />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-1">HealthPlus</h1>
              <p className="text-white/90 text-sm mb-1">ADMIN PORTAL</p>
              <p className="text-base font-light mt-4 text-white/95">Secure Access</p>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="md:w-3/5 p-6 md:p-8 flex flex-col relative">
            {/* Close Button */}
            <button
              onClick={() => navigate('/')}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome</h2>
              <p className="text-base font-semibold text-gray-700">
                Login to admin dashboard
              </p>
            </div>

            {/* Login Method Toggle */}
            <div className="bg-gray-50 p-1.5 rounded-lg flex gap-1.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp')
                  setStep('phone')
                  setError('')
                  setPhone('')
                  setOtp('')
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  loginMethod === 'otp'
                    ? 'bg-primary-500 text-white shadow-md'
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
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  loginMethod === 'password'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Password Login
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1">

          {loginMethod === 'otp' ? (
            step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-2">
                    Admin Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit admin phone number"
                    className="block w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base bg-gray-50 hover:bg-white transition-colors"
                    required
                    disabled={loading}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    We'll send you an OTP ~ verify your admin number
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone || phone.length < 10}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gray-300 hover:bg-primary-500 text-gray-700 hover:text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND OTP</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setError('')
                  }}
                  className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center space-x-1 mb-3"
                >
                  <ArrowRight className="rotate-180" size={14} />
                  <span>Change phone number</span>
                </button>

                <div className="bg-primary-50 rounded-lg p-3 text-center border border-primary-200">
                  <p className="text-xs text-gray-600 mb-1">OTP sent to</p>
                  <p className="text-base font-bold text-primary-700">{phone}</p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-xs font-semibold text-gray-700 mb-2">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="block w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-3xl font-bold tracking-widest bg-gray-50"
                    maxLength={6}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gray-300 hover:bg-primary-500 text-gray-700 hover:text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>VERIFY OTP</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-xs font-semibold text-gray-700 mb-2">
                  Phone, Email, Username, or Name
                </label>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone, email, username, or name"
                  className="block w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base bg-gray-50 hover:bg-white transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full px-3 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base bg-gray-50 hover:bg-white transition-colors"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !identifier || !password}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gray-300 hover:bg-primary-500 text-gray-700 hover:text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>LOGIN</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
            </div>
            
            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 flex items-center justify-center space-x-1.5">
                <Shield className="text-primary-600" size={12} />
                <span>Secure & encrypted</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
