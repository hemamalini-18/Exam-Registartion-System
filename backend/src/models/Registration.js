import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { type: String, enum: ['pending', 'approved', 'cancelled'], default: 'pending' },
  registrationDate: { type: Date, default: Date.now },
  application: {
    fullName: { type: String, trim: true },
    dob: { type: Date },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    education: { type: String, trim: true }
  },
  hallTicket: {
    number: { type: String },
    issuedAt: { type: Date }
  }
}, { timestamps: true });

registrationSchema.index({ user: 1, exam: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
