import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

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
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Prescriptions = lazy(() => import('./pages/Prescriptions'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminProducts = lazy(() => import('./pages/AdminProducts'))
const Subcategory = lazy(() => import('./pages/Subcategory'))

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
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyOtp />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products-list" element={<ProductList />} />
          <Route path="/all-medicine" element={<AllMedicine />} />
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
