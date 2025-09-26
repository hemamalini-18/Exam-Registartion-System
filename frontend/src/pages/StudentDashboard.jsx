import React, { useEffect, useState } from 'react'
import api from '../api/client.js'
import ExamList from '../components/ExamList.jsx'
import ApplicationForm from '../components/ApplicationForm.jsx'

export default function StudentDashboard() {
  const [exams, setExams] = useState([])
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [applyExam, setApplyExam] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [exRes, regRes] = await Promise.all([
        api.get('/exams'),
        api.get('/registrations/mine')
      ])
      setExams(exRes.data)
      setRegs(regRes.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleOpenApply = (exam) => {
    setApplyExam(exam)
    setMessage('')
    setError('')
  }

  const handleSubmitApplication = async (application) => {
    if (!applyExam) return
    setMessage('')
    setError('')
    try {
      await api.post('/registrations', { examId: applyExam._id, application })
      setMessage('Application submitted (registration pending approval)')
      setApplyExam(null)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="grid-2">
      <div>
        <div className="card">
          <h2>Student Dashboard</h2>
          {loading && <div>Loading...</div>}
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
        </div>
        <ExamList exams={exams} onRegister={handleOpenApply} showRegister />

        {applyExam && (
          <div className="card">
            <h3>Application for: {applyExam.name}</h3>
            <ApplicationForm onSubmit={handleSubmitApplication} onCancel={() => setApplyExam(null)} />
          </div>
        )}
      </div>
      <div id="my-registrations">
        <div className="card">
          <h3>My Registrations</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Status</th>
                <th>Hall Ticket</th>
              </tr>
            </thead>
            <tbody>
              {regs.map(r => (
                <tr key={r._id}>
                  <td>{r.exam?.name}</td>
                  <td>{r.exam?.date ? new Date(r.exam.date).toLocaleString() : '-'}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td>{r.hallTicket?.number ? <span className="badge approved">{r.hallTicket.number}</span> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
