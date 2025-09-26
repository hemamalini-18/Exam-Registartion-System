import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { registerForExam, myRegistrations, allRegistrations, approveRegistration, cancelRegistration, updateApplication, issueHallTicket } from '../controllers/registrationController.js';

const router = Router();

// Student
router.post('/', protect, registerForExam);
router.get('/mine', protect, myRegistrations);
router.patch('/:id/application', protect, updateApplication);

// Admin
router.get('/', protect, requireRole('admin'), allRegistrations);
router.patch('/:id/approve', protect, requireRole('admin'), approveRegistration);
router.patch('/:id/cancel', protect, requireRole('admin'), cancelRegistration);
router.patch('/:id/hall-ticket', protect, requireRole('admin'), issueHallTicket);

export default router;
