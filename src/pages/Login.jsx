import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, Send, Shield, ArrowRight, CheckCircle, AlertCircle, Lock, User, Eye, EyeOff, Mail } from 'lucide-react'
import { sendOtp, verifyOtp, setAccessToken, getAccessToken, loginWithPassword, registerUser } from '../lib/api'
import toast from 'react-hot-toast'

const Login = () => {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [loginMethod, setLoginMethod] = useState('otp') // 'otp' or 'password'
  const [step, setStep] = useState('identifier') // 'identifier' or 'otp' for OTP method
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [identifier, setIdentifier] = useState('') // phone, email, or username for password login
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  // Check if user is already logged in
  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      if (redirectUrl) {
        const decodedUrl = decodeURIComponent(redirectUrl)
        navigate(decodedUrl, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [navigate, redirectUrl])

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
        
        if (redirectUrl) {
          const decodedUrl = decodeURIComponent(redirectUrl)
          navigate(decodedUrl)
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP')
      toast.error(err.message || 'Invalid OTP')
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
      const response = await loginWithPassword(identifier, password)
      
      if (response.success) {
        setAccessToken(response.data.accessToken)
        toast.success('Login successful!')
        
        if (redirectUrl) {
          const decodedUrl = decodeURIComponent(redirectUrl)
          navigate(decodedUrl)
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Invalid credentials'
      setError(errorMessage)
      
      // If user not found, suggest registration
      if (errorMessage.includes('not found') || err.response?.data?.code === 'USER_NOT_FOUND' || errorMessage.includes('Please register')) {
        toast.error('User not found. Please register first.', {
          duration: 4000,
          action: {
            label: 'Sign Up',
            onClick: () => {
              setMode('register')
              setLoginMethod('password')
              setError('')
            }
          }
        })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate required fields
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // At least one identifier must be provided
    if (!phone && !email && !name) {
      setError('Please provide at least one of: phone, email, or name')
      return
    }

    setLoading(true)

    try {
      const response = await registerUser(
        phone || undefined, 
        email || undefined, 
        name || undefined, 
        password, 
        confirmPassword
      )
      
      if (response.success) {
        setAccessToken(response.data.accessToken)
        toast.success('Registration successful!')
        
        if (redirectUrl) {
          const decodedUrl = decodeURIComponent(redirectUrl)
          navigate(decodedUrl)
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed'
      setError(errorMessage)
      toast.error(errorMessage)
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
          {/* Login/Register Mode Toggle */}
          <div className="bg-gray-50 p-4 flex gap-2 border-b">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
                setIdentifier('')
                setPassword('')
                setPhone('')
                setOtp('')
                setStep('identifier')
                setLoginMethod('otp')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-medical-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError('')
                setLoginMethod('password')
                setPhone('')
                setEmail('')
                setName('')
                setPassword('')
                setConfirmPassword('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-medical-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Method Toggle (only for login mode) */}
          {mode === 'login' && (
            <div className="bg-gray-50 p-4 flex gap-2 border-b">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp')
                  setStep('identifier')
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
          )}

          {/* Card Header */}
          <div className="bg-gradient-to-r from-medical-600 to-medical-700 p-8 text-white">
            <h2 className="text-2xl font-bold mb-1">
              {mode === 'register' 
                ? 'Create Account' 
                : loginMethod === 'otp' 
                  ? (step === 'identifier' ? 'Login with Phone' : 'Verify OTP')
                  : 'Login with Password'}
            </h2>
            <p className="text-medical-100">
              {mode === 'register'
                ? 'Create your account to get started'
                : loginMethod === 'otp'
                  ? (step === 'identifier' 
                    ? 'Enter your phone number to continue' 
                    : `Enter OTP sent to +91 ${phone}`)
                  : 'Enter your phone, email, or username and password'}
            </p>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (Optional)
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
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Provide at least one: phone, email, or name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (min 6 characters)"
                      className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || password.length < 6 || password !== confirmPassword || (!phone && !email && !name)}
                  className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-medical-600 hover:bg-medical-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <User size={20} />
                      <span>Create Account</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError('')
                      setPhone('')
                      setEmail('')
                      setName('')
                      setPassword('')
                      setConfirmPassword('')
                      setLoginMethod('otp')
                      setStep('identifier')
                    }}
                    className="text-medical-600 hover:text-medical-700 font-medium"
                  >
                    Login
                  </button>
                </p>
              </form>
            ) : loginMethod === 'otp' ? (
              step === 'identifier' ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
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

                  {error && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="text-red-600" size={20} />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

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

                  {error && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="text-red-600" size={20} />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

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

                  <button
                    type="button"
                    onClick={() => setStep('identifier')}
                    className="w-full text-medical-600 hover:text-medical-700 text-sm font-medium transition-colors"
                  >
                    ← Change phone number
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone, Email, or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter phone, email, or username"
                      className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent text-lg"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !identifier || !password}
                  className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-medical-600 hover:bg-medical-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Login</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setError('')
                      setIdentifier('')
                      setPassword('')
                      setPhone('')
                      setEmail('')
                      setName('')
                      setConfirmPassword('')
                    }}
                    className="text-medical-600 hover:text-medical-700 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
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
