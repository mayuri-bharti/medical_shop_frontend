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
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [revenueByStatus, setRevenueByStatus] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard/stats')
      const data = response.data?.data || {}
      const totals = data.totals || {}

      setStats({
        totalProducts: Number(totals.products) || 0,
        totalUsers: Number(totals.users) || 0,
        totalOrders: Number(totals.orders) || 0,
        totalRevenue: Number(totals.revenue) || 0
      })
      setRecentOrders(Array.isArray(data.recentOrders) ? data.recentOrders : [])
      setTopProducts(Array.isArray(data.topProducts) ? data.topProducts : [])
      setRevenueByStatus(data.revenueByStatus || {})
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

  const formatCurrency = (value) => {
    const amount = Number(value) || 0
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
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
      value: formatCurrency(stats.totalRevenue),
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

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/dashboard/orders')}
              className="text-sm text-medical-600 hover:text-medical-700 font-medium"
            >
              View All
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-100 rounded-lg p-4 hover:border-medical-200 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.orderNumber || 'Order'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer?.name || 'Unknown customer'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                        {formatStatus(order.status)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                        {formatStatus(order.paymentStatus)}
                      </span>
                    </span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No product sales yet.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.productId} className="flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {product.name || 'Unnamed product'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.quantity} units sold
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {Object.keys(revenueByStatus).length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue by Status</h3>
              <div className="space-y-2">
                {Object.entries(revenueByStatus).map(([status, data]) => (
                  <div key={status} className="flex justify-between text-sm text-gray-600">
                    <span>{formatStatus(status)}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(data.revenue)} • {data.orders} orders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardHome

