import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, Send, Shield, ArrowRight, CheckCircle, AlertCircle, Lock, User, Eye, EyeOff, Mail, X } from 'lucide-react'
import { sendOtp, verifyOtp, setAccessToken, getAccessToken, loginWithPassword, registerUser, loginWithGoogle } from '../lib/api'
import toast from 'react-hot-toast'
import LoginSuccessAnimation from '../components/LoginSuccessAnimation'


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
  const [rateLimitError, setRateLimitError] = useState(false)
  const [retryAfter, setRetryAfter] = useState(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const getRedirectTarget = useCallback(() => {
    return redirectUrl ? decodeURIComponent(redirectUrl) : '/dashboard'
  }, [redirectUrl])

  const handleLoginSuccess = useCallback((accessToken) => {
    if (!accessToken) return
    setAccessToken(accessToken)
    const target = getRedirectTarget()
    sessionStorage.setItem('loginSuccess', '1')
    sessionStorage.setItem('redirectAfterSuccess', target)
    navigate(target, { replace: true })
  }, [getRedirectTarget, navigate])

  // Check if user is already logged in
  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      navigate(getRedirectTarget(), { replace: true })
    }
  }, [navigate, getRedirectTarget])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const googleButtonRef = useRef(null)

  // Handle Google OAuth callback - process token immediately
  const handleGoogleLogin = useCallback(async (response) => {
    if (!response || !response.credential) {
      toast.error('Google login failed. No credential received.')
      return
    }

    // Validate credential format
    if (typeof response.credential !== 'string' || response.credential.split('.').length !== 3) {
      toast.error('Invalid Google credential format.')
      return
    }

    // Process immediately to avoid token expiration
    setLoading(true)
    setError('')

    try {
      // Send token to backend immediately
      const result = await loginWithGoogle(response.credential)
      
      if (result.success) {
        handleLoginSuccess(result.data.accessToken)
      }
    } catch (err) {
      const errorMessage = err.message || 'Google login failed'
      const errorData = err.data || {}
      
      // Check if token expired - automatically re-prompt with fresh token
      if (errorMessage.includes('TOKEN_EXPIRED') || errorMessage.includes('expired') || errorMessage.includes('used too late')) {
        setError('')
        toast.error('Token expired. Getting a fresh token...')
        
        // Cancel any existing prompts
        if (window.google?.accounts?.id) {
          window.google.accounts.id.cancel()
        }
        
        // Re-prompt Google login immediately to get fresh token
        setTimeout(() => {
          const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
          if (window.google && window.google.accounts && googleClientId) {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleLogin,
              auto_select: false
            })
            window.google.accounts.id.prompt()
          }
        }, 500)
      } else {
        // Show detailed error message
        const detailedError = errorData.error || errorMessage
        setError(detailedError)
        toast.error(detailedError)
        console.error('Google login error:', { errorMessage, errorData, err })
      }
    } finally {
      setLoading(false)
    }
  }, [navigate, redirectUrl])

  // Trigger Google login - ensures fresh token on each click
  const handleGoogleButtonClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    
    if (!googleClientId) {
      toast.error('Google login is not configured. Please contact support.')
      return
    }

    if (!window.google || !window.google.accounts) {
      toast.error('Google login is loading. Please wait a moment and try again.')
      return
    }

    try {
      // Cancel any existing prompts to ensure fresh token
      if (window.google.accounts.id) {
        window.google.accounts.id.cancel()
      }
      
      // Re-initialize with fresh callback to get new token
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleLogin,
        auto_select: false,
        cancel_on_tap_outside: true
      })
      
      // Prompt One Tap - this generates a fresh token each time
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap not shown, click the rendered button which will also generate fresh token
          if (googleButtonRef.current) {
            const button = googleButtonRef.current.querySelector('div[role="button"]')
            if (button) {
              button.click()
            } else {
              toast.error('Please wait for Google Sign-In to load')
            }
          }
        }
      })
    } catch (err) {
      console.error('Google login initialization error:', err)
      toast.error('Google login is not available. Please try again.')
    }
  }

  // Load and initialize Google OAuth script
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    
    if (!googleClientId) {
      return
    }

    const initializeGoogle = () => {
      if (!window.google || !window.google.accounts) {
        return
      }

      // Initialize Google Sign-In - don't auto-prompt, let user click button
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleLogin,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true
      })

      // Render button if ref is available
      // Note: The rendered button will generate a fresh token on each click
      if (googleButtonRef.current) {
        try {
          // Clear any existing button first
          googleButtonRef.current.innerHTML = ''
          
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'en',
            width: 300,
            click_listener: () => {
              // This ensures we get a fresh token when button is clicked
              // The callback will be called with a new credential
            }
          })
        } catch (err) {
          console.warn('Google button rendering failed:', err)
        }
      }
    }

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      script.onerror = () => {
        console.error('Failed to load Google Identity Services')
      }
      document.body.appendChild(script)

      return () => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
        if (existingScript?.parentNode) {
          existingScript.parentNode.removeChild(existingScript)
        }
      }
    } else {
      initializeGoogle()
    }
  }, [handleGoogleLogin])

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
        handleLoginSuccess(response.data.accessToken)
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
        handleLoginSuccess(response.data.accessToken)
      }
    } catch (err) {
      const errorMessage = err.message || 'Invalid credentials'
      
      // Handle rate limiting errors
      if (errorMessage.includes('Too many') || 
          errorMessage.includes('rate limit') || 
          errorMessage.includes('try again later') ||
          err.response?.status === 429) {
        setRateLimitError(true)
        setError(errorMessage)
        
        // Extract retry-after time if available
        const retryAfterHeader = err.response?.headers?.['retry-after'] || 
                                 err.response?.headers?.['Retry-After']
        if (retryAfterHeader) {
          const seconds = parseInt(retryAfterHeader)
          setRetryAfter(seconds)
          
          // Countdown timer
          let remaining = seconds
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          timerRef.current = setInterval(() => {
            remaining--
            setRetryAfter(remaining)
            if (remaining <= 0) {
              clearInterval(timerRef.current)
              timerRef.current = null
              setRateLimitError(false)
              setRetryAfter(null)
            }
          }, 1000)
        } else {
          // Default 60 seconds if no retry-after header
          setRetryAfter(60)
          let remaining = 60
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          timerRef.current = setInterval(() => {
            remaining--
            setRetryAfter(remaining)
            if (remaining <= 0) {
              clearInterval(timerRef.current)
              timerRef.current = null
              setRateLimitError(false)
              setRetryAfter(null)
            }
          }, 1000)
        }
        
        toast.error('Too many login attempts. Please wait before trying again.', {
          duration: 5000
        })
      } else {
        setRateLimitError(false)
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
        toast.success('Registration successful!')
        handleLoginSuccess(response.data.accessToken)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 py-4">
      <div className="max-w-2xl w-full">
        {/* Split Modal Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[360px]">
          {/* Left Section - Green Branding Panel */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 md:w-2/5 p-4 md:p-5 flex flex-col items-center justify-center text-white relative overflow-hidden">
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
                  <span className="text-primary-600 font-bold text-2xl">+</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-1">HealthPlus</h1>
              <p className="text-white/90 text-sm mb-1">CHEMISTS & LIFESTYLE STORE</p>
              <p className="text-base font-light mt-4 text-white/95">Life. Unlimited.</p>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="md:w-3/5 p-4 md:p-5 flex flex-col relative">
            {/* Close Button */}
            <button
              onClick={() => navigate('/')}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            {/* Form Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome</h2>
              <p className="text-base font-semibold text-gray-700">
                {mode === 'register' 
                  ? 'Create your account' 
                  : loginMethod === 'otp' 
                    ? (step === 'identifier' ? 'Login to your account' : 'Verify OTP')
                    : 'Login to your account'}
              </p>
            </div>

            {/* Login method switcher */}
            {mode !== 'register' && (
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setStep('identifier'); setError('') }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                    loginMethod === 'otp'
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Login with OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setError('') }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                    loginMethod === 'password'
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Login with Password
                </button>
              </div>
            )}

            {/* Form Content */}
            <div className="flex-1">
            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit phone number"
                    className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                    disabled={loading}
                    maxLength={10}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Provide at least one: phone, email, or name
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (min 6 characters)"
                      className="block w-full px-2 pr-9 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="block w-full px-2 pr-9 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="text-red-600" size={16} />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || password.length < 6 || password !== confirmPassword || (!phone && !email && !name)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gray-300 hover:bg-primary-500 text-gray-700 hover:text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Separator */}
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-xs text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleButtonClick}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                {/* Hidden Google button container for automatic rendering */}
                <div ref={googleButtonRef} className="hidden"></div>

                <p className="text-center text-xs text-gray-600">
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
                    className="text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            ) : loginMethod === 'otp' ? (
              step === 'identifier' ? (
                <form onSubmit={handleSendOtp} className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit mobile number"
                        className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                        disabled={loading}
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className={`flex items-start space-x-2 p-3 rounded-lg ${
                      rateLimitError 
                        ? 'bg-amber-50 border border-amber-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <AlertCircle className={rateLimitError ? "text-amber-600 flex-shrink-0 mt-0.5" : "text-red-600 flex-shrink-0 mt-0.5"} size={16} />
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${rateLimitError ? 'text-amber-800' : 'text-red-600'}`}>
                          {error}
                        </p>
                        {rateLimitError && retryAfter && (
                          <p className="text-xs text-amber-600 mt-1.5 font-medium">
                            ⏱️ Please try again in {retryAfter} second{retryAfter !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10 || rateLimitError}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gray-300 hover:bg-primary-500 text-gray-700 hover:text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>SEND OTP</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {/* Separator */}
                  <div className="flex items-center my-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-xs text-gray-500">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  {/* Google Login Button */}
                  {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                    <div className="w-full">
                      {/* Hide the auto-rendered Google button to avoid duplicate */}
                      <div ref={googleButtonRef} className="hidden"></div>
                      <button
                        type="button"
                        onClick={handleGoogleButtonClick}
                        disabled={loading}
                        className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continue with Google</span>
                      </button>
                    </div>
                  ) : null}
                  
                  <p className="text-center text-xs text-gray-600">
                    Don't have account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register')
                        setError('')
                        setPhone('')
                        setOtp('')
                        setStep('identifier')
                      }}
                      className="text-primary-600 hover:text-primary-700 font-semibold underline"
                    >
                      Create new account
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="block w-full text-center text-2xl tracking-widest py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-bold bg-gray-50"
                      disabled={loading}
                      maxLength={6}
                      required
                      autoFocus
                    />
                    <p className="mt-1.5 text-xs text-gray-500 text-center">
                      Enter the 6-digit code sent to your phone
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="text-red-600" size={16} />
                      <p className="text-xs text-red-600">{error}</p>
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

                  <button
                    type="button"
                    onClick={() => setStep('identifier')}
                    className="w-full text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors"
                  >
                    ← Change phone number
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone, Email, or Username
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter phone, email, or username"
                    className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                    disabled={loading || rateLimitError}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="block w-full px-2 pr-9 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                      disabled={loading || rateLimitError}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={`flex items-start space-x-2 p-3 rounded-lg ${
                    rateLimitError 
                      ? 'bg-amber-50 border border-amber-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <AlertCircle className={rateLimitError ? "text-amber-600 flex-shrink-0 mt-0.5" : "text-red-600 flex-shrink-0 mt-0.5"} size={16} />
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${rateLimitError ? 'text-amber-800' : 'text-red-600'}`}>
                        {error}
                      </p>
                      {rateLimitError && retryAfter && (
                        <p className="text-xs text-amber-600 mt-1.5 font-medium">
                          ⏱️ Please try again in {retryAfter} second{retryAfter !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !identifier || !password || rateLimitError}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Login</span>
                    </>
                  )}
                </button>

                {/* Separator */}
                <div className="flex items-center my-2">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-xs text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleButtonClick}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                {/* Hidden Google button container for automatic rendering */}
                <div ref={googleButtonRef} className="hidden"></div>
                
                <p className="text-center text-xs text-gray-600">
                  Don't have account?{' '}
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
                    className="text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    Create new account
                  </button>
                </p>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 