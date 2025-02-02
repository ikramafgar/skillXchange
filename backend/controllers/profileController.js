import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { role, sessionsTaught, points, badges, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { ...updateData, role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.files && req.files.certificates) {
      user.certificates = req.files.certificates.map(file => file.path);
      user.verificationStatus = 'pending'; // Set status to pending on certificate upload
    }
    if (req.files && req.files.experienceCertificate) {
      user.experienceCertificate = req.files.experienceCertificate[0].path;
      user.verificationStatus = 'pending'; // Set status to pending on experience certificate upload
    }
    if (sessionsTaught !== undefined) {
      user.sessionsTaught = sessionsTaught;
    }
    if (points !== undefined) {
      user.points = points;
    }
    if (badges) {
      user.badges = badges;
    }
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: req.file.path },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};