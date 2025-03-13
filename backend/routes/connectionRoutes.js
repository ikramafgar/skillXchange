import express from 'express';
import { 
  sendConnectionRequest, 
  respondToConnection, 
  getConnections,
  removeConnection
} from '../controllers/connectionController.js';
import {verifyToken} from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/request', verifyToken, sendConnectionRequest);
router.post('/respond', verifyToken, respondToConnection);
router.post('/remove', verifyToken, removeConnection);
router.get('/', verifyToken, getConnections);

export default router;