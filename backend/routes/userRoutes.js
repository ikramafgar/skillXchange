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
