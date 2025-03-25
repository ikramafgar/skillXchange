import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  accessChat,
  fetchChats,
  deleteChat,
} from '../controllers/chatController.js';

const router = express.Router();

// Protected routes
router.route('/').post(verifyToken, accessChat).get(verifyToken, fetchChats);
router.route('/:chatId').delete(verifyToken, deleteChat);

export default router; 