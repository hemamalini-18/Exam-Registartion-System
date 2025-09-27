import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <div className="card">
        <h2>Welcome to Exam Registration</h2>
        <p>Discover upcoming exams, apply online with a guided form, and track approvals and hall tickets in one place.</p>
        <div className="grid" style={{marginTop:12}}>
          <div className="card">
            <h3>For Students</h3>
            <ul>
              <li>Browse detailed exam information</li>
              <li>Apply in minutes with a simple application</li>
              <li>Track approval and hall ticket status</li>
            </ul>
            <Link to="/register" className="btn">Get Started</Link>
          </div>
          <div className="card">
            <h3>For Admins</h3>
            <ul>
              <li>Create and manage exams and seats</li>
              <li>Approve or cancel registrations</li>
              <li>Issue hall tickets</li>
            </ul>
            <Link to="/login" className="btn secondary">Admin Login</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Key Features</h3>
        <div className="grid" style={{marginTop:8}}>
          <div className="card">
            <strong>Role-based dashboards</strong>
            <p style={{marginTop:8}}>Clean separation for Students and Admins with protected routes and JWT auth.</p>
          </div>
          <div className="card">
            <strong>Application & approvals</strong>
            <p style={{marginTop:8}}>Students submit applications; admins review, approve and issue hall tickets.</p>
          </div>
          <div className="card">
            <strong>Modern UI</strong>
            <p style={{marginTop:8}}>Readable, responsive design with tables, badges, and friendly forms.</p>
          </div>
          <div className="card">
            <strong>Audit and capacity checks</strong>
            <p style={{marginTop:8}}>Admin actions are logged; seat limits are respected on approvals.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>How it works</h3>
        <ol>
          <li>Sign up or log in as a Student.</li>
          <li>Choose your exam and submit the application form.</li>
          <li>Admins review and approve registrations based on seats.</li>
          <li>Receive your hall ticket in the My Registrations section.</li>
        </ol>
      </div>
    </>
  )
}
