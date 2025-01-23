import express from 'express';
import { getProfile, updateProfile, updateProfilePicture } from '../controllers/profileController.js';
import authenticateToken  from '../middleware/authenticateToken.js';
import { upload } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getProfile);
router.put('/', authenticateToken, updateProfile);
router.put('/picture', authenticateToken, upload.single('profilePicture'), updateProfilePicture);

export default router;