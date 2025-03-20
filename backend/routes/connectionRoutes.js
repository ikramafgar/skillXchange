import express from 'express';
import { 
  sendConnectionRequest, 
  respondToConnection, 
  getConnections,
  removeConnection,
  getPendingConnectionsCount
} from '../controllers/connectionController.js';
import {verifyToken} from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/request', verifyToken, sendConnectionRequest);
router.post('/respond', verifyToken, respondToConnection);
router.post('/remove', verifyToken, removeConnection);
router.get('/', verifyToken, getConnections);
router.get('/pending/count', verifyToken, getPendingConnectionsCount);

export default router;