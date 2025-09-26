import React, { useState } from 'react'

export default function ApplicationForm({ initial = {}, onSubmit, onCancel }) {
  const [fullName, setFullName] = useState(initial.fullName || '')
  const [dob, setDob] = useState(initial.dob ? new Date(initial.dob).toISOString().slice(0,10) : '')
  const [phone, setPhone] = useState(initial.phone || '')
  const [address, setAddress] = useState(initial.address || '')
  const [education, setEducation] = useState(initial.education || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ fullName, dob, phone, address, education })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        <span>Full name</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </label>
      <label>
        <span>Date of birth</span>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
      </label>
      <label>
        <span>Phone</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </label>
      <label>
        <span>Address</span>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} required />
      </label>
      <label>
        <span>Education</span>
        <input value={education} onChange={(e) => setEducation(e.target.value)} />
      </label>
      <div style={{ display:'flex', gap:8 }}>
        <button type="submit" className="btn">Submit Application</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
