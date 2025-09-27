import React from 'react'

export default function PendingApprovals({ regs = [], onApprove, onCancel, onIssue }) {
  const pending = regs.filter(r => r.status === 'pending')

  return (
    <section className="card" id="admin-registrations">
      <h3>Pending Approvals</h3>
      {pending.length === 0 ? (
        <div className="center" style={{ minHeight: 80 }}>No pending registrations.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.map(r => (
              <tr key={r._id}>
                <td>{r.user?.name} ({r.user?.email})</td>
                <td>{r.exam?.name}</td>
                <td>{r.exam?.date ? new Date(r.exam.date).toLocaleString() : '-'}</td>
                <td>
                  <div className="actions">
                    <button className="btn small" onClick={() => onApprove(r)}>Approve</button>
                    <button className="btn small danger" onClick={() => onCancel(r)}>Cancel</button>
                    <button className="btn small" onClick={() => onIssue(r)} disabled>Issue Hall Ticket</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
