import React from 'react'

export default function Stats({ exams, regs }) {
  const activeExams = exams.length
  const totalApplicants = regs.length
  const successRate = (() => {
    const approved = regs.filter(r => r.status === 'approved').length
    if (!totalApplicants) return 0
    return Math.round((approved / totalApplicants) * 100)
  })()

  const items = [
    { label: 'Active Exams', value: activeExams, icon: '🎓' },
    { label: 'Total Applicants', value: totalApplicants > 0 ? `${totalApplicants}+` : 0, icon: '👥' },
    { label: 'Success Rate', value: `${successRate}%`, icon: '✅' }
  ]

  return (
    <section className="stats">
      {items.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon" aria-hidden>{s.icon}</div>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </section>
  )
}
