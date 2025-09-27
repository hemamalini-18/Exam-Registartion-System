import React, { useEffect, useState } from 'react'
import api from '../api/client.js'
import './MyRegistrations.css'

export default function MyRegistrations() {
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelAlerts, setCancelAlerts] = useState([])
  const [ticketAlerts, setTicketAlerts] = useState([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/registrations/mine')
      setRegs(data)
      // Build alerts reflecting admin actions
      const canc = []
      const ticks = []
      for (const r of data) {
        if (r.status === 'cancelled' && !localStorage.getItem(`ack_cancel_${r._id}`)) {
          canc.push(r)
        }
        if (r.hallTicket?.number && !localStorage.getItem(`ack_ticket_${r._id}`)) {
          ticks.push(r)
        }
      }
      setCancelAlerts(canc)
      setTicketAlerts(ticks)
    } catch (e) {
      setError(e?.normalizedMessage || 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadHallTicket = async (reg) => {
    try {
      const res = await api.get(`/registrations/${reg._id}/hall-ticket.pdf`, {
        responseType: 'blob'
      })
      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = blobUrl
      const name = reg.hallTicket?.number
        ? `hall-ticket-${reg.hallTicket.number}${reg.application?.regNo ? '-' + reg.application.regNo : ''}.pdf`
        : `hall-ticket${reg.application?.regNo ? '-' + reg.application.regNo : ''}.pdf`
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

  // Refresh when tab gains focus so student sees latest admin actions
  useEffect(() => {
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const ackCancel = (id) => {
    localStorage.setItem(`ack_cancel_${id}`, '1')
    setCancelAlerts(prev => prev.filter(r => r._id !== id))
  }
  const ackTicket = (id) => {
    localStorage.setItem(`ack_ticket_${id}`, '1')
    setTicketAlerts(prev => prev.filter(r => r._id !== id))
  }

  return (
    <div className="myregs myregs--fullpage">
      <div className="card myregs-card">
        <div className="myregs-head">
          <h2>My Registrations</h2>
          <button className="btn small" onClick={load} aria-label="Refresh registrations">Refresh</button>
        </div>

        {/* Notifications for admin actions */}
        {(cancelAlerts.length > 0 || ticketAlerts.length > 0) && (
          <div className="card" style={{ marginBottom: 8 }}>
            {ticketAlerts.map(r => (
              <div key={`t-${r._id}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <div><strong>Hall ticket issued:</strong> {r.exam?.name} • <span className="badge approved">{r.hallTicket?.number}</span></div>
                <button className="btn small ghost" onClick={() => ackTicket(r._id)}>Got it</button>
              </div>
            ))}
            {cancelAlerts.map(r => (
              <div key={`c-${r._id}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginTop: ticketAlerts.length ? 6 : 0 }}>
                <div><strong>Application cancelled:</strong> {r.exam?.name}. Please contact support for details.</div>
                <button className="btn small ghost" onClick={() => ackCancel(r._id)}>Acknowledge</button>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="center" style={{ minHeight: 160 }}>
            <div className="spinner" />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && !error && regs.length === 0 && (
          <div className="card" style={{ marginTop: 8 }}>
            <strong>You have no registrations yet.</strong>
            <p style={{ marginTop: 6 }}>
              Browse exams on the Student Dashboard and submit an application to see it listed here.
            </p>
          </div>
        )}

        {!loading && !error && regs.length > 0 && (
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
                      <div className="actions" style={{ alignItems: 'center', gap: 8 }}>
                        <span className="badge approved">{r.hallTicket.number}</span>
                        {r.application?.regNo && (
                          <span className="badge" title="Registration Number">Reg No: {r.application.regNo}</span>
                        )}
                        <button className="btn small" onClick={() => handleDownloadHallTicket(r)}>Download</button>
                      </div>
                    ) : (
                      r.application?.regNo ? <span className="badge" title="Registration Number">Reg No: {r.application.regNo}</span> : '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}