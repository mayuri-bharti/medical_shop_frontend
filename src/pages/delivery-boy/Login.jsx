import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Lock, Phone } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const DeliveryBoyLogin = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!phone || !password) {
      toast.error('Please enter phone and password')
      return
    }

    if (phone.length !== 10) {
      toast.error('Phone must be 10 digits')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/delivery-boy/auth/login', {
        phone,
        password
      })

      if (response.data.success) {
        // Store delivery boy token
        const token = response.data.data.token
        localStorage.setItem('deliveryBoyToken', token)
        sessionStorage.setItem('deliveryBoyToken', token)
        localStorage.setItem('userRole', 'DELIVERY_BOY')
        sessionStorage.setItem('userRole', 'DELIVERY_BOY')

        toast.success('Login successful!')
        navigate('/delivery-boy/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Truck size={32} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Boy Login</h1>
          <p className="text-gray-600 mt-2">Access your delivery dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter 10-digit phone"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Logging in...
              </>
            ) : (
              <>
                <Truck size={20} />
                Login
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/admin/login" className="text-sm text-gray-600 hover:text-orange-600">
            Admin Login
          </a>
        </div>
      </div>
    </div>
  )
}

export default DeliveryBoyLogin

