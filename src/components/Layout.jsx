import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Package, 
  FileText,
  LogOut,
  Home
} from 'lucide-react'
import { getAccessToken, getCurrentUser, removeAccessToken } from '../lib/api'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
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
          const userData = await getCurrentUser()
          const userObj = userData.data?.user
          setUser(userObj)
          // Also check role from user object
          if (userObj?.role === 'ADMIN') {
            setIsAdmin(true)
          }
        } catch (error) {
          setIsAuthenticated(false)
          setUser(null)
          setIsAdmin(false)
        }
      }
    }

    checkAuth()
  }, [location])

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
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: FileText },
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-medical-600 to-medical-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">+</span>
              </div>
              <span className="text-xl font-bold text-gray-900">HealthPlus</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-medical-600 bg-medical-50'
                        : 'text-gray-700 hover:text-medical-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              {isAuthenticated && (
                <Link
                  to="/prescriptions"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/prescriptions')
                      ? 'text-medical-600 bg-medical-50'
                      : 'text-gray-700 hover:text-medical-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText size={16} />
                  <span>Prescriptions</span>
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-medical-600 transition-colors"
                  >
                    <ShoppingCart size={20} />
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-medical-600 transition-colors"
                  >
                    <User size={20} />
                    <span className="hidden md:block">{user?.name || 'User'}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden md:block">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-medical-600 text-white rounded-md hover:bg-medical-700 transition-colors"
                >
                  Login
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-medical-600 transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-medical-600 bg-medical-50'
                        : 'text-gray-700 hover:text-medical-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              {isAuthenticated && (
                <Link
                  to="/prescriptions"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/prescriptions')
                      ? 'text-medical-600 bg-medical-50'
                      : 'text-gray-700 hover:text-medical-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText size={20} />
                  <span>Prescriptions</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-2 gap-8 md:grid-cols-4 ${isAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} mb-8`}>
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">HealthPlus</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your trusted health partner. Quality medicines and healthcare products delivered to your doorstep.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/prescriptions" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Prescriptions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/orders" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/cancellation" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-sm text-gray-600 hover:text-medical-600 transition-colors">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-sm text-medical-600 hover:text-medical-700 font-medium transition-colors">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="tel:+911234567890" className="hover:text-medical-600 transition-colors">
                    📞 +91 123 456 7890
                  </a>
                </li>
                <li>
                  <a href="mailto:support@healthplus.com" className="hover:text-medical-600 transition-colors">
                    ✉️ healthplus@gmail.com
                  </a>
                </li>
                <li className="pt-2">
                  <p className="text-xs text-gray-500">
                    Monday - Saturday<br />
                    9:00 AM - 8:00 PM
                  </p>
                </li>
              </ul>
            </div>

            {/* Admin Panel - Only visible to admins */}
            

                
               
                 
                
             
            
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600 text-center md:text-left">
                &copy; {new Date().getFullYear()} HealthPlus. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Licensed Pharmacy</span>
                <span className="hidden md:inline">|</span>
                <span>Verified Products</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
