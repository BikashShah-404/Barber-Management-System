import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { PageLoader } from './components/ui/Spinner'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Shops from './pages/Shops'
import ShopDetail from './pages/ShopDetail'
import Nearest from './pages/Nearest'
import About from './pages/About'
import Services from './pages/Services'
import Pricing from './pages/Pricing'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import UserDashboard from './pages/user/Dashboard'
import BarberDashboard from './pages/barber/BarberDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) {
    const dest =
      user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'
    return <Navigate to={dest} replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-center" richColors closeButton />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shops" element={<Shops />} />
            <Route path="shops/:id" element={<ShopDetail />} />
            <Route path="nearest" element={<Nearest />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="contact" element={<Contact />} />
            <Route
              path="login"
              element={
                <PublicOnly>
                  <Login />
                </PublicOnly>
              }
            />
            <Route
              path="register"
              element={
                <PublicOnly>
                  <Register />
                </PublicOnly>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="barber"
              element={
                <ProtectedRoute roles={['barber']}>
                  <BarberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
