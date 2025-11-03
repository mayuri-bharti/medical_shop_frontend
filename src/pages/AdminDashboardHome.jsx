import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users, ShoppingBag, DollarSign, Plus, Save, X } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const AdminDashboardHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch products
      const productsRes = await api.get('/products', { params: { limit: 1 } })
      const totalProducts = productsRes.data?.pagination?.total || 0

      // Fetch users
      const usersRes = await api.get('/admin/users', { params: { limit: 1 } })
      const totalUsers = usersRes.data?.pagination?.total || 0

      // Fetch orders
      const ordersRes = await api.get('/admin/orders', { params: { limit: 1 } })
      const totalOrders = ordersRes.data?.pagination?.total || 0
      
      // Calculate revenue (completed orders)
      let totalRevenue = 0
      if (ordersRes.data?.orders) {
        totalRevenue = ordersRes.data.orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      }

      setStats({
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-medical-600',
      bgColor: 'bg-medical-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your medical shop.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`${stat.color} text-white`} size={32} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/dashboard/products')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-medical-600 hover:bg-medical-50 transition-colors text-left w-full"
          >
            <Package className="text-medical-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">View Products</p>
              <p className="text-sm text-gray-600">Manage your product inventory</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/add-product')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-medical-600 hover:bg-medical-50 transition-colors text-left w-full"
          >
            <Package className="text-medical-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-sm text-gray-600">Add a new product to store</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/users')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-medical-600 hover:bg-medical-50 transition-colors text-left w-full"
          >
            <Users className="text-medical-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">View Users</p>
              <p className="text-sm text-gray-600">See all registered users</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardHome

