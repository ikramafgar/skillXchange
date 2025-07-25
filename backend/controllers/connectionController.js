import Connection from '../models/Connection.js';
import User from '../models/User.js';

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body; // receiver's ID
    const senderId = req.userId; // logged in user's ID from verifyToken middleware

    // Input validation
    if (!userId || !senderId) {
      return res.status(400).json({ message: 'Both sender and receiver IDs are required' });
    }

    if (userId === senderId.toString()) {
      return res.status(400).json({ message: 'Cannot send connection request to yourself' });
    }

    // Verify both users exist with their profiles
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).populate('profile', 'profilePic'),
      User.findById(userId).populate('profile', 'profilePic')
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ 
        message: !sender ? 'Sender not found' : 'Receiver not found' 
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: userId },
        { sender: userId, receiver: senderId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ 
        message: `Connection already exists with status: ${existingConnection.status}`,
        status: existingConnection.status
      });
    }

    // Create new connection
    const connection = new Connection({
      sender: senderId,
      receiver: userId,
      status: 'pending'
    });

    await connection.save();

    // Get io instance
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    console.log('Sending connection request notification');
    console.log('Connected users:', Array.from(connectedUsers.keys()));
    console.log('Receiver ID:', userId);
    console.log('Is receiver connected:', connectedUsers.has(userId.toString()));

    // Emit socket event for real-time notification if user is online
    if (io && connectedUsers.has(userId.toString())) {
      console.log('Emitting connectionRequest event to user:', userId.toString());
      
      try {
        // Get the socket ID for the receiver
        const receiverSocketId = connectedUsers.get(userId.toString());
        console.log('Receiver socket ID:', receiverSocketId);
        
        // Make sure connection is properly structured for the client
        const connectionData = {
          _id: connection._id.toString(),
          sender: senderId.toString(),
          receiver: userId.toString(),
          status: 'pending',
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt
        };
        
        // Emit directly to the socket ID instead of using rooms
        io.to(receiverSocketId).emit('connectionRequest', {
          connection: connectionData,
          sender: {
            _id: sender._id.toString(),
            name: sender.name,
            profilePic: sender.profile?.profilePic || '/default-avatar.png'
          }
        });
        console.log('Successfully emitted connectionRequest event');
      } catch (error) {
        console.error('Error emitting connectionRequest event:', error);
      }
    } else {
      console.log('User not connected or io not available');
      if (!io) console.log('io is not available');
      if (!connectedUsers.has(userId.toString())) console.log('User is not in connected users map');
    }

    res.status(201).json({ 
      message: 'Connection request sent successfully',
      connection 
    });
    
  } catch (error) {
    console.error('Error in sendConnectionRequest:', error);
    res.status(500).json({ 
      message: 'Error sending connection request',
      error: error.message 
    });
  }
};

