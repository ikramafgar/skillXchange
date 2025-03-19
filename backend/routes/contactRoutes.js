import express from 'express';
import { 
  submitContactMessage, 
  getAllContactMessages, 
  markMessageAsRead,
  deleteContactMessage,
  replyToContactMessage
} from '../controllers/contactController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import adminCheck from '../middleware/adminCheck.js';

const router = express.Router();

// Public route - anyone can submit a contact message
router.post('/submit', submitContactMessage);

// Admin routes - require authentication and admin check
router.get('/messages', authenticateToken, adminCheck, getAllContactMessages);
router.patch('/messages/:messageId/read', authenticateToken, adminCheck, markMessageAsRead);
router.post('/messages/:messageId/mark-read', authenticateToken, adminCheck, markMessageAsRead);
router.delete('/messages/:messageId', authenticateToken, adminCheck, deleteContactMessage);
router.post('/messages/:messageId/reply', authenticateToken, adminCheck, replyToContactMessage);

export default router; 