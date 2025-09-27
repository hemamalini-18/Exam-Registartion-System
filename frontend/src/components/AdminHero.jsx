import React from 'react'

export default function AdminHero({ onGoExams, onGoRegs }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">Admin Control <span className="accent">Center</span></h1>
        <p className="hero-sub">Oversee examinations, manage registrations, and maintain a secure and efficient registration platform.</p>
        <div className="hero-actions">
          <button className="btn" onClick={onGoExams}>Manage Exams →</button>
          <button className="btn ghost" onClick={onGoExams}>Create</button>
        </div>
      </div>
    </section>
  )
}
