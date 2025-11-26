import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Send, Shield, ArrowRight, CheckCircle, AlertCircle, Lock, User, Eye, EyeOff, Mail, X } from 'lucide-react'
import { sendOtp, verifyOtp, setAccessToken, getAccessToken, loginWithPassword, registerUser, loginWithGoogle } from '../lib/api'
import toast from 'react-hot-toast'


const Login = () => {
  const { t } = useTranslation()
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
    return redirectUrl ? decodeURIComponent(redirectUrl) : '/'
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

  // Initialize Google Sign-In
  useEffect(() => {
    if (mode === 'register' || loginMethod !== 'otp' || step !== 'identifier') return

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    
    if (!googleClientId) {
      console.warn('⚠️ VITE_GOOGLE_CLIENT_ID not configured. Google Sign-In will not work.')
      return
    }

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        try {
          const buttonContainer = document.getElementById('google-signin-button')
          if (!buttonContainer) return

          // Clear any existing button content to prevent reusing old tokens
          buttonContainer.innerHTML = ''

          // Initialize Google Sign-In with fresh callback
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true // Use modern FedCM API
          })

          // Render fresh button
          window.google.accounts.id.renderButton(
            buttonContainer,
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
              locale: 'en',
              type: 'standard' // Ensure standard flow (not one-tap)
            }
          )

          console.log('✅ Google Sign-In button initialized')
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error)
        }
      }
    }

    // Wait for Google script to load
    if (window.google && window.google.accounts) {
      // Small delay to ensure DOM is ready
      setTimeout(initializeGoogleSignIn, 100)
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle)
          setTimeout(initializeGoogleSignIn, 100)
        }
      }, 100)

      // Cleanup after 10 seconds if Google doesn't load
      setTimeout(() => clearInterval(checkGoogle), 10000)
    }

    // Cleanup function
    return () => {
      const buttonContainer = document.getElementById('google-signin-button')
      if (buttonContainer) {
        buttonContainer.innerHTML = ''
      }
    }
  }, [mode, loginMethod, step])

  const handleGoogleSignIn = async (response) => {
    if (!response || !response.credential) {
      console.error('Google sign-in response missing credential:', response)
      toast.error('Google sign-in failed: No credential received')
      return
    }

    // Use token immediately to prevent expiration
    const token = response.credential
    const receivedAt = Date.now()
    
    // Decode token to check expiration (JWT has 3 parts separated by dots)
    try {
      const tokenParts = token.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        const now = Math.floor(Date.now() / 1000)
        const tokenAge = now - (payload.iat || 0)
        const expiresIn = (payload.exp || 0) - now
        
        console.log('✅ Google token received, sending immediately to backend...', {
          tokenLength: token.length,
          timestamp: new Date().toISOString(),
          tokenAge: `${tokenAge} seconds (${Math.round(tokenAge / 60)} minutes)`,
          expiresIn: `${expiresIn} seconds`,
          email: payload.email
        })
        
        if (expiresIn < 0) {
          console.error('❌ Token already expired!', { expiresIn, tokenAge })
          toast.error('Token expired. Please click "Sign in with Google" again.')
          setLoading(false)
          return
        }
      }
    } catch (e) {
      console.warn('Could not decode token for debugging:', e)
    }

    // Clear any previous errors
    setError('')
    setLoading(true)

    // Send token immediately - no delays

    try {
      // Send token immediately - don't delay
      const result = await loginWithGoogle(token)
      
      if (result.success && result.data?.accessToken) {
        handleLoginSuccess(result.data.accessToken)
        toast.success('Login successful!')
      } else {
        throw new Error(result.message || 'Google login failed')
      }
    } catch (err) {
      console.error('Google login error:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response?.data,
        hint: err.hint
      })
      
      let errorMessage = err.response?.data?.message || err.message || 'Google login failed'
      const shouldRetry = err.response?.data?.shouldRetry
      
      // If token expired, provide clear instructions
      if (shouldRetry || errorMessage.includes('expired') || errorMessage.includes('too late')) {
        errorMessage = 'Token expired. Please click "Sign in with Google" again to get a fresh token.'
        toast.error(errorMessage, { 
          duration: 6000,
          action: {
            label: 'Try Again',
            onClick: () => {
              // Clear the error and let user try again
              setError('')
            }
          }
        })
      } else {
        // Add hint if available
        if (err.response?.data?.hint) {
          errorMessage = `${errorMessage} - ${err.response.data.hint}`
        }
        
        // Add details in development
        if (import.meta.env.DEV && err.response?.data?.details) {
          console.warn('Backend error details:', err.response.data.details)
        }
        
        toast.error(errorMessage, { duration: 5000 })
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get backend URL
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
      setError(t('login.invalidCredentials'))
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
        toast.success('Account created successfully. Please log in.')
        setMode('login')
        setLoginMethod('password')
        setStep('identifier')
        setPassword('')
        setConfirmPassword('')
        if (phone) {
          setIdentifier(phone)
        } else if (email) {
          setIdentifier(email)
        }
      } else {
        toast.error(response.message || 'Registration failed')
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
                  ? t('login.register')
                  : loginMethod === 'otp' 
                    ? (step === 'identifier' ? t('login.title') : t('login.verifyOtp'))
                    : t('login.title')}
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
                  {t('login.loginWithOtp')}
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
                  {t('login.loginWithPassword')}
                </button>
              </div>
            )}

            {/* Google Sign-In Button */}
            {mode === 'login' && loginMethod === 'otp' && step === 'identifier' && import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="mb-4">
                <div id="google-signin-button" className="w-full"></div>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="flex-1">
            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('login.name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('login.name')}
                    className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('login.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.email')}
                    className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('login.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('login.enterPhone')}
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
                    {t('login.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('login.enterPassword')}
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
                    {t('login.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('login.confirmPassword')}
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
                      <span>{t('login.creatingAccount')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('login.createAccountButton')}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-600">
                  {t('login.alreadyHaveAccount')}{' '}
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
                    {t('login.loginButton')}
                  </button>
                </p>
              </form>
            ) : loginMethod === 'otp' ? (
              step === 'identifier' ? (
                <form onSubmit={handleSendOtp} className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('login.enterMobileNumber')}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={t('login.enterPhone')}
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
                      {t('login.enterOtpCode')}
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
                      {t('login.otpCodeSent')}
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
                        <span>{t('login.verifying')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('login.verifyOtpButton')}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('identifier')}
                    className="w-full text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors"
                  >
                    {t('login.changePhoneNumber')}
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('login.phoneEmailUsername')}
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('login.enterPhoneEmailUsername')}
                    className="block w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-gray-50 hover:bg-white transition-colors"
                    disabled={loading || rateLimitError}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('login.password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('login.enterPassword')}
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
                      <span>{t('login.loggingIn')}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>{t('login.loginButton')}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-600">
                  {t('login.dontHaveAccount')}{' '}
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
                    {t('login.createAccount')}
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