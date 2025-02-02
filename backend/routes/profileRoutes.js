import express from 'express';
import { getProfile, updateProfile, updateProfilePicture } from '../controllers/profileController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import { upload } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getProfile);
router.put('/', authenticateToken, upload.fields([
  { name: 'certificates', maxCount: 5 },
  { name: 'experienceCertificate', maxCount: 1 }
]), updateProfile);
router.put('/picture', authenticateToken, upload.single('profilePicture'), updateProfilePicture);

router.put('/verify/:id', authenticateToken, async (req, res) => {
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