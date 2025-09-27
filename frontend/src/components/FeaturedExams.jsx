import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FeaturedExams({ exams = [], onRegister, onViewAll, registeredIds }) {
  const [openId, setOpenId] = useState(null)
  const navigate = useNavigate()
  const hasRegistered = (examId) => {
    if (!registeredIds) return false
    if (registeredIds instanceof Set) return registeredIds.has(examId)
    return Array.isArray(registeredIds) && registeredIds.includes(examId)
  }
  return (
    <section className="featured">
      <h2 className="section-title">Featured Examinations</h2>
      <p className="section-sub">Discover the most popular competitive examinations with open registrations</p>

      <div className="card-grid">
        {exams.map(exam => (
          <article key={exam._id} className="exam-card">
            <header className="exam-head">
              <h3 className="exam-title">{exam.name}</h3>
              <span className={`pill ${exam.availableSeats > 0 ? 'open' : 'closed'}`}>{exam.availableSeats > 0 ? 'Open' : 'Closed'}</span>
            </header>
            <ul className="exam-meta">
              <li><span>Category</span><strong>{exam.category || 'General'}</strong></li>
              <li><span>Seats</span><strong>{exam.availableSeats ?? exam.totalSeats}</strong></li>
              <li><span>Exam Date</span><strong>{exam.date ? new Date(exam.date).toLocaleDateString() : '-'}</strong></li>
              <li><span>Deadline</span><strong>{exam.deadline ? new Date(exam.deadline).toLocaleDateString() : '-'}</strong></li>
            </ul>
            <div className="exam-actions">
              {hasRegistered(exam._id) ? (
                <span className="badge">Already registered</span>
              ) : (
                <button className="btn" onClick={() => onRegister?.(exam)} disabled={(exam.availableSeats ?? 0) <= 0}>Apply Now</button>
              )}
              <button className="btn ghost" onClick={() => navigate(`/exams/${exam._id}`)}>View Details</button>
            </div>
          </article>
        ))}
      </div>

      <div className="center">
        <button className="btn ghost" onClick={onViewAll}>View All Exams</button>
      </div>
    </section>
  )
}
