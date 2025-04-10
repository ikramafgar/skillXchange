import Profile from '../models/Profile.js';
import User from '../models/User.js';
import ContactMessage from '../models/ContactMessage.js';
import Certificate from '../models/Certificate.js';

// Get all teachers with pending verification
export const getPendingTeachers = async (req, res) => {
  try {
    // Check if the user is an admin (this should be verified by middleware)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // Find all profiles with teacher role and pending verification status
    const pendingTeachers = await Profile.find({
      $or: [
        { role: 'teacher', verificationStatus: 'pending' },
        { role: 'both', verificationStatus: 'pending' }
      ],
      certificates: { $exists: true, $ne: [] } // Only include profiles with certificates
    }).populate({
      path: 'user',
      select: 'name email'
    });

    res.json(pendingTeachers);
  } catch (error) {
    console.error('Error fetching pending teachers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify a teacher's certificates
export const verifyTeacher = async (req, res) => {
  try {
    // Check if the user is an admin (this should be verified by middleware)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { profileId, status, reason } = req.body;

    if (!profileId || !status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Find the profile
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update the verification status
    profile.verificationStatus = status;
    
    // If rejected, store the reason
    if (status === 'rejected' && reason) {
      profile.verificationRejectionReason = reason;
    }

    await profile.save();

    // If we have a socket.io instance, send a notification to the user
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    if (io && profile.user) {
      const userSocketId = connectedUsers.get(profile.user.toString());
      
      if (userSocketId) {
        io.to(userSocketId).emit('verification_update', {
          status,
          reason: status === 'rejected' ? reason : undefined
        });
      }
    }

    res.json({ 
      message: `Teacher ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      profile
    });
  } catch (error) {
    console.error('Error verifying teacher:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // Check if the user is an admin (this should be verified by middleware)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // Get counts for various stats
    const [
      totalUsers,
      totalTeachers,
      totalLearners,
      pendingVerifications,
      verifiedTeachers,
      totalContactMessages,
      unreadContactMessages,
      pendingCertificates,
      approvedCertificates
    ] = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments({ 
        $or: [{ role: 'teacher' }, { role: 'both' }]
      }),
      Profile.countDocuments({ 
        $or: [{ role: 'learner' }, { role: 'both' }]
      }),
      Profile.countDocuments({
        $or: [
          { role: 'teacher', verificationStatus: 'pending' },
          { role: 'both', verificationStatus: 'pending' }
        ],
        certificates: { $exists: true, $ne: [] }
      }),
      Profile.countDocuments({
        $or: [
          { role: 'teacher', verificationStatus: 'approved' },
          { role: 'both', verificationStatus: 'approved' }
        ]
      }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'unread' }),
      Certificate.countDocuments({ status: 'pending' }),
      Certificate.countDocuments({ status: 'approved' })
    ]);

    res.json({
      totalUsers,
      totalTeachers,
      totalLearners,
      pendingVerifications,
      verifiedTeachers,
      totalContactMessages,
      unreadContactMessages,
      pendingCertificates,
      approvedCertificates
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 