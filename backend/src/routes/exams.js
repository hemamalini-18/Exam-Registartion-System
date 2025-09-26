import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { createExam, getExams, getExamById, updateExam, deleteExam } from '../controllers/examController.js';

const router = Router();

router.get('/', protect, getExams);
router.get('/:id', protect, getExamById);

router.post('/', protect, requireRole('admin'), createExam);
router.put('/:id', protect, requireRole('admin'), updateExam);
router.delete('/:id', protect, requireRole('admin'), deleteExam);

export default router;
