import React from 'react'

export default function ExamList({ exams, onRegister, showRegister }) {
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
                  <button className="btn" onClick={() => onRegister(exam)} disabled={(exam.availableSeats ?? 0) <= 0}>Register</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
