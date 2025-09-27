import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import ApplicationForm from '../components/ApplicationForm.jsx'
import Hero from '../components/Hero.jsx'
import Stats from '../components/Stats.jsx'
import FeaturedExams from '../components/FeaturedExams.jsx'
import Features from '../components/Features.jsx'
import ExamList from '../components/ExamList.jsx'
import './StudentDashboard.css'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [applyExam, setApplyExam] = useState(null)
  const [showAllExams, setShowAllExams] = useState(false)

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

  const handleDownloadHallTicket = async (reg) => {
    try {
      const res = await api.get(`/registrations/${reg._id}/hall-ticket.pdf`, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = blobUrl
      const name = reg.hallTicket?.number ? `hall-ticket-${reg.hallTicket.number}.pdf` : 'hall-ticket.pdf'
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError(err?.normalizedMessage || err?.response?.data?.message || 'Failed to download hall ticket')
    }
  }

  useEffect(() => { load() }, [])

  // Refresh when window/tab gains focus and also poll periodically so admin actions reflect
  useEffect(() => {
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    const id = setInterval(() => load(), 10000) // 10s polling
    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(id)
    }
  }, [])

  const handleOpenApply = (exam) => {
    setMessage('')
    setError('')
    // Prevent duplicate registration attempts
    const isRegistered = regs.some(r => r.exam?._id === exam._id)
    if (isRegistered) {
      setMessage('You have already registered for this exam')
      return
    }
    setApplyExam(exam)
    // Wait for the application form to render, then scroll to it
    setTimeout(() => {
      document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
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

  const registeredIds = useMemo(() => new Set(regs.map(r => r.exam?._id).filter(Boolean)), [regs])
  const cancelledIds = useMemo(() => regs.filter(r => r.status === 'cancelled').map(r => r._id), [regs])
  const hasUnacknowledgedCancelled = useMemo(() => {
    if (cancelledIds.length === 0) return false
    // show banner only if any cancelled reg hasn't been acknowledged
    return cancelledIds.some(id => !localStorage.getItem(`ack_cancel_${id}`))
  }, [cancelledIds])

  return (
    <div className="student-page">
      <Hero onBrowse={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })} />

      {hasUnacknowledgedCancelled && (
        <div className="card dash-card cancel-banner" role="status" aria-live="polite">
          <div className="cancel-banner__inner">
            <div>
              <strong>One or more of your applications were cancelled.</strong>
              <div className="muted">Open My Registrations to review details and next steps.</div>
            </div>
            <button
              className="btn small ghost"
              onClick={() => {
                // mark all current cancelled regs as acknowledged
                cancelledIds.forEach(id => localStorage.setItem(`ack_cancel_${id}`, '1'))
                navigate('/student/registrations')
              }}
            >
              View
            </button>
          </div>
        </div>
      )}

      <div className="card dash-card">
        <h2>Overview</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        <Stats exams={exams} regs={regs} />
      </div>

      <div id="featured" className="dash-section">
        <FeaturedExams
          exams={exams}
          onRegister={handleOpenApply}
          registeredIds={registeredIds}
          onViewAll={() => {
            setShowAllExams(true)
            setTimeout(() => {
              document.getElementById('all-exams')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 0)
          }}
        />
      </div>

      <Features />

      {showAllExams && (
        <div id="all-exams" className="dash-section">
          <ExamList exams={exams} onRegister={handleOpenApply} showRegister registeredIds={registeredIds} />
        </div>
      )}

      {applyExam && (
        <div className="card" id="application-form">
          <h3>Application for: {applyExam.name}</h3>
          <ApplicationForm onSubmit={handleSubmitApplication} onCancel={() => setApplyExam(null)} />
        </div>
      )}

      <div id="my-registrations" className="dash-section">
        <div className="card dash-card">
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
                  <td>
                    {r.hallTicket?.number ? (
                      <div className="actions">
                        <span className="badge approved">{r.hallTicket.number}</span>
                        <button className="btn small" onClick={() => handleDownloadHallTicket(r)}>Download</button>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