export const respondToConnection = async (req, res) => {
  try {
    const { connectionId, status } = req.body;
    const userId = req.userId; // Use userId from verifyToken middleware

    // Input validation
    if (!connectionId || !status) {
      return res.status(400).json({ message: 'Connection ID and status are required' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "rejected"' });
    }

    const connection = await Connection.findOne({
      _id: connectionId,
      receiver: userId,
      status: 'pending'
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found or already processed' });
    }

    // Get the sender's and responder's details with their profiles
    const sender = await User.findById(connection.sender).populate('profile', 'profilePic');
    const responder = await User.findById(userId).populate('profile', 'profilePic');

    // If connection is accepted, increment connection count for both users and save the connection
    if (status === 'accepted') {
      // Update sender's connection count
      if (!sender.connections) sender.connections = 0;
      sender.connections += 1;
      await sender.save();
      
      // Update responder's connection count
      if (!responder.connections) responder.connections = 0;
      responder.connections += 1;
      await responder.save();
      
      // Update connection status
      connection.status = status;
      await connection.save();
    } else if (status === 'rejected') {
      // If rejected, delete the connection from the database
      await Connection.findByIdAndDelete(connectionId);
    }

    // Get io instance
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    console.log('Sending connection response notification');
    console.log('Connected users:', Array.from(connectedUsers.keys()));
    console.log('Sender ID:', connection.sender.toString());
    console.log('Is sender connected:', connectedUsers.has(connection.sender.toString()));
    console.log('Sender socket ID:', connectedUsers.get(connection.sender.toString()));

    // Prepare the notification data
    const notificationData = {
      connection: {
        ...connection.toObject(),
        status: status // Ensure the status is correct even if the connection was deleted
      }
    };

    // Emit socket event if sender is online
    if (io && connectedUsers.has(connection.sender.toString())) {
      console.log('Emitting connectionResponse event to sender:', connection.sender.toString());
      
      try {
        // Get the socket ID for the sender
        const senderSocketId = connectedUsers.get(connection.sender.toString());
        console.log('Sender socket ID:', senderSocketId);
        
        // Emit directly to the socket ID instead of using rooms
        io.to(senderSocketId).emit('connectionResponse', {
          ...notificationData,
          responder: {
            _id: responder._id,
            name: responder.name,
            profilePic: responder.profile?.profilePic || '/default-avatar.png'
          }
        });
        console.log('Successfully emitted connectionResponse event');
      } catch (error) {
        console.error('Error emitting connectionResponse event:', error);
      }
    } else {
      console.log('Sender not connected or io not available');
      if (!io) console.log('io is not available');
      if (!connectedUsers.has(connection.sender.toString())) console.log('Sender is not in connected users map');
    }

    // Also emit a notification to the responder (receiver) if the connection was accepted
    if (status === 'accepted' && io && connectedUsers.has(userId.toString())) {
      console.log('Emitting connectionAccepted event to responder:', userId.toString());
      
      try {
        // Get the socket ID for the responder
        const responderSocketId = connectedUsers.get(userId.toString());
        console.log('Responder socket ID:', responderSocketId);
        
        // Emit directly to the socket ID instead of using rooms
        io.to(responderSocketId).emit('connectionAccepted', {
          ...notificationData,
          sender: {
            _id: sender._id,
            name: sender.name,
            profilePic: sender.profile?.profilePic || '/default-avatar.png'
          }
        });
        console.log('Successfully emitted connectionAccepted event');
      } catch (error) {
        console.error('Error emitting connectionAccepted event:', error);
      }
    }

    res.json({ 
      message: `Connection request ${status} successfully`,
      connection: {
        ...connection.toObject(),
        status: status // Ensure the status is correct even if the connection was deleted
      }
    });
  } catch (error) {
    console.error('Error in respondToConnection:', error);
    res.status(500).json({ 
      message: 'Error responding to connection request',
      error: error.message
    });
  }
};

export const getConnections = async (req, res) => {
  try {
    const userId = req.userId; // Use userId from verifyToken middleware
    const { status } = req.query;

    console.log('getConnections called with userId:', userId, 'status filter:', status || 'none');
    console.log('userId type:', typeof userId);
    
    // Find the current user to verify their ID
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      console.log('Warning: Current user not found in database!');
    } else {
      console.log('Current user found:', {
        id: currentUser._id,
        idString: currentUser._id.toString(),
        name: currentUser.name
      });
    }
    
    // Build query based on optional status filter
    const query = {
      $or: [{ sender: userId }, { receiver: userId }]
    };

    if (status) {
      query.status = status;
      console.log('Filtering connections by status:', status);
    }

    console.log('MongoDB query:', JSON.stringify(query));

    const connections = await Connection.find(query)
      .populate({
        path: 'sender',
        select: 'name profile',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      })
      .populate({
        path: 'receiver',
        select: 'name profile',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      })
      .sort({ createdAt: -1 });

    console.log('Found connections count:', connections.length);
    
    // Log all connections for debugging
    connections.forEach((conn, index) => {
      console.log(`Connection ${index}:`, {
        id: conn._id.toString(),
        sender: conn.sender._id.toString(),
        senderName: conn.sender.name,
        receiver: conn.receiver._id.toString(),
        receiverName: conn.receiver.name,
        status: conn.status,
        createdAt: conn.createdAt,
        // Check if this user is the receiver
        isReceiverCurrentUser: conn.receiver._id.toString() === userId.toString(),
        // Check if this user is the sender
        isSenderCurrentUser: conn.sender._id.toString() === userId.toString()
      });
    });

    // Process connections to include profilePic from the profile document
    const enhancedConnections = connections.map(conn => {
      const connObj = conn.toObject();
      
      // Update sender profilePic from the profile if available
      if (connObj.sender && connObj.sender.profile && connObj.sender.profile.profilePic) {
        connObj.sender.profilePic = connObj.sender.profile.profilePic;
        delete connObj.sender.profile; // Remove the profile object to clean up
      } else {
        connObj.sender.profilePic = connObj.sender.profilePic || '/default-avatar.png';
      }
      
      // Update receiver profilePic from the profile if available
      if (connObj.receiver && connObj.receiver.profile && connObj.receiver.profile.profilePic) {
        connObj.receiver.profilePic = connObj.receiver.profile.profilePic;
        delete connObj.receiver.profile; // Remove the profile object to clean up
      } else {
        connObj.receiver.profilePic = connObj.receiver.profilePic || '/default-avatar.png';
      }
      
      return {
        ...connObj,
        _currentUserId: userId.toString(),
        _isCurrentUserReceiver: connObj.receiver._id.toString() === userId.toString(),
        _isCurrentUserSender: connObj.sender._id.toString() === userId.toString()
      };
    });

    res.json(enhancedConnections);
  } catch (error) {
    console.error('Error in getConnections:', error);
    res.status(500).json({ 
      message: 'Error fetching connections',
      error: error.message
    });
  }
};

// Add a new function to remove connections
export const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.body;
    const userId = req.userId; // Use userId from verifyToken middleware

    // Input validation
    if (!connectionId) {
      return res.status(400).json({ message: 'Connection ID is required' });
    }

    // Find the connection
    const connection = await Connection.findOne({
      _id: connectionId,
      status: 'accepted',
      $or: [{ sender: userId }, { receiver: userId }]
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found or not accepted' });
    }

    // Get both users with their profiles
    const [user1, user2] = await Promise.all([
      User.findById(connection.sender).populate('profile', 'profilePic'),
      User.findById(connection.receiver).populate('profile', 'profilePic')
    ]);

    // Decrement connection count for both users
    if (user1 && user1.connections > 0) {
      user1.connections -= 1;
      await user1.save();
    }

    if (user2 && user2.connections > 0) {
      user2.connections -= 1;
      await user2.save();
    }

    // Delete the connection
    await Connection.findByIdAndDelete(connectionId);

    // Get the other user's details
    const otherUserId = connection.sender.toString() === userId ? connection.receiver : connection.sender;
    const otherUser = connection.sender.toString() === userId ? user2 : user1;
    const currentUser = connection.sender.toString() === userId ? user1 : user2;

    // Get io instance
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    // Emit socket event if other user is online
    if (io && connectedUsers.has(otherUserId.toString())) {
      try {
        // Get the socket ID for the other user
        const otherUserSocketId = connectedUsers.get(otherUserId.toString());
        console.log('Other user socket ID:', otherUserSocketId);
        
        // Emit directly to the socket ID instead of using rooms
        io.to(otherUserSocketId).emit('connectionRemoved', {
          connectionId,
          user: {
            _id: currentUser._id,
            name: currentUser.name,
            profilePic: currentUser.profile?.profilePic || '/default-avatar.png'
          }
        });
        console.log('Successfully emitted connectionRemoved event');
      } catch (error) {
        console.error('Error emitting connectionRemoved event:', error);
      }
    }

    res.json({ 
      message: 'Connection removed successfully',
      removedConnection: {
        _id: connectionId,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          profilePic: otherUser.profilePic
        }
      }
    });
  } catch (error) {
    console.error('Error in removeConnection:', error);
    res.status(500).json({ 
      message: 'Error removing connection',
      error: error.message
    });
  }
};

