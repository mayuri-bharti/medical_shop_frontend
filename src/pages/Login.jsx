import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Send, Shield, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { sendOtp, verifyOtp, setAccessToken } from '../lib/api'
import toast from 'react-hot-toast'

const Login = () => {
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
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
        setAccessToken(response.data.accessToken)
        toast.success('Login successful!')
        navigate('/prescription')
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP')
      toast.error(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 via-blue-50 to-medical-100 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-medical-600 to-medical-700 rounded-2xl mb-4 shadow-lg">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HealthPlus</h1>
          <p className="text-gray-600 text-lg">Your trusted health partner</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-medical-600 to-medical-700 p-8 text-white">
            <h2 className="text-2xl font-bold mb-1">
              {step === 'phone' ? 'Login with Phone' : 'Verify OTP'}
            </h2>
            <p className="text-medical-100">
              {step === 'phone' 
                ? 'Enter your phone number to continue' 
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
                    Phone Number
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
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send you an OTP ~ verify your number
                  </p>
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
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Enter the 6-digit code sent to your phone
                  </p>
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
                      <span>Verify & Continue</span>
                    </>
                  )}
                </button>

                {/* Change Number Button */}
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-medical-600 hover:text-medical-700 text-sm font-medium transition-colors"
                >
                  ← Change phone number
                </button>
              </form>
            )}
          </div>

          {/* Card Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="text-medical-600" size={16} />
              <span>Secure & encrypted</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Need help? <a href="#" className="text-medical-600 hover:underline font-medium">Contact Support</a>
        </p>
      </div>
    </div>
  )
}

export default Login
