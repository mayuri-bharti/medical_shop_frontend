import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, ShoppingBag, Package, TrendingUp, DollarSign } from 'lucide-react'
import { getUsers, getOrders, getAdminProducts } from '../../lib/api'

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        getUsers({ limit: 1 }),
        getOrders({ limit: 1 }),
        getAdminProducts({ limit: 1 })
      ])

      const totalRevenue = ordersRes.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      setStats({
        users: usersRes.pagination?.total || 0,
        orders: ordersRes.pagination?.total || 0,
        products: productsRes.data?.pagination?.total || 0,
        totalRevenue
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Total Orders',
      value: stats.orders,
      icon: ShoppingBag,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Total Products',
      value: stats.products,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Total Revenue',
      value: `₹${new Intl.NumberFormat('en-IN').format(stats.totalRevenue)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
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
      className="space-y-5 md:space-y-6 lg:space-y-8"
    >
      {/* Header */}
      <motion.div variants={headerVariants} className="mb-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">Welcome to the admin panel</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              variants={cardVariants}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-5 md:p-6 lg:p-7 border border-gray-100 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs md:text-sm lg:text-base font-medium text-gray-600 mb-2">{stat.name}</p>
                  {loading ? (
                    <div className="h-7 md:h-8 lg:h-9 w-20 md:w-24 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900"
                    >
                      {stat.value}
                    </motion.p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`${stat.bgColor} p-3 md:p-4 rounded-xl flex-shrink-0 shadow-sm`}
                >
                  <Icon className={`${stat.color} text-white w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8`} />
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-5 md:p-6 lg:p-8"
      >
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-5 lg:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {[
            { href: '/admin/dashboard/users', icon: Users, title: 'Manage Users', desc: 'View and manage all users' },
            { href: '/admin/dashboard/orders', icon: ShoppingBag, title: 'Manage Orders', desc: 'View and filter orders' },
            { href: '/admin/dashboard/add-product', icon: Package, title: 'Add Product', desc: 'Create a new product' }
          ].map((action, index) => {
            const Icon = action.icon
            return (
              <motion.a
                key={action.href}
                href={action.href}
                variants={cardVariants}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className="group p-5 md:p-6 border-2 border-gray-200 rounded-xl hover:border-medical-500 hover:bg-medical-50 transition-all duration-300 hover:shadow-lg block"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Icon className="text-medical-600 mb-3" size={28} />
                </motion.div>
                <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1">{action.title}</h3>
                <p className="text-sm md:text-base text-gray-500">{action.desc}</p>
              </motion.a>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AdminDashboardHome







