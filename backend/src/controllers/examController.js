import Exam from '../models/Exam.js';
import Registration from '../models/Registration.js';
import { logAudit } from '../utils/audit.js';

const getAvailableSeatsMap = async (examIds) => {
  const agg = await Registration.aggregate([
    { $match: { exam: { $in: examIds }, status: 'approved' } },
    { $group: { _id: '$exam', approvedCount: { $sum: 1 } } }
  ]);
  const map = new Map();
  for (const row of agg) {
    map.set(String(row._id), row.approvedCount);
  }
  return map;
};

export const createExam = async (req, res) => {
  try {
    const { name, date, durationMinutes, totalSeats, description } = req.body;
    if (!name || !date || !durationMinutes || !totalSeats) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const exam = await Exam.create({ name, date, durationMinutes, totalSeats, description });
    await logAudit(req, 'create', 'Exam', String(exam._id), { name });
    res.status(201).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExams = async (req, res) => {
  try {
    const { q, page = 1, limit = 0 } = req.query;
    const filter = {};
    if (q) {
      filter.name = { $regex: String(q), $options: 'i' };
    }
    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.max(parseInt(limit, 10) || 0, 0);
    let query = Exam.find(filter).sort({ date: 1 });
    if (lim > 0) {
      query = query.skip((pg - 1) * lim).limit(lim);
    }
    const exams = await query;
    const ids = exams.map(e => e._id);
    const map = await getAvailableSeatsMap(ids);
    const withSeats = exams.map(e => {
      const approved = map.get(String(e._id)) || 0;
      return { ...e.toObject(), availableSeats: Math.max(e.totalSeats - approved, 0) };
    });
    res.json(withSeats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const map = await getAvailableSeatsMap([exam._id]);
    const approved = map.get(String(exam._id)) || 0;
    res.json({ ...exam.toObject(), availableSeats: Math.max(exam.totalSeats - approved, 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { name, date, durationMinutes, totalSeats, description } = req.body;
    const updated = await Exam.findByIdAndUpdate(
      req.params.id,
      { name, date, durationMinutes, totalSeats, description },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Exam not found' });
    await logAudit(req, 'update', 'Exam', String(updated._id), { name: updated.name });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const deleted = await Exam.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Exam not found' });
    await Registration.deleteMany({ exam: deleted._id });
    await logAudit(req, 'delete', 'Exam', String(deleted._id), { name: deleted.name });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
