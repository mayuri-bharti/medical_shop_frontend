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
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken()
      setIsAuthenticated(!!token)
      
      if (token) {
        try {
          const userData = await getCurrentUser()
          setUser(userData.data?.user)
        } catch (error) {
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    }

    checkAuth()
  }, [location])

  const handleLogout = () => {
    removeAccessToken()
    setIsAuthenticated(false)
    setUser(null)
    navigate('/')
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: FileText },
  ]

  const isActive = (path) => location.pathname === path

  // Don't show navigation on login/verify pages
  const hideNav = location.pathname === '/login' || location.pathname === '/verify'

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
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MediShop</span>
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
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 MediShop. Your trusted health partner.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