// Add a new function to get the count of pending connection requests
export const getPendingConnectionsCount = async (req, res) => {
  try {
    const userId = req.userId; // Use userId from verifyToken middleware
    console.log('getPendingConnectionsCount: User ID from token:', userId);

    // Count pending connection requests where the user is the receiver
    const count = await Connection.countDocuments({
      receiver: userId,
      status: 'pending'
    });

    console.log('getPendingConnectionsCount: Found', count, 'pending requests for user', userId);

    // For debugging, let's find all pending connections that involve this user
    const allPendingConnections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'pending'
    })
    .populate({
      path: 'sender',
      select: 'name profile',
      populate: {
        path: 'profile',
        select: 'profilePic'
      }
    })
    .populate({
      path: 'receiver',
      select: 'name profile',
      populate: {
        path: 'profile',
        select: 'profilePic'
      }
    });

    if (allPendingConnections.length > 0) {
      console.log('All pending connections involving this user:');
      allPendingConnections.forEach((conn, index) => {
        console.log(`Connection ${index}:`, {
          id: conn._id.toString(),
          sender: conn.sender._id.toString(),
          senderName: conn.sender.name,
          receiver: conn.receiver._id.toString(),
          receiverName: conn.receiver.name,
          userIsSender: conn.sender._id.toString() === userId.toString(),
          userIsReceiver: conn.receiver._id.toString() === userId.toString(),
        });
      });
    }

    res.json({ 
      count, 
      debug: {
        userId: userId.toString(),
        totalPendingConnections: allPendingConnections.length,
        asReceiver: count
      }
    });
  } catch (error) {
    console.error('Error in getPendingConnectionsCount:', error);
    res.status(500).json({ 
      message: 'Error fetching pending connections count',
      error: error.message
    });
  }
};