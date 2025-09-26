import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { createUser } from '../controllers/adminController.js';

const router = Router();

// All routes under /api/admin require admin role
router.use(protect, requireRole('admin'));

router.post('/users', createUser);

export default router;
