import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './state/AuthContext.jsx'

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="container">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace /> : <Register />} />
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} state={{ from: location }} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
