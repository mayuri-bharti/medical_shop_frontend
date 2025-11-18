import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import LoginSuccessAnimation from './components/LoginSuccessAnimation'
import OrderSuccessAnimation from './components/OrderSuccessAnimation'


// Lazy load components for code splitting
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const ProductList = lazy(() => import('./pages/ProductList'))
const AllMedicine = lazy(() => import('./pages/AllMedicine'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Prescriptions = lazy(() => import('./pages/Prescriptions'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminProducts = lazy(() => import('./pages/AdminProducts'))
const Subcategory = lazy(() => import('./pages/Subcategory'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const MedicineDetails = lazy(() => import('./pages/MedicineDetails'))
const DoctorAppointment = lazy(() => import('./pages/DoctorAppointment'))
const LabTests = lazy(() => import('./pages/LabTests'))
const HealthInsurance = lazy(() => import('./pages/HealthInsurance'))

// Admin Pages - Lazy loaded
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminDashboardHome = lazy(() => import('./pages/admin/DashboardHome'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminPrescriptions = lazy(() => import('./pages/admin/Prescriptions'))
const AdminAddProduct = lazy(() => import('./pages/admin/AddProduct'))
const AdminManageProducts = lazy(() => import('./pages/admin/ManageProducts'))
const AdminEditProduct = lazy(() => import('./pages/admin/EditProduct'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
  </div>
)

function App() {
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('loginSuccess') === '1') {
      sessionStorage.removeItem('loginSuccess')
      setShowLoginSuccess(true)
    }
    if (sessionStorage.getItem('orderSuccess') === '1') {
      sessionStorage.removeItem('orderSuccess')
      setShowOrderSuccess(true)
    }
  }, [location.key])

  return (
    <Layout>
      <LoginSuccessAnimation
        show={showLoginSuccess}
        onClose={() => {
          setShowLoginSuccess(false)
          const target = sessionStorage.getItem('redirectAfterSuccess')
          if (target) {
            sessionStorage.removeItem('redirectAfterSuccess')
            navigate(target)
          }
        }}
      />
      <OrderSuccessAnimation
        show={showOrderSuccess}
        onClose={() => {
          setShowOrderSuccess(false)
          const target = sessionStorage.getItem('redirectAfterSuccess')
          if (target) {
            sessionStorage.removeItem('redirectAfterSuccess')
            navigate(target)
          }
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyOtp />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products-list" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/all-medicine" element={<AllMedicine />} />
          <Route path="/lab-tests" element={<LabTests />} />
          <Route path="/doctor-appointment" element={<DoctorAppointment />} />
          <Route path="/health-insurance" element={<HealthInsurance />} />
          <Route path="/subcategory/:slug" element={<Subcategory />} />

          {/* Protected Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id/track" element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          } />
          <Route path="/medicine/:id" element={
            <ProtectedRoute>
              <MedicineDetails />
            </ProtectedRoute>
          } />
          <Route path="/prescriptions" element={
            <ProtectedRoute>
              <Prescriptions />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }>
            <Route index element={<AdminDashboardHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="prescriptions" element={<AdminPrescriptions />} />
            <Route path="add-product" element={<AdminAddProduct />} />
            <Route path="manage-products" element={<AdminManageProducts />} />
            <Route path="edit-product/:id" element={<AdminEditProduct />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App 