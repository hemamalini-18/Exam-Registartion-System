# Exam Registration Frontend (React + Vite)

## Setup

1. (Optional) Create a `.env` file to override the API base URL:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

2. Install dependencies and run dev server:

```
npm install
npm start
```

The app runs at `http://localhost:3000`.

## Features

- React Router based navigation
- Auth Context with JWT (stored in localStorage)
- Axios API client with automatic token header
- Student Dashboard: list exams, register, view my registrations
- Admin Dashboard: create/update/delete exams, view/approve/cancel registrations
- Basic responsive styling
