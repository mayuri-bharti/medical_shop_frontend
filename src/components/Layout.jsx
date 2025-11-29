import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Package, 
  FileText,
  LogOut,
  Home,
  Stethoscope,
  Truck
} from 'lucide-react'
import { getAccessToken, getCurrentUser, removeAccessToken } from '../lib/api'
import { api } from '../services/api'
import { CART_UPDATED_EVENT, normalizeCartData, calculateCartItemCount } from '../lib/cartEvents'
import LanguageSelector from './LanguageSelector'

// Helper to get full avatar URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  if (avatar.startsWith('http')) return avatar
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
  const baseUrl = apiBaseUrl.replace('/api', '')
  return `${baseUrl}${avatar.startsWith('/') ? avatar : '/' + avatar}`
}

const Layout = ({ children }) => {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken()
      setIsAuthenticated(!!token)
      
      // Check admin role from storage
      const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole')
      setIsAdmin(userRole === 'ADMIN')
      
      if (token) {
        try {
          // Try to fetch profile first (has avatar)
          try {
            const profileResponse = await api.get('/profile')
            const profileData = profileResponse.data?.data || profileResponse.data
            if (profileData) {
              setUser(profileData)
              if (profileData.role === 'ADMIN') {
                setIsAdmin(true)
              }
            }
          } catch (profileError) {
            // Fallback to getCurrentUser if profile endpoint fails
            const userData = await getCurrentUser()
            const userObj = userData.data?.user
            setUser(userObj)
            if (userObj?.role === 'ADMIN') {
              setIsAdmin(true)
            }
          }
        } catch (error) {
          // Handle network errors gracefully - don't break the app if backend is down
          if (error.message?.includes('Failed to fetch') || 
              error.message?.includes('ERR_CONNECTION_REFUSED') ||
              error.message?.includes('NetworkError')) {
            // Backend is unavailable - keep user as authenticated if token exists
            // This allows the app to work in offline mode or when backend is starting
            console.warn('Backend unavailable, using cached authentication state')
            // Don't clear auth state if it's just a connection issue
            return
          }
          
          // For other errors (401, etc.), clear auth state
          setIsAuthenticated(false)
          setUser(null)
          setIsAdmin(false)
        }
      }
    }

    checkAuth()
  }, [location])

  // Ensure every navigation starts from top of the page
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0)
      return
    }

    let isMounted = true

    const updateCountFromPayload = (payload) => {
      const cartData = normalizeCartData(payload)
      const nextCount = calculateCartItemCount(cartData)
      if (isMounted && Number.isFinite(nextCount)) {
        setCartCount(nextCount)
      }
    }

    const fetchCartCount = async () => {
      try {
        const token = getAccessToken()
        if (!token) {
          setCartCount(0)
          return
        }
        const response = await api.get('/cart')
        updateCountFromPayload(response.data)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to fetch cart count', error?.message || error)
        }
      }
    }

    fetchCartCount()

    const handleCartUpdated = (event) => {
      if (event?.detail) {
        if (typeof event.detail.count === 'number') {
          setCartCount(event.detail.count)
          return
        }
        if (event.detail.cart) {
          updateCountFromPayload(event.detail.cart)
          return
        }
      }
      fetchCartCount()
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated)
    return () => {
      isMounted = false
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated)
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    removeAccessToken()
    localStorage.removeItem('userRole')
    sessionStorage.removeItem('userRole')
    setIsAuthenticated(false)
    setUser(null)
    setIsAdmin(false)
    navigate('/')
  }

  const navigation = [
    { name: t('common.home'), href: '/', icon: Home },
    { name: t('common.products'), href: '/products', icon: Package },
    { name: t('common.orders'), href: '/orders', icon: FileText },
    { name: t('common.doctors'), href: '/doctor-appointment', icon: Stethoscope }
  ]

  const isActive = (path) => location.pathname === path

  // Don't show navigation on login/verify/admin pages
  const hideNav = location.pathname === '/login' || 
                  location.pathname === '/verify' || 
                  location.pathname.startsWith('/admin')

  if (hideNav) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile-First Responsive Design */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b border-gray-100 z-[100] backdrop-blur-sm bg-white/95 max-w-full overflow-hidden">
        <div className="w-full max-w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-3 md:gap-4">
            {/* Logo - Responsive Sizing */}
            <Link 
              to="/" 
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 min-w-0 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-medical-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">+</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 to-medical-600 bg-clip-text text-transparent leading-tight truncate">
                  HealthPlus
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 leading-tight hidden sm:block">
                  Your Health Partner
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Hidden on Mobile */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-center max-w-2xl">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className="lg:w-[18px] lg:h-[18px]" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                )
              })}
              {isAuthenticated && (
                <Link
                  to="/prescriptions"
                  className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive('/prescriptions')
                      ? 'text-primary-600 bg-primary-50 shadow-sm'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText size={16} className="lg:w-[18px] lg:h-[18px]" />
                  <span className="hidden lg:inline">{t('common.prescriptions')}</span>
                </Link>
              )}
            </nav>

            {/* Right side - User Actions & Menu - Properly Aligned */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0">
              {/* Language Selector - Hidden on very small screens */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>
              
              {isAuthenticated ? (
                <>
                  {/* User Avatar - Smaller on mobile */}
                  <Link
                    to="/account"
                    className="p-1 sm:p-1.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="My Account"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user?.avatar && getAvatarUrl(user.avatar) ? (
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt={user.name || 'User'}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextSibling && e.target.nextSibling.style) {
                            e.target.nextSibling.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs sm:text-sm font-semibold flex-shrink-0 ${user?.avatar && getAvatarUrl(user.avatar) ? 'hidden' : ''}`}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />}
                    </div>
                  </Link>
                  
                  {/* Cart - Smaller on mobile */}
                  <Link
                    to="/cart"
                    className="relative p-1.5 sm:p-2 md:p-2.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 sm:top-0 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {Math.min(cartCount, 99)}
                      </span>
                    )}
                  </Link>

                  {/* Logout - Icon only on mobile */}
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium whitespace-nowrap flex-shrink-0"
                    title={t('common.logout')}
                  >
                    <LogOut size={16} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                    <span className="hidden md:inline">{t('common.logout')}</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                  <span>{t('common.login')}</span>
                </Link>
              )}

              {/* Mobile menu button - Always visible on mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:ml-0 md:hidden p-1.5 sm:p-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 flex-shrink-0"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Menu size={20} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer - Enhanced */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg max-w-full overflow-y-auto">
            <div className="px-4 py-3 sm:py-4 space-y-1 sm:space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 w-full ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              {isAuthenticated && (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 w-full ${
                      isActive('/account')
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <User size={20} className="flex-shrink-0" />
                    <span>My Account</span>
                  </Link>
                  <Link
                    to="/prescriptions"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 w-full ${
                      isActive('/prescriptions')
                        ? 'text-primary-600 bg-primary-50 shadow-sm'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText size={20} className="flex-shrink-0" />
                    <span>{t('common.prescriptions')}</span>
                  </Link>
                  <div className="pt-2 border-t border-gray-200 sm:hidden">
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
                    >
                      <LogOut size={20} className="flex-shrink-0" />
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 w-full justify-center"
                >
                  <User size={20} className="flex-shrink-0" />
                  <span>{t('common.login')}</span>
                </Link>
              )}
              {/* Language Selector in Mobile Menu */}
              <div className="pt-2 border-t border-gray-200 sm:hidden">
                <LanguageSelector />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Add top padding for fixed header */}
      <main className="pt-14 sm:pt-16 md:pt-20">
        {children}
      </main>

      {/* Footer - Premium Healthcare Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-2 gap-8 md:grid-cols-4 ${isAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} mb-12`}>
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-medical-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">+</span>
                </div>
                <span className="text-xl font-bold gradient-text">HealthPlus</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {t('footer.trustedPartner')}
              </p>
              <div className="flex items-center space-x-2">
                <span className="badge badge-success">✓ {t('footer.licensed')}</span>
                <span className="badge badge-info">✓ {t('footer.verified')}</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">{t('footer.quickLinks')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    {t('common.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    {t('common.products')}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    {t('footer.aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    {t('footer.contact')}
                  </Link>
                </li>
                <li>
                  <Link to="/prescriptions" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    {t('common.prescriptions')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Customer Service</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/orders" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link to="/claims" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    My Claims
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/cancellation" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                    Admin Login →
                  </Link>
                </li>
                <li>
                  <Link to="/delivery-boy/login" className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors flex items-center gap-1">
                    <Truck size={16} />
                    Delivery Boy Login →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="text-primary-600">📞</span>
                  <a href="tel:+911234567890" className="hover:text-primary-600 transition-colors font-medium">
                    +91 123 456 7890
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-primary-600">✉️</span>
                  <a href="mailto:support@healthplus.com" className="hover:text-primary-600 transition-colors font-medium">
                    healthplus@gmail.com
                  </a>
                </li>
                <li className="pt-2">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-700">Hours:</span><br />
                    Monday - Saturday<br />
                    9:00 AM - 8:00 PM
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar - Enhanced */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-sm text-gray-600 text-center md:text-left">
                  &copy; {new Date().getFullYear()} <span className="font-bold text-primary-600">HealthPlus</span>. All rights reserved.
                </p>
                <div className="flex items-center gap-2">
                  <span className="badge badge-success text-xs">Licensed Pharmacy</span>
                  <span className="badge badge-info text-xs">Verified Products</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>Made with ❤️ for your health</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
