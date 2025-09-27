import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client.js'

export default function ExamDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [eRes, rRes] = await Promise.all([
        api.get(`/exams/${id}`),
        api.get('/registrations/mine')
      ])
      setExam(eRes.data)
      setRegs(rRes.data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load exam details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const already = useMemo(() => regs.some(r => r.exam?._id === id), [regs, id])

  return (
    <div className="card">
      <button className="btn ghost" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>← Back</button>
      <h2>Exam Details</h2>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}
      {!loading && exam && (
        <>
          <div className="grid" style={{ gap: 10, marginTop: 8 }}>
            <div><strong>Name:</strong> {exam.name}</div>
            <div><strong>Category:</strong> {exam.category || 'General'}</div>
            <div><strong>Date:</strong> {exam.date ? new Date(exam.date).toLocaleString() : '-'}</div>
            <div><strong>Duration:</strong> {exam.durationMinutes} mins</div>
            <div><strong>Total Seats:</strong> {exam.totalSeats ?? exam.availableSeats}</div>
            <div><strong>Available:</strong> {exam.availableSeats ?? '-'}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Description:</strong> {exam.description || '—'}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            {already ? (
              <span className="badge">Already registered</span>
            ) : (
              <span className="badge">Registration available in dashboard</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
