import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>Exam Registration</strong>
          <div className="footer-desc">A simple portal to browse exams and register online.</div>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>
      <div className="footer-copy">© {new Date().getFullYear()} Exam Registration</div>
    </footer>
  )
}
