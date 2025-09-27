import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './state/AuthContext.jsx'
import About from './pages/About.jsx'
import FAQ from './pages/FAQ.jsx'
import Home from './pages/Home.jsx'
import Contact from './pages/Contact.jsx'
import Terms from './pages/Terms.jsx'
import MyRegistrations from './pages/MyRegistrations.jsx'
import AdminRegistrations from './pages/AdminRegistrations.jsx'
import ExamDetails from './pages/ExamDetails.jsx'

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="content">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace /> : <Register />}
            />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />

            <Route
              path="/student"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/registrations"
              element={
                <ProtectedRoute role="admin">
                  <AdminRegistrations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/registrations"
              element={
                <ProtectedRoute role="student">
                  <MyRegistrations />
                </ProtectedRoute>
              }
            />

            {/* Exam details accessible if authenticated (student or admin) */}
            <Route
              path="/exams/:id"
              element={
                user ? <ExamDetails /> : <Navigate to="/login" state={{ from: location }} replace />
              }
            />

            <Route
              path="/"
              element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} state={{ from: location }} replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </>
  )
}
