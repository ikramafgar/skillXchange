import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name profilePic');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'profile',
        populate: [
          { path: 'skillsToLearn.skill' },
          { path: 'skillsToTeach.skill' }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Combine user and profile data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      ...(user.profile ? user.profile.toObject() : {})
    };

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

export default router;
