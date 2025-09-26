import mongoose from 'mongoose';
import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Registration from '../models/Registration.js';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true
  });
  console.log('MongoDB connected');

  // Ensure collection indexes match current schemas.
  // This will drop any legacy indexes not defined in the schemas,
  // e.g., a stale unique index on `username` causing E11000 on null.
  try {
    await Promise.all([
      User.syncIndexes(),
      Exam.syncIndexes(),
      Registration.syncIndexes(),
    ]);
    // Optional: explicitly drop a legacy index if it still exists
    // await User.collection.dropIndex('username_1').catch(() => {});
  } catch (e) {
    console.warn('Index sync warning:', e?.message || e);
  }
};
