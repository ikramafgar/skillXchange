import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  changeSessionStatus,
  submitFeedback,
  regenerateZoomLink
} from '../controllers/sessionController.js';

const router = express.Router();

// Protected routes - all require authentication
router.use(verifyToken);

// Create, read, update sessions
router.post('/create', createSession);
router.post('/', createSession);
router.get('/', getSessions);
router.get('/:sessionId', getSessionById);
router.put('/:sessionId', updateSession);

// Session status changes
router.put('/:sessionId/status', changeSessionStatus);

// Session feedback
router.post('/:sessionId/feedback', submitFeedback);

// Zoom specific routes
router.post('/:sessionId/regenerate-zoom', regenerateZoomLink);

export default router; 