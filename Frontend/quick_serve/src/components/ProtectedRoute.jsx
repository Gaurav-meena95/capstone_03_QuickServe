import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('accessToken')
  const userRole = localStorage.getItem('userRole')

  // Agar token nahi hai, login pe redirect
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Agar specific role chahiye (like SHOPKEEPER) aur user ka role match nahi karta
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return children
}