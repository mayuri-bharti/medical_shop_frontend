import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, ShoppingBag, Package, TrendingUp, DollarSign, UserPlus, Shield, Calendar } from 'lucide-react'
import { getUsers, getOrders, getAdminProducts } from '../../lib/api'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const AdminDashboardHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    totalRevenue: 0,
    todayOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    phone: '',
    name: '',
    username: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Get today's date range (start and end of today)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today
      const endOfToday = new Date()
      endOfToday.setHours(23, 59, 59, 999) // End of today

      const [usersRes, ordersRes, productsRes, todayOrdersRes] = await Promise.all([
        getUsers({ limit: 1 }),
        getOrders({ limit: 1 }),
        getAdminProducts({ limit: 1 }),
        // Fetch today's orders
        api.get('/admin/orders', {
          params: {
            startDate: today.toISOString(),
            endDate: endOfToday.toISOString(),
            limit: 1
          }
        }).catch(err => {
          console.error('Failed to fetch today\'s orders:', err)
          return { data: { pagination: { total: 0 } } }
        })
      ])

      const totalRevenue = ordersRes.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      setStats({
        users: usersRes.pagination?.total || 0,
        orders: ordersRes.pagination?.total || 0,
        products: productsRes.data?.pagination?.total || 0,
        totalRevenue,
        todayOrders: todayOrdersRes?.data?.pagination?.total || 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    
    if (!adminForm.phone || !adminForm.name || !adminForm.username || !adminForm.email || !adminForm.password) {
      toast.error('All fields are required')
      return
    }

    if (adminForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setCreatingAdmin(true)
    try {
      const response = await api.post('/admin/users/create-admin', adminForm)
      
      if (response.data.success) {
        toast.success('Admin created successfully!')
        setAdminForm({
          phone: '',
          name: '',
          username: '',
          email: '',
          password: ''
        })
        setShowCreateAdminForm(false)
        // Refresh stats to update user count
        fetchStats()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create admin'
      toast.error(message)
    } finally {
      setCreatingAdmin(false)
    }
  }

  const handleCardClick = (cardName) => {
    switch (cardName) {
      case 'Total Users':
        navigate('/admin/dashboard/users')
        break
      case 'Total Orders':
        navigate('/admin/dashboard/orders')
        break
      case "Today's Orders":
        // Navigate to orders page with today's date filter
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)
        navigate(`/admin/dashboard/orders?startDate=${today.toISOString()}&endDate=${endOfToday.toISOString()}`)
        break
      case 'Total Products':
        navigate('/admin/dashboard/manage-products')
        break
      case 'Total Revenue':
        navigate('/admin/dashboard/orders')
        break
      default:
        break
    }
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      onClick: () => handleCardClick('Total Users')
    },
    {
      name: 'Total Orders',
      value: stats.orders,
      icon: ShoppingBag,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      onClick: () => handleCardClick('Total Orders')
    },
    {
      name: "Today's Orders",
      value: stats.todayOrders,
      icon: Calendar,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      onClick: () => handleCardClick("Today's Orders")
    },
    {
      name: 'Total Products',
      value: stats.products,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      onClick: () => handleCardClick('Total Products')
    },
    {
      name: 'Total Revenue',
      value: `₹${new Intl.NumberFormat('en-IN').format(stats.totalRevenue)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      onClick: () => handleCardClick('Total Revenue')
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={headerVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Monitor and manage your medical shop operations</p>
        </div>
        <button
          onClick={() => setShowCreateAdminForm(!showCreateAdminForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
        >
          <UserPlus size={18} />
          <span>Create Admin</span>
        </button>
      </motion.div>

      {/* Create Admin Form */}
      {showCreateAdminForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Admin</h2>
              <p className="text-sm text-gray-500">Add a new administrator to the system</p>
            </div>
          </div>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-400"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-400"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-400"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-400"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-400"
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowCreateAdminForm(false)
                  setAdminForm({
                    phone: '',
                    name: '',
                    username: '',
                    email: '',
                    password: ''
                  })
                }}
                className="flex-1 px-5 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingAdmin}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
              >
                {creatingAdmin ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.name}
                variants={cardVariants}
                whileHover={{ 
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                onClick={stat.onClick}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 cursor-pointer overflow-hidden relative"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{stat.name}</p>
                    {loading ? (
                      <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="text-2xl lg:text-3xl font-bold text-gray-900"
                      >
                        {stat.value}
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className={`${stat.bgColor} p-3 rounded-xl flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}
                  >
                    <Icon className={`${stat.color} text-white w-6 h-6`} />
                  </motion.div>
                </div>
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-1">Common administrative tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/admin/dashboard/users', icon: Users, title: 'Manage Users', desc: 'View and manage all registered users', color: 'blue' },
            { href: '/admin/dashboard/orders', icon: ShoppingBag, title: 'Manage Orders', desc: 'View, filter, and update order status', color: 'green' },
            { href: '/admin/dashboard/add-product', icon: Package, title: 'Add Product', desc: 'Create and add new products to inventory', color: 'purple' }
          ].map((action, index) => {
            const Icon = action.icon
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
              green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
              purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
            }
            return (
              <motion.a
                key={action.href}
                href={action.href}
                variants={cardVariants}
                whileHover={{ 
                  y: -4,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`group relative p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg block ${colorClasses[action.color]}`}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="flex-shrink-0"
                  >
                    <div className={`p-3 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow`}>
                      <Icon size={24} />
                    </div>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base mb-1.5 group-hover:text-gray-950">{action.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{action.desc}</p>
                  </div>
                </div>
                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.a>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AdminDashboardHome







