import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  totalSeats: { type: Number, required: true, min: 1 },
  description: { type: String, default: '' }
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
