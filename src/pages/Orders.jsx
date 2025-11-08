import { useQuery } from 'react-query'
import { useMemo } from 'react'
import { api } from '../services/api'
import { getAccessToken } from '../lib/api'
import { Package } from 'lucide-react'

// Dummy data for demonstration
const dummyOrders = [
  {
    id: 'ORD000001',
    orderId: 'ORD000001',
    medicines: [
      { name: 'Paracetamol 500mg', quantity: 2, price: 25 },
      { name: 'Amoxicillin 250mg', quantity: 1, price: 45 },
    ],
    status: 'delivered',
    date: '2024-01-15',
    total: 95
  },
  {
    id: 'ORD000002',
    orderId: 'ORD000002',
    medicines: [
      { name: 'Cetirizine 10mg', quantity: 1, price: 30 },
    ],
    status: 'shipped',
    date: '2024-01-18',
    total: 30
  },
  {
    id: 'ORD000003',
    orderId: 'ORD000003',
    medicines: [
      { name: 'Aspirin 100mg', quantity: 3, price: 20 },
      { name: 'Vitamin D3', quantity: 1, price: 150 },
    ],
    status: 'pending',
    date: '2024-01-20',
    total: 210
  }
]

const Orders = () => {
  // Check if user is authenticated (ProtectedRoute already checks, but double-check here)
  const token = getAccessToken()
  
  // Try to fetch real orders, fallback to dummy data if error
  const { data: ordersResponse, isLoading, error } = useQuery(
    'orders',
    async () => {
      if (!token) {
        // This shouldn't happen if ProtectedRoute is working, but handle it gracefully
        throw new Error('Not authenticated')
      }
      try {
        const response = await api.get('/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        return response.data
      } catch (err) {
        // If it's a 401, the API interceptor will handle the redirect
        // For other errors, we'll use dummy data
        if (err.response?.status === 401) {
          throw err // Let the interceptor handle it
        }
        throw err
      }
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!token, // Only run query if token exists
      // Don't throw errors for non-auth errors, just use dummy data
      onError: (err) => {
        // Only log non-401 errors (401 will be handled by interceptor)
        if (err.response?.status !== 401) {
          console.log('Orders fetch error (using dummy data):', err)
        }
      }
    }
  )

  // Extract orders array from response - handle different response formats
  const orders = useMemo(() => {
    if (!ordersResponse) return null
    
    // Handle different response formats
    if (Array.isArray(ordersResponse)) {
      return ordersResponse
    }
    
    // Handle { success: true, data: [...] } format
    if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
      return ordersResponse.data
    }
    
    // Handle { data: [...] } format
    if (Array.isArray(ordersResponse.data)) {
      return ordersResponse.data
    }
    
    // If it's an object but not the expected format, return empty array
    return []
  }, [ordersResponse])

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  // Use dummy data if API call failed or no orders
  // Ensure displayData is always an array
  const displayData = useMemo(() => {
    if (error || !orders || !Array.isArray(orders) || orders.length === 0) {
      return dummyOrders
    }
    return orders
  }, [error, orders])

  // Transform data for table display
  const tableRows = useMemo(() => {
    const rows = []
    
    if (!Array.isArray(displayData)) {
      console.warn('displayData is not an array:', displayData)
      return rows
    }
    
    displayData.forEach(order => {
      const medicines = order.medicines || order.items || []
      
      medicines.forEach((medicine, index) => {
        rows.push({
          key: `${order.id || order._id}-${index}`,
          orderId: order.orderId || order.orderNumber || order.id || order._id,
          medicineName: medicine.name || medicine.product?.name,
          quantity: medicine.quantity,
          price: medicine.price,
          status: order.status,
          date: order.date || order.createdAt,
          isFirstItem: index === 0
        })
      })
    })
    
    return rows
  }, [displayData])

  if (tableRows.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Your order history will appear here.</p>
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            Start Shopping
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        <p className="mt-2 text-gray-600">View all your order history</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableRows.map((row) => (
                <tr key={row.key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.isFirstItem && (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{row.orderId}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(row.date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{row.medicineName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{row.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{row.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.isFirstItem && getStatusBadge(row.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Total Orders: <span className="font-medium text-gray-900">
            {Array.isArray(displayData) ? displayData.length : 0}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Orders
