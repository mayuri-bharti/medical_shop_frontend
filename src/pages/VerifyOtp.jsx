import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { verifyOtp, setAccessToken } from '../lib/api'
import toast from 'react-hot-toast'

const VerifyOtp = () => {
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const navigate = useNavigate()

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  useEffect(() => {
    if (phone) setResendCooldown(60)
    else navigate('/login')
  }, [phone, navigate])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await verifyOtp(phone, otp)
      if (response.success) {
        setAccessToken(response.data.accessToken)
        console.log('Stored Token:', response.data.accessToken)
        toast.success('Login successful!')
        navigate('/')
      }
    } catch (err) {
      const message = err.message || 'Invalid OTP. Please try again.'
      setError(message)
      toast.error(message)
      if (err.attemptsLeft !== undefined) setAttemptsLeft(err.attemptsLeft)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    try {
      const { sendOtp } = await import('../lib/api')
      await sendOtp(phone)
      toast.success('OTP resent!')
      setResendCooldown(60)
      setCanResend(false)
    } catch {
      toast.error('Failed to resend OTP')
    }
  }

  const handleOtpChange = (value) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 6) setOtp(digits)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-medical-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-medical-600 rounded-2xl mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">Enter the code sent to +91 {phone}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Change number</span>
          </button>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('')
                      newOtp[i] = e.target.value
                      handleOtpChange(newOtp.join(''))
                      if (e.target.value && i < 5)
                        e.target.parentElement.children[i + 1]?.focus()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0)
                        e.target.parentElement.children[i - 1]?.focus()
                    }}
                    className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all"
                    disabled={loading}
                    required
                  />
                ))}
              </div>
            </div>

            {attemptsLeft !== null && attemptsLeft > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="text-yellow-600" size={20} />
                <p className="text-sm text-yellow-600">
                  {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-medical-600 hover:bg-medical-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn’t receive the code?
              </p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-medical-600 hover:text-medical-700 font-medium text-sm"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend OTP in {resendCooldown}s
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp
