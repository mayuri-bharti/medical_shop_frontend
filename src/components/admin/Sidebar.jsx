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
  CalendarClock,
  RefreshCw,
  MessageCircle
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
    { name: 'Returns', href: '/admin/dashboard/returns', icon: RefreshCw },
    { name: 'Contact Requests', href: '/admin/dashboard/contact-requests', icon: MessageCircle },
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
        className="fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 z-50 w-64 md:w-56 lg:w-64 md:static md:z-auto shadow-lg md:shadow-none flex flex-col"
      >
        <div className="p-5 lg:p-6 flex-1 flex flex-col overflow-hidden">
          {/* Logo with Close Button (Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200"
          >
            <Link to="/admin/dashboard" className="flex items-center space-x-3 group" onClick={onClose}>
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-xl">+</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base lg:text-lg font-bold text-gray-900 truncate">Admin Panel</h1>
                <p className="text-xs text-gray-500 font-medium">HealthPlus</p>
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
          <nav className="space-y-1 flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isActiveItem = isActive(item.href)
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
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative ${
                      isActiveItem
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon 
                      size={20} 
                      className={`flex-shrink-0 transition-colors ${
                        isActiveItem ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`} 
                    />
                    <span className="truncate flex-1">{item.name}</span>
                    {isActiveItem && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-2 h-2 bg-blue-600 rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
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
            className="mt-auto pt-6 border-t border-gray-200 space-y-2 flex-shrink-0"
          >
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-sm font-medium group"
            >
              <Home size={18} className="flex-shrink-0 text-gray-500 group-hover:text-gray-700" />
              <span className="truncate">Back to Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 text-sm font-medium group"
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span>Logout</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar







