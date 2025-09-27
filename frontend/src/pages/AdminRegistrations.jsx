import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'
import './AdminDashboard.css'

export default function AdminRegistrations() {
  const [exams, setExams] = useState([])
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedExamId, setSelectedExamId] = useState('')
  const [openAppId, setOpenAppId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [exRes, regRes] = await Promise.all([
        api.get('/exams'),
        api.get('/registrations')
      ])
      setExams(exRes.data)
      setRegs(regRes.data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (reg) => {
    setError('')
    try {
      await api.patch(`/registrations/${reg._id}/approve`)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Approve failed')
    }
  }

  const handleCancel = async (reg) => {
    setError('')
    try {
      await api.patch(`/registrations/${reg._id}/cancel`)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Cancel failed')
    }
  }

  const handleIssueHallTicket = async (reg) => {
    setError('')
    try {
      await api.patch(`/registrations/${reg._id}/hall-ticket`)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Issue failed')
    }
  }

  const stats = useMemo(() => {
    const byExam = new Map()
    for (const r of regs) {
      const id = r.exam?._id || 'unknown'
      if (!byExam.has(id)) byExam.set(id, { total: 0, pending: 0, approved: 0, cancelled: 0, exam: r.exam })
      const s = byExam.get(id)
      s.total += 1
      if (r.status === 'pending') s.pending += 1
      if (r.status === 'approved') s.approved += 1
      if (r.status === 'cancelled') s.cancelled += 1
    }
    return Array.from(byExam.values())
  }, [regs])

  const total = regs.length

  return (
    <div className="admin-page">
      <div className="card admin-card">
        <h2>Registrations Overview</h2>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}

      {!loading && (
        <>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 8 }}>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden>🧾</div>
              <div className="stat-value">{total}</div>
              <div className="stat-label">Total Registrations</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden>✅</div>
              <div className="stat-value">{regs.filter(r => r.status === 'approved').length}</div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden>⏳</div>
              <div className="stat-value">{regs.filter(r => r.status === 'pending').length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="my-2" style={{ marginTop: 16 }}>
            <button className="btn small" onClick={load}>Refresh</button>
          </div>

          <div className="card admin-card" style={{ marginTop: 12 }}>
            <h3>By Exam</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Total</th>
                  <th>Approved</th>
                  <th>Pending</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {stats.length === 0 && (
                  <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>No registrations yet.</td></tr>
                )}
                {stats.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.exam?.name || 'Unknown Exam'}</td>
                    <td>{s.total}</td>
                    <td>{s.approved}</td>
                    <td>{s.pending}</td>
                    <td>{s.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card admin-card" style={{ marginTop: 12 }}>
            <h3>All Registrations</h3>
            <div className="grid" style={{ marginTop: 8 }}>
              <label>
                <span>Filter by exam</span>
                <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)}>
                  <option value="">All</option>
                  {exams.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <table className="table" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Hall Ticket</th>
                  <th>Application</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(selectedExamId ? regs.filter(r => r.exam?._id === selectedExamId) : regs).map(r => (
                  <React.Fragment key={r._id}>
                    <tr>
                      <td>{r.user?.name} ({r.user?.email})</td>
                      <td>{r.exam?.name}</td>
                      <td>{r.exam?.date ? new Date(r.exam.date).toLocaleString() : '-'}</td>
                      <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                      <td>{r.hallTicket?.number ? <span className="badge approved">{r.hallTicket.number}</span> : '-'}</td>
                      <td>
                        <button className="btn small ghost" onClick={() => setOpenAppId(openAppId === r._id ? null : r._id)}>
                          {openAppId === r._id ? 'Hide' : 'View'}
                        </button>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className={`btn small ${r.status === 'approved' ? 'state-done' : 'action-approve'}`}
                            onClick={() => handleApprove(r)}
                            disabled={r.status === 'approved'}
                          >
                            {r.status === 'approved' ? 'Approved' : 'Approve'}
                          </button>
                          <button className="btn small danger" onClick={() => handleCancel(r)} disabled={r.status === 'cancelled'}>
                            {r.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                          </button>
                          {r.hallTicket?.number ? (
                            <button className="btn small state-issued" disabled>Already issued</button>
                          ) : (
                            <button className="btn small action-issue" onClick={() => handleIssueHallTicket(r)} disabled={r.status !== 'approved'}>Issue Hall Ticket</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {openAppId === r._id && (
                      <tr>
                        <td colSpan={7}>
                          <div className="card" style={{ marginTop: 8 }}>
                            <strong>Application Details</strong>
                            <div className="grid" style={{ marginTop: 8 }}>
                              <div><strong>Full name:</strong> {r.application?.fullName || '-'}</div>
                              <div><strong>DOB:</strong> {r.application?.dob ? new Date(r.application.dob).toLocaleDateString() : '-'}</div>
                              <div><strong>Phone:</strong> {r.application?.phone || '-'}</div>
                              <div><strong>Education:</strong> {r.application?.education || '-'}</div>
                              <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {r.application?.address || '-'}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  )
}
