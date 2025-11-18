import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  PackagePlus, 
  Package, 
  FileText,
  LogOut,
  Home,
  X,
  Stethoscope,
  CalendarClock
} from 'lucide-react'
import { removeAccessToken } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleLogout = () => {
    removeAccessToken()
    navigate('/admin/login')
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/dashboard/users', icon: Users },
    { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingBag },
    { name: 'Prescriptions', href: '/admin/dashboard/prescriptions', icon: FileText },
    { name: 'Doctors', href: '/admin/dashboard/doctors', icon: Stethoscope },
    { name: 'Appointments', href: '/admin/dashboard/appointments', icon: CalendarClock },
    { name: 'Add Product', href: '/admin/dashboard/add-product', icon: PackagePlus },
    { name: 'Manage Products', href: '/admin/dashboard/manage-products', icon: Package },
  ]

  const isActive = (path) => location.pathname === path

  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={(isOpen || isDesktop) ? 'open' : 'closed'}
        className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 w-64 md:w-56 lg:w-64 overflow-y-auto md:static md:z-auto"
      >
        <div className="p-4 md:p-5 lg:p-6">
          {/* Logo with Close Button (Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-6 md:mb-7 lg:mb-8"
          >
            <Link to="/admin/dashboard" className="flex items-center space-x-2" onClick={onClose}>
              <div className="w-10 h-10 bg-gradient-to-br from-medical-600 to-medical-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">+</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-sm lg:text-lg font-bold text-gray-900 truncate">Admin Panel</h1>
                <p className="text-xs text-gray-500">HealthPlus</p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-1.5 md:space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all duration-200 text-sm md:text-base ${
                      isActive(item.href)
                        ? 'bg-medical-50 text-medical-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <Icon size={18} className="md:w-5 md:h-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200 space-y-1.5 md:space-y-2"
          >
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm text-sm md:text-base"
            >
              <Home size={18} className="md:w-5 md:h-5 flex-shrink-0" />
              <span className="truncate">Back to Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-sm text-sm md:text-base"
            >
              <LogOut size={18} className="md:w-5 md:h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar







