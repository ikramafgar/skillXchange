import express from 'express';
import { getPendingTeachers, verifyTeacher, getAdminStats } from '../controllers/adminController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import adminCheck from '../middleware/adminCheck.js';

const router = express.Router();

// All admin routes require authentication and admin check
router.use(authenticateToken);
router.use(adminCheck);

// Get all teachers with pending verification
router.get('/pending-teachers', getPendingTeachers);

// Verify a teacher's certificates
router.post('/verify-teacher', verifyTeacher);

// Get admin dashboard stats
router.get('/stats', getAdminStats);

export default router; 