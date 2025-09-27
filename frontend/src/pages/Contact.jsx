import React, { useState } from 'react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="card wide">
      <h2>Contact</h2>
      {!sent ? (
        <form className="form" onSubmit={onSubmit}>
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            <span>Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>
          <button className="btn" type="submit">Send Message</button>
        </form>
      ) : (
        <div className="success">Thanks! We received your message.</div>
      )}
    </div>
  )
}
