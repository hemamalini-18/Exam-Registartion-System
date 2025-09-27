import React from 'react'

export default function ExamList({ exams, onRegister, showRegister, registeredIds }) {
  const hasRegistered = (examId) => {
    if (!registeredIds) return false
    if (registeredIds instanceof Set) return registeredIds.has(examId)
    return Array.isArray(registeredIds) && registeredIds.includes(examId)
  }
  return (
    <div className="card">
      <h3>Available Exams</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Seats</th>
            {showRegister && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {exams.map(exam => (
            <tr key={exam._id}>
              <td>{exam.name}</td>
              <td>{new Date(exam.date).toLocaleString()}</td>
              <td>{exam.durationMinutes} min</td>
              <td>{exam.availableSeats ?? exam.totalSeats}</td>
              {showRegister && (
                <td>
                  {hasRegistered(exam._id) ? (
                    <span className="badge">Already registered</span>
                  ) : (
                    <button className="btn" onClick={() => onRegister(exam)} disabled={(exam.availableSeats ?? 0) <= 0}>Register</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
