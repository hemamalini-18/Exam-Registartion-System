import Exam from '../models/Exam.js';
import Registration from '../models/Registration.js';
import { logAudit } from '../utils/audit.js';
import PDFDocument from 'pdfkit';

const approvedCountForExam = async (examId) => {
  return Registration.countDocuments({ exam: examId, status: 'approved' });
};

// Stream a simple PDF hall ticket for the registration (owner or admin)
export const downloadHallTicket = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('user').populate('exam');
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    const isOwner = String(reg.user?._id) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });
    if (!reg.hallTicket?.number) return res.status(400).json({ message: 'Hall ticket not issued yet' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="hall-ticket-${reg.hallTicket.number}.pdf"`);
    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .text('Exam Registration - Hall Ticket', { align: 'center' })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Issued: ${new Date(reg.hallTicket.issuedAt || Date.now()).toLocaleString()}`, { align: 'center' })
      .moveDown(1);

    // Ticket info
    doc
      .fontSize(14)
      .text(`Hall Ticket No: ${reg.hallTicket.number}`, { continued: false })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Candidate: ${reg.user?.name || '-'}`)
      .text(`Email: ${reg.user?.email || '-'}`)
      .moveDown(0.5)
      .text(`Exam: ${reg.exam?.name || '-'}`)
      .text(`Date & Time: ${reg.exam?.date ? new Date(reg.exam.date).toLocaleString() : '-'}`)
      .text(`Duration: ${reg.exam?.durationMinutes || '-'} minutes`)
      .moveDown(0.5)
      .text(`Status: ${reg.status}`)
      .moveDown(1);

    // Application snippet
    if (reg.application) {
      doc.fontSize(13).text('Application Details', { underline: true }).moveDown(0.4);
      const a = reg.application;
      doc.fontSize(12)
        .text(`Full Name: ${a.fullName || '-'}`)
        .text(`DOB: ${a.dob ? new Date(a.dob).toLocaleDateString() : '-'}`)
        .text(`Phone: ${a.phone || '-'}`)
        .text(`Education: ${a.education || '-'}`)
        .text(`Address: ${a.address || '-'}`)
        .moveDown(1);
    }

    doc
      .moveDown(2)
      .fontSize(10)
      .fillColor('#555555')
      .text('Note: Bring a valid photo ID along with this hall ticket to the exam centre.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
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
