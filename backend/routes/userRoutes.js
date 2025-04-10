import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Get connected users - users who have accepted connection with the current user
router.get('/api/users/connections', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.userId; // User ID from verifyToken middleware
    
    // Import the Connection model
    const Connection = mongoose.model('Connection');
    
    // Find all accepted connections for the current user
    const connections = await Connection.find({
      $or: [
        { sender: currentUserId, status: 'accepted' },
        { receiver: currentUserId, status: 'accepted' }
      ]
    }).populate('sender receiver', 'name email profile');
    
    // Transform connections to a more usable format
    const userConnections = connections.map(connection => {
      const otherUser = connection.sender.toString() === currentUserId 
        ? connection.receiver 
        : connection.sender;
        
      return {
        _id: connection._id,
        user: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          profile: otherUser.profile
        },
        status: connection.status,
        createdAt: connection.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: userConnections.length,
      connections: userConnections
    });
  } catch (error) {
    console.error('Error fetching user connections:', error);
    res.status(500).json({ message: 'Error fetching user connections' });
  }
});

router.get('/api/users', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.userId; // User ID from verifyToken middleware
    
    // If search query is provided, use it for filtering
    const searchQuery = req.query.search || '';
    
    // Import the Connection model to check connections
    const Connection = mongoose.model('Connection');
    
    // Find all accepted connections for the current user
    const connections = await Connection.find({
      $or: [
        { sender: currentUserId, status: 'accepted' },
        { receiver: currentUserId, status: 'accepted' }
      ]
    });
    
    // Extract connected user IDs
    const connectedUserIds = connections.map(conn => 
      conn.sender.toString() === currentUserId ? conn.receiver : conn.sender
    );
    
    // Find users that match the connected user IDs and optional search query
    const users = await User.find({
      _id: { $in: connectedUserIds },
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .populate('profile', 'profilePic')
    .select('name email profile');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching connected users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/api/users/:userId', async (req, res) => {
  try {
    const { includeDetails } = req.query;
    const includeSessionData = includeDetails === 'true';
    
    // Fetch the user with profile data
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
    
    let sessionsData = {};
    
    // If details are requested, fetch session data to calculate rating
    if (includeSessionData) {
      // Import Session model
      const Session = mongoose.model('Session');
      
      // Count total sessions taught
      const sessionsTaught = await Session.countDocuments({
        teacher: user._id,
        status: 'completed'
      });
      
      // Get all sessions with ratings for this teacher
      const sessionsWithRatings = await Session.find({
        teacher: user._id,
        'feedback.learnerRating': { $exists: true, $ne: null }
      });
      
      // Calculate average rating if not already in user model
      let rating = user.rating || 0;
      
      // If user doesn't have a rating yet, calculate it from sessions
      if (rating === 0 && sessionsWithRatings.length > 0) {
        let totalRating = 0;
        
        sessionsWithRatings.forEach(session => {
          if (session.feedback && session.feedback.learnerRating) {
            totalRating += Number(session.feedback.learnerRating);
          }
        });
        
        rating = totalRating / sessionsWithRatings.length;
        rating = parseFloat(rating.toFixed(1));
        
        // Update the user model with the calculated rating
        user.rating = rating;
        await user.save();
      }
      
      sessionsData = {
        sessionsTaught: sessionsTaught || 0,
        totalRatings: sessionsWithRatings.length,
        rating
      };
    }

    // Combine user and profile data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      rating: user.rating || 0, // Include the rating from the User model
      ...(user.profile ? user.profile.toObject() : {}),
      ...sessionsData
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

export default router;
