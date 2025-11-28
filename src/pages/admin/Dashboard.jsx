import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, LogOut } from 'lucide-react'
import Sidebar from '../../components/admin/Sidebar'
import { removeAccessToken } from '../../lib/api'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    // Remove all tokens (removeAccessToken handles admin tokens too)
    removeAccessToken()
    
    toast.success('Logged out successfully')
    navigate('/admin/login')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Users', href: '/admin/dashboard/users' },
    { name: 'Orders', href: '/admin/dashboard/orders' },
    { name: 'Returns', href: '/admin/dashboard/returns' },
    { name: 'Contact', href: '/admin/dashboard/contact-requests' },
    { name: 'Prescriptions', href: '/admin/dashboard/prescriptions' },
    { name: 'Delivery Boys', href: '/admin/dashboard/delivery-boys' },
    { name: 'Doctors', href: '/admin/dashboard/doctors' },
    { name: 'Appointments', href: '/admin/dashboard/appointments' },
    { name: 'Add Product', href: '/admin/dashboard/add-product' },
    { name: 'Products', href: '/admin/dashboard/manage-products' }
  ]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="md:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold">
              +
            </div>
            <div>
              <p className="text-sm text-gray-500">Admin Panel</p>
              <p className="text-lg font-semibold text-gray-900 leading-tight">HealthPlus</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 overflow-x-auto flex-1 pl-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 px-3 sm:px-5 md:px-6 lg:px-10 xl:px-12 py-6 max-w-screen-2xl w-full mx-auto"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}

export default AdminDashboard







