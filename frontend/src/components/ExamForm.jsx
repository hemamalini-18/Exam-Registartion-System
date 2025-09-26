import React, { useEffect, useState } from 'react'

export default function ExamForm({ onSubmit, initial }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [totalSeats, setTotalSeats] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setDate(initial.date ? new Date(initial.date).toISOString().slice(0, 16) : '')
      setDurationMinutes(initial.durationMinutes || '')
      setTotalSeats(initial.totalSeats || '')
      setDescription(initial.description || '')
    }
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !date || !durationMinutes || !totalSeats) return
    onSubmit({ name, date: new Date(date), durationMinutes: Number(durationMinutes), totalSeats: Number(totalSeats), description })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="grid">
        <label>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          <span>Date & Time</span>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
      </div>
      <div className="grid">
        <label>
          <span>Duration (minutes)</span>
          <input type="number" min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} required />
        </label>
        <label>
          <span>Total Seats</span>
          <input type="number" min="1" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} required />
        </label>
      </div>
      <label>
        <span>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <button className="btn" type="submit">{initial ? 'Update Exam' : 'Create Exam'}</button>
    </form>
  )
}
