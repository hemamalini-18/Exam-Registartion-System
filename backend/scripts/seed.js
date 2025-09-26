import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Exam from '../src/models/Exam.js';
import Registration from '../src/models/Registration.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/exam_reg';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Create or update admin user
  const adminEmail = 'admin@example.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const password = await bcrypt.hash('Admin@123', 10);
    admin = await User.create({ name: 'Admin', email: adminEmail, password, role: 'admin' });
    console.log('Created admin user: admin@example.com / Admin@123');
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
    console.log('Promoted existing user to admin:', adminEmail);
  }

  // Sample exams
  const existingExams = await Exam.find();
  if (existingExams.length === 0) {
    const now = new Date();
    const exams = await Exam.insertMany([
      { name: 'Math Entrance', date: new Date(now.getTime() + 86400000), durationMinutes: 90, totalSeats: 20, description: 'Algebra & Geometry' },
      { name: 'Physics Qualifier', date: new Date(now.getTime() + 2*86400000), durationMinutes: 120, totalSeats: 15, description: 'Mechanics & EM' },
      { name: 'Chemistry Basics', date: new Date(now.getTime() + 3*86400000), durationMinutes: 60, totalSeats: 25, description: 'Organic & Inorganic' }
    ]);
    console.log('Inserted sample exams:', exams.map(e => e.name));
  }

  // Clean registrations for a fresh start
  await Registration.deleteMany({});
  console.log('Cleared registrations');

  await mongoose.disconnect();
  console.log('Done');
}

run().catch((e) => { console.error(e); process.exit(1); });
