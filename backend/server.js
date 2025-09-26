import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import examRoutes from './src/routes/exams.js';
import registrationRoutes from './src/routes/registrations.js';
import adminRoutes from './src/routes/admin.js';

dotenv.config();

const app = express();

// Middleware
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

if (!isProd) {
  // Development: allow all origins without credentials to avoid CORS blocks locally
  app.use(cors({ origin: true, credentials: false }));
} else {
  // Production: strict whitelist with credentials
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps / curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // If localhost is whitelisted, accept common localhost variants
      const hasLocal5173 = allowedOrigins.some(o => /localhost:5173$/i.test(o));
      if (hasLocal5173 && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]):5173$/i.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  };
  app.use(cors(corsOptions));
}
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Start server only after DB connect
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to connect DB', err);
  process.exit(1);
});
