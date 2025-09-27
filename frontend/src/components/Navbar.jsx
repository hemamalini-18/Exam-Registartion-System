import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="brand">
          <span className="logo">ER</span>
          Exam Registration
        </span>
      </div>
      <div className="nav-right">
        {!user && (
          <>
            <div className="nav-group">
              <Link to="/home">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/terms">Terms</Link>
            </div>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user && (
          <>
            {user.role === 'admin' ? (
              <div className="nav-group">
                <Link to="/admin">Admin</Link>
                <Link to="/admin/registrations">Registrations</Link>
              </div>
            ) : (
              <div className="nav-group">
                <Link to="/student">Dashboard</Link>
                <Link to="/student/registrations">My Registrations</Link>
              </div>
            )}
            <span className="user">{user.name} ({user.role})</span>
            <span className="avatar" title={user.name} aria-hidden>
              {(user?.name || '?').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()}
            </span>
            <button className="btn ghost" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
