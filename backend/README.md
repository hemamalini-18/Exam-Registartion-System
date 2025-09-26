# Exam Registration Backend (Node.js + Express + MongoDB)

## Setup

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies:

```
npm install
```

3. Run in dev mode with auto-reload:

```
npm run dev
```

Or run normally:

```
npm start
```

The server starts on `http://localhost:5000` by default.

## API Overview

- Auth
  - POST `/api/auth/register` { name, email, password, role? }
  - POST `/api/auth/login` { email, password }
  - GET `/api/auth/me` (Bearer token)

- Exams (auth required; admin for mutations)
  - GET `/api/exams` -> includes `availableSeats`
  - GET `/api/exams/:id`
  - POST `/api/exams` (admin)
  - PUT `/api/exams/:id` (admin)
  - DELETE `/api/exams/:id` (admin)

- Registrations
  - POST `/api/registrations` { examId } (student)
  - GET `/api/registrations/mine` (student)
  - GET `/api/registrations?examId=...` (admin)
  - PATCH `/api/registrations/:id/approve` (admin)
  - PATCH `/api/registrations/:id/cancel` (admin)

## Notes

- JWT-based auth, include header: `Authorization: Bearer <token>`
- Unique registration per (user, exam)
- Real-time seat availability computed from count of approved registrations
