import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full py-6"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}

export default AdminDashboard







