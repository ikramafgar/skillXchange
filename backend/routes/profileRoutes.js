import express from 'express';
import { getProfile, updateProfile, updateProfilePicture } from '../controllers/profileController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { upload } from '../middleware/multerMiddleware.js';
import { validateSkills } from '../middleware/skillValidation.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/me', verifyToken, getProfile);

// Update user profile
router.put('/update', verifyToken, validateSkills, upload.fields([
  { name: 'certificates', maxCount: 5 },
  { name: 'experienceCertificate', maxCount: 1 }
]), updateProfile);

// Update profile picture
router.put('/update-picture', verifyToken, upload.single('profilePicture'), updateProfilePicture);

router.put('/verify/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { verificationStatus: status }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;