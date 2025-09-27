import React, { useEffect, useState } from 'react'
import api from '../api/client.js'

export default function SystemHealth() {
  const [status, setStatus] = useState('unknown')
  const [timestamp, setTimestamp] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const { data } = await api.get('/health')
      setStatus(data.status || 'ok')
      setTimestamp(data.timestamp)
    } catch (e) {
      setStatus('down')
      setError(e?.normalizedMessage || 'Health check failed')
    }
  }

  useEffect(() => { load() }, [])

  return (
    <section className="card">
      <h3>System Health</h3>
      {error && <div className="error">{error}</div>}
      <div className="grid">
        <div>
          <strong>API:</strong> {status === 'ok' ? 'Online' : 'Unavailable'}
        </div>
        <div>
          <strong>Last checked:</strong> {timestamp ? new Date(timestamp).toLocaleString() : '—'}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn small" onClick={load}>Refresh</button>
      </div>
    </section>
  )
}
