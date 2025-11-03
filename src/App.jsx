import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import AdminLoginWithProduct from './pages/AdminLoginWithProduct'
import VerifyOtp from './pages/VerifyOtp'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductList from './pages/ProductList'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderSuccess from './pages/OrderSuccess'
import Prescriptions from './pages/Prescriptions'
import Profile from './pages/Profile'
import AdminProducts from './pages/AdminProducts'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import AdminDashboardHome from './pages/AdminDashboardHome'
import AdminAddProduct from './pages/AdminAddProduct'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLoginWithProduct />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products-list" element={<ProductList />} />

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
        {/* Admin Dashboard Routes */}
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }>
          <Route index element={<AdminDashboardHome />} />
          <Route path="add-product" element={<AdminAddProduct />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>

        {/* User Dashboard Route */}
        <Route path="/user/dashboard" element={
          <UserProtectedRoute>
            <UserDashboard />
          </UserProtectedRoute>
        } />

        {/* Legacy Admin Products Route (redirect) */}
        <Route path="/admin/products" element={
          <AdminProtectedRoute>
            <Navigate to="/admin/dashboard/products" replace />
          </AdminProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
