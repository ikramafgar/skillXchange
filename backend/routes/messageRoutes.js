import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { upload } from '../middleware/multerMiddleware.js';

const router = express.Router();

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('Message Route Debug:', {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    params: req.params,
    userId: req.userId,
    cookies: req.cookies
  });
  next();
};

// Apply debug middleware to all routes
router.use(debugMiddleware);
router.use(verifyToken);

// POST /api/message - Send a message
router.post('/', upload.single('file'), sendMessage);

// GET /api/message/:chatId - Get messages for a chat
router.get('/:chatId', getMessages);

// PUT /api/message/read/:chatId - Mark messages as read
router.put('/read/:chatId', markMessagesAsRead);

// DELETE /api/message/delete/:messageId - Delete a message
router.delete('/delete/:messageId', deleteMessage);

export default router; 