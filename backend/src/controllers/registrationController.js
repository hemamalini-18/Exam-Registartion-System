import Exam from '../models/Exam.js';
import Registration from '../models/Registration.js';
import { logAudit } from '../utils/audit.js';

const approvedCountForExam = async (examId) => {
  return Registration.countDocuments({ exam: examId, status: 'approved' });
};

export const registerForExam = async (req, res) => {
  try {
    const { examId, application } = req.body;
    if (!examId) return res.status(400).json({ message: 'examId required' });
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Prevent duplicate registration via code path too (unique index also exists)
    const existing = await Registration.findOne({ user: req.user._id, exam: examId });
    if (existing) return res.status(409).json({ message: 'Already registered for this exam' });

    // Basic application validation (optional fields permitted)
    const app = application ? {
      fullName: application.fullName,
      dob: application.dob,
      phone: application.phone,
      address: application.address,
      education: application.education
    } : undefined;

    // If auto-approval logic is used, verify seats. For pending, seat check will occur upon approval.
    const reg = await Registration.create({ user: req.user._id, exam: examId, status: 'pending', application: app });
    res.status(201).json(reg);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Already registered for this exam' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const myRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user._id }).populate('exam');
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const allRegistrations = async (req, res) => {
  try {
    const { examId, status, page = 1, limit = 0 } = req.query;
    const filter = {};
    if (examId) filter.exam = examId;
    if (status) filter.status = status;
    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.max(parseInt(limit, 10) || 0, 0);
    let query = Registration.find(filter).sort({ createdAt: -1 }).populate('exam').populate('user');
    if (lim > 0) {
      query = query.skip((pg - 1) * lim).limit(lim);
    }
    const regs = await query;
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('exam');
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (reg.status === 'approved') return res.status(400).json({ message: 'Already approved' });

    const approved = await approvedCountForExam(reg.exam._id);
    if (approved >= reg.exam.totalSeats) {
      return res.status(400).json({ message: 'No seats available' });
    }

    reg.status = 'approved';
    await reg.save();
    await logAudit(req, 'approve', 'Registration', String(reg._id), { exam: String(reg.exam._id) });
    res.json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    reg.status = 'cancelled';
    await reg.save();
    await logAudit(req, 'cancel', 'Registration', String(reg._id), {});
    res.json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Allow a student to update their own application before approval
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await Registration.findById(id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (String(reg.user) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    if (reg.status === 'approved') return res.status(400).json({ message: 'Cannot modify after approval' });
    const { application } = req.body;
    reg.application = {
      ...reg.application?.toObject?.() || {},
      fullName: application?.fullName,
      dob: application?.dob,
      phone: application?.phone,
      address: application?.address,
      education: application?.education
    };
    await reg.save();
    res.json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin issues a hall ticket once approved
export const issueHallTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await Registration.findById(id).populate('user').populate('exam');
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (reg.status !== 'approved') return res.status(400).json({ message: 'Approve registration before issuing hall ticket' });
    if (reg.hallTicket?.number) return res.status(400).json({ message: 'Hall ticket already issued' });

    const number = req.body?.number || `HT-${String(reg.exam._id).slice(-5)}-${Date.now().toString().slice(-6)}`;
    reg.hallTicket = { number, issuedAt: new Date() };
    await reg.save();
    await logAudit(req, 'issue_hall_ticket', 'Registration', String(reg._id), { number });
    res.json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
