import { useState, useEffect } from 'react'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  {loading ? (
                    <div className="mt-2 h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${stat.color} text-white`} size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/dashboard/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-medical-500 hover:bg-medical-50 transition-colors"
          >
            <Users className="text-medical-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage all users</p>
          </a>
          <a
            href="/admin/dashboard/orders"
            className="p-4 border border-gray-200 rounded-lg hover:border-medical-500 hover:bg-medical-50 transition-colors"
          >
            <ShoppingBag className="text-medical-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">Manage Orders</h3>
            <p className="text-sm text-gray-500 mt-1">View and filter orders</p>
          </a>
          <a
            href="/admin/dashboard/add-product"
            className="p-4 border border-gray-200 rounded-lg hover:border-medical-500 hover:bg-medical-50 transition-colors"
          >
            <Package className="text-medical-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">Add Product</h3>
            <p className="text-sm text-gray-500 mt-1">Create a new product</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardHome



