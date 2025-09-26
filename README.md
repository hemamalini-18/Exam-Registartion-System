# Exam Registration System (MERN)

This project is a complete Exam Registration System built with the MERN stack.

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- Frontend: React (with React Router), Axios, optional Tailwind CSS

## Structure

- `backend/` – Express API
- `frontend/` – React app

## Running Locally

Open two terminals.

### Backend

```
cd backend
cp .env.example .env  # On Windows, copy manually or use PowerShell equivalent
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm start
```

Then open `http://localhost:3000`.

Ensure MongoDB is running locally or update `MONGO_URI` in `backend/.env` to your MongoDB connection string.
