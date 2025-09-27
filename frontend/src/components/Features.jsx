import React from 'react'

export default function Features() {
  const items = [
    {
      title: 'Easy Discovery',
      desc: 'Find the perfect exam for your career goals with our intuitive search and filtering system.',
      icon: '🔎'
    },
    {
      title: 'Secure Process',
      desc: 'Your data is protected with industry-standard security measures and encrypted transmission.',
      icon: '🔐'
    },
    {
      title: 'Track Progress',
      desc: 'Monitor your application status and receive real-time updates throughout the process.',
      icon: '📈'
    }
  ]
  return (
    <section id="why" className="features">
      <h2 className="section-title">Why Choose ExamPortal?</h2>
      <p className="section-sub">Experience the most advanced exam registration platform</p>
      <div className="feature-grid">
        {items.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon" aria-hidden>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
