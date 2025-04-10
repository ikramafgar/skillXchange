import express from 'express';
import { 
  checkEligibility, 
  requestCertificate, 
  getUserCertificates,
  getPendingCertificates,
  processCertificate,
  getCertificateById,
  trackCertificateDownload,
  downloadCertificate
} from '../controllers/certificateController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import adminCheck from '../middleware/adminCheck.js';

const router = express.Router();

// User routes - require authentication
router.use(verifyToken);

// Check if a user is eligible for a certificate
router.get('/eligibility', checkEligibility);

// Request a certificate
router.post('/request', requestCertificate);

// Get all certificates for the authenticated user
router.get('/user', getUserCertificates);

// Get a specific certificate by ID
router.get('/:certificateId', getCertificateById);

// Download certificate
router.get('/:certificateId/download', downloadCertificate);

// Track certificate download
router.post('/:certificateId/download', trackCertificateDownload);

// Admin routes - require admin privileges
router.get('/admin/pending', verifyToken, adminCheck, getPendingCertificates);
router.post('/admin/process', verifyToken, adminCheck, processCertificate);

export default router; 