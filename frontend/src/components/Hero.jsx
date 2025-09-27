import React from 'react'

export default function Hero({ onBrowse }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">Your Gateway to <span className="accent">Excellence</span></h1>
        <p className="hero-sub">Register for competitive examinations with ease. Secure, transparent, and
          efficient exam registration platform for your career advancement.</p>
        <div className="hero-actions">
          <button className="btn" onClick={onBrowse}>Browse Exams →</button>
          <a className="btn ghost" href="#why">Learn More</a>
        </div>
      </div>
    </section>
  )
}
