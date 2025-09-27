import React, { useEffect, useState } from 'react'
import api from '../api/client.js'
import ExamForm from '../components/ExamForm.jsx'
import AdminHero from '../components/AdminHero.jsx'
import AdminStats from '../components/AdminStats.jsx'
import PendingApprovals from '../components/PendingApprovals.jsx'
 
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [exams, setExams] = useState([])
  const [editing, setEditing] = useState(null)
  const [regs, setRegs] = useState([])
  const [selectedExamId, setSelectedExamId] = useState('')
  const [tab, setTab] = useState('exams')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [openAppId, setOpenAppId] = useState(null)

  // Create User form state (admin only)
  const [uName, setUName] = useState('')
  const [uEmail, setUEmail] = useState('')
  const [uPassword, setUPassword] = useState('')
  const [uRole, setURole] = useState('student')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const ex = await api.get('/exams')
      setExams(ex.data)
      // Load all registrations initially for overview
      const r = await api.get('/registrations')
      setRegs(r.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (payload) => {
    setError('')
    try {
      await api.post('/exams', payload)
      setMessage('Exam created')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Create failed')
    }
  }

  const handleUpdate = async (payload) => {
    if (!editing) return
    setError('')
    try {
      await api.put(`/exams/${editing._id}`, payload)
      setEditing(null)
      setMessage('Exam updated')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed')
    }
  }

  const handleDelete = async (exam) => {
    if (!confirm(`Delete exam "${exam.name}"? This will remove its registrations.`)) return
    setError('')
    try {
      await api.delete(`/exams/${exam._id}`)
      setMessage('Exam deleted')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed')
    }
  }

  const handleApprove = async (reg) => {
    setError('')
    try {
      await api.patch(`/registrations/${reg._id}/approve`)
      setMessage('Registration approved')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Approve failed')
    }
  }

  const handleCancel = async (reg) => {
    setError('')
    try {
      await api.patch(`/registrations/${reg._id}/cancel`)
      setMessage('Registration cancelled')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Cancel failed')
    }
  }

  const handleIssueHallTicket = async (reg) => {
    setError('')
    try {
      await api.patch(`/registrations/${reg._id}/hall-ticket`)
      setMessage('Hall ticket issued')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Issue failed')
    }
  }

  const filteredRegs = selectedExamId ? regs.filter(r => r.exam?._id === selectedExamId) : regs

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await api.post('/admin/users', { name: uName, email: uEmail, password: uPassword, role: uRole })
      setMessage('User created')
      setUName(''); setUEmail(''); setUPassword(''); setURole('student')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create user')
    }
  }

  const goToExams = () => {
    setTab('exams')
    // Wait for section to render, then scroll
    setTimeout(() => {
      document.getElementById('admin-exams')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const goToRegs = () => {
    setTab('regs')
    setTimeout(() => {
      document.getElementById('admin-registrations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const openTabAndScroll = (name, targetId) => {
    setTab(name)
    // Wait for the section to render, then scroll into view
    setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <div className="admin-page">
      <AdminHero onGoExams={goToExams} onGoRegs={goToRegs} />

      <div className="card admin-card">
        <h2>Admin Dashboard</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        <div className="tabs" role="tablist" aria-label="Admin tabs">
          <button
            className={`tab ${tab === 'exams' ? 'active' : ''}`}
            role="tab"
            aria-selected={tab === 'exams'}
            onClick={() => openTabAndScroll('exams', 'admin-exams')}
          >
            Manage Exams
          </button>
          <button
            className={`tab ${tab === 'regs' ? 'active' : ''}`}
            role="tab"
            aria-selected={tab === 'regs'}
            onClick={() => openTabAndScroll('regs', 'admin-registrations')}
          >
            Registrations
          </button>
          <button
            className={`tab ${tab === 'users' ? 'active' : ''}`}
            role="tab"
            aria-selected={tab === 'users'}
            onClick={() => openTabAndScroll('users', 'admin-users')}
          >
            Users
          </button>
        </div>
      </div>

      {/* Admin Homepage widgets */}
      <div className="card admin-card" id="admin-overview">
        <h3>Overview</h3>
        <AdminStats exams={exams} regs={regs} />
      </div>

      <PendingApprovals regs={regs} onApprove={handleApprove} onCancel={handleCancel} onIssue={handleIssueHallTicket} />

      {tab === 'exams' && (
        <div className="grid-2 admin-section" id="admin-exams">
          <div className="card">
            <h3>{editing ? 'Edit Exam' : 'Create Exam'}</h3>
            <ExamForm onSubmit={editing ? handleUpdate : handleCreate} initial={editing} />
            {editing && <button className="btn secondary" onClick={() => setEditing(null)}>Cancel Edit</button>}
          </div>
          <div className="card">
            <h3>Exams</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Seats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam._id}>
                    <td>{exam.name}</td>
                    <td>{new Date(exam.date).toLocaleString()}</td>
                    <td>{exam.durationMinutes} min</td>
                    <td>{exam.availableSeats ?? exam.totalSeats}</td>
                    <td>
                      <button className="btn small" onClick={() => setEditing(exam)}>Edit</button>
                      <button className="btn small danger" onClick={() => handleDelete(exam)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'regs' && (
    <div className="card admin-card" id="admin-registrations">
      <div className="grid">
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

      <table className="table">
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
          {filteredRegs.map(r => (
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
  )}

      {tab === 'users' && (
        <div className="card admin-card" id="admin-users">
          <h3>Create User</h3>
          <form className="form" onSubmit={handleCreateUser}>
            <label>
              <span>Name</span>
              <input value={uName} onChange={(e) => setUName(e.target.value)} required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={uPassword} onChange={(e) => setUPassword(e.target.value)} required minLength={6} />
            </label>
            <label>
              <span>Role</span>
              <select value={uRole} onChange={(e) => setURole(e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button className="btn" type="submit">Create</button>
          </form>
        </div>
      )}
    </div>
  )
}
