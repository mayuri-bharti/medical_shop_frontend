import { useState, useEffect } from 'react'
import { Users, Search, Phone, Mail, Calendar } from 'lucide-react'
import { getUsers } from '../../lib/api'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      }
      const response = await getUsers(params)
      if (response.success) {
        setUsers(response.users || [])
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">Manage all registered users</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-12 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Users className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 md:px-5 lg:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0 border-2 border-medical-200">
                            <span className="text-medical-700 font-bold text-sm md:text-base">
                              {user.name?.[0]?.toUpperCase() || user.phone?.[0] || 'U'}
                            </span>
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm md:text-base font-semibold text-gray-900 truncate">
                              {user.name || 'User'}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base text-gray-900 flex items-center space-x-2">
                          <Phone size={14} className="flex-shrink-0 text-gray-400" />
                          <span className="truncate max-w-[140px]">{user.phone}</span>
                        </div>
                        {user.email && (
                          <div className="text-xs md:text-sm text-gray-500 flex items-center space-x-2 mt-1.5">
                            <Mail size={14} className="flex-shrink-0 text-gray-400" />
                            <span className="truncate max-w-[140px]">{user.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role || 'USER'}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base text-gray-900 flex items-center space-x-2">
                          <Calendar size={14} className="flex-shrink-0 text-gray-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full ${
                          user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user._id} className="p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-full bg-medical-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-medical-700 font-semibold text-lg">
                        {user.name?.[0]?.toUpperCase() || user.phone?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{user.name || 'User'}</h3>
                      <p className="text-xs text-gray-500">ID: {user._id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-900 break-all">{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role || 'USER'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-sm md:text-base text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminUsers







