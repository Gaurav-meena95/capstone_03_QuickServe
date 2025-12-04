import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('accessToken')
  const userRole = localStorage.getItem('userRole')

  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return children
}