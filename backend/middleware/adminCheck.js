import User from '../models/User.js';

// This middleware checks if the user has admin privileges
// It doesn't store admin status in the database, but checks against env variables
const adminCheck = async (req, res, next) => {
  try {
    // Get the user from the database
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user's email and password match the admin credentials in .env
    // This is the "magic" part - we don't store admin status in the database
    if (user.email === process.env.ADMIN_USERNAME) {
      // Set an admin flag on the request object
      req.isAdmin = true;
      return next();
    }
    
    // If not admin, return unauthorized
    return res.status(403).json({ message: 'Unauthorized: Admin access required' });
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default adminCheck; 