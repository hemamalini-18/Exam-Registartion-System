import React from 'react'

export default function AdminStats({ exams = [], regs = [] }) {
  const totalExams = exams.length
  const totalRegs = regs.length
  const pending = regs.filter(r => r.status === 'pending').length
  const approved = regs.filter(r => r.status === 'approved').length
  const cancelled = regs.filter(r => r.status === 'cancelled').length

  const nextExam = exams
    .filter(e => e.date)
    .map(e => ({ ...e, ts: new Date(e.date).getTime() }))
    .sort((a, b) => a.ts - b.ts)[0]

  const items = [
    { label: 'Total Exams', value: totalExams, icon: '🗂️' },
    { label: 'Total Registrations', value: totalRegs, icon: '🧾' },
    { label: 'Pending Approvals', value: pending, icon: '⏳' },
    { label: 'Approved', value: approved, icon: '✅' },
    { label: 'Cancelled', value: cancelled, icon: '🛑' },
  ]

  return (
    <section className="stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
      {items.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon" aria-hidden>{s.icon}</div>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
      <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
        <div className="stat-label">Next Upcoming Exam</div>
        <div className="stat-value" style={{ fontSize: 20 }}>
          {nextExam ? `${nextExam.name} · ${new Date(nextExam.date).toLocaleString()}` : '—'}
        </div>
      </div>
    </section>
  )
}
