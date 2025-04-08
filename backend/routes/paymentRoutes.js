import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook
} from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes
router.use('/create-intent', verifyToken);
router.use('/confirm', verifyToken);

// Payment routes
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

// Stripe webhook - this needs to be raw body not JSON
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router; 