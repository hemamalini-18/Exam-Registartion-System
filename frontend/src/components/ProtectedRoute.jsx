import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function ProtectedRoute({ children, role, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="center">
      <div className="spinner" aria-label="Loading" />
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const allowedRoles = roles || (role ? [role] : null)
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
