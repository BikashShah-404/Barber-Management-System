import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './ui/Spinner'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuth } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    const dest =
      user.role === 'admin' ? '/admin' : user.role === 'barber' ? '/barber' : '/dashboard'
    return <Navigate to={dest} replace />
  }

  return children
}
