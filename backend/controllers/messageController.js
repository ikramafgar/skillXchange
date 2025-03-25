import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import cloudinary from '../utils/cloudinary.js';

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching messages for chat:', req.params.chatId);
    
    const messages = await Message.find({ chat: req.params.chatId })
      .populate({
        path: 'sender', 
        select: 'name email profile',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      })
      .populate('chat');

    console.log('Messages found:', messages.length);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// @desc    Send a new message
// @route   POST /api/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  console.log('Send message request received:', req.body);
  console.log('File received:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'No file');
  
  const { content, chatId, messageType } = req.body;

  if (!content && messageType === 'text') {
    return res.status(400).json({ message: 'Message content is required' });
  }

  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required' });
  }

  try {
    // Create the message object
    let messageData = {
      sender: req.userId,
      content: messageType === 'text' ? content : '',
      chat: chatId,
      messageType: messageType || 'text',
    };

    // Add file info for image or file types
    if (req.file && (messageType === 'image' || messageType === 'file')) {
      try {
        // Use the buffer instead of path since we're using memoryStorage
        const fileBuffer = req.file.buffer;
        
        if (!fileBuffer) {
          throw new Error('File buffer is missing');
        }
        
        // Convert buffer to base64 string for Cloudinary
        const base64String = fileBuffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64String}`;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'chat',
          resource_type: 'auto',
        });

        messageData.fileUrl = result.secure_url;
        messageData.fileName = req.file.originalname;
        messageData.fileSize = req.file.size;
        messageData.fileType = req.file.mimetype;
        
        console.log('File uploaded to Cloudinary:', result.secure_url);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Failed to upload file to cloudinary' });
      }
    }

    // Create a new message
    let newMessage = await Message.create(messageData);
    
    // Populate message data
    newMessage = await newMessage.populate([
      {
        path: 'sender',
        select: 'name email profile',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      },
      { path: 'chat' }
    ]);

    // Update the last message in the chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });
    console.log('Chat last message updated');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/message/read/:chatId
// @access  Private
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  try {
    console.log('Marking messages as read for chat:', req.params.chatId);
    console.log('User ID:', req.userId);
    
    await Message.updateMany(
      {
        chat: req.params.chatId,
        readBy: { $ne: req.userId },
      },
      {
        $addToSet: { readBy: req.userId },
      }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// @desc    Delete a message
// @route   DELETE /api/message/delete/:messageId
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const messageId = req.params.messageId;
    console.log('===== DELETE MESSAGE DEBUG =====');
    console.log('Deleting message:', messageId);
    console.log('User ID:', req.userId);
    console.log('Request params:', req.params);
    
    // Validate message ID
    if (!messageId) {
      return res.status(400).json({ message: 'Message ID is required' });
    }
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      console.log('Message not found:', messageId);
      return res.status(404).json({ message: 'Message not found' });
    }
    
    console.log('Message found:', {
      id: message._id,
      sender: message.sender,
      content: message.content?.substring(0, 30)
    });
    
    // Check if user is the sender of the message
    if (message.sender.toString() !== req.userId) {
      console.log('Unauthorized delete attempt:', {
        messageOwner: message.sender.toString(),
        requestUser: req.userId
      });
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    // If message has file, delete from Cloudinary
    if (message.fileUrl && (message.messageType === 'image' || message.messageType === 'file')) {
      try {
        // Extract public_id from the URL
        const cloudinaryUrl = message.fileUrl;
        console.log('Cloudinary URL to delete:', cloudinaryUrl);
        
        // Parse the URL to extract the public ID
        // Format example: https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/chat/some_id.jpg
        const urlParts = cloudinaryUrl.split('/');
        const fileWithVersion = urlParts.slice(-2).join('/'); // "v1234567890/chat/some_id.jpg"
        const filePathWithExt = fileWithVersion.split('/', 2)[1]; // "chat/some_id.jpg"
        const publicId = filePathWithExt.substring(0, filePathWithExt.lastIndexOf('.')); // "chat/some_id"
        
        console.log('Extracted public ID:', publicId);
        
        const deleteResult = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary delete result:', deleteResult);
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        // Continue with message deletion even if file deletion fails
      }
    }
    
    // Delete the message
    await Message.findByIdAndDelete(messageId);
    console.log('Message deleted successfully:', messageId);
    
    // Check if this was the last message in the chat and update the chat if needed
    const chat = await Chat.findById(message.chat);
    if (chat && chat.lastMessage && chat.lastMessage.toString() === messageId) {
      // Find the new last message
      const newLastMessage = await Message.findOne(
        { chat: chat._id },
        {},
        { sort: { createdAt: -1 } }
      );
      
      // Update the chat with the new last message, or null if no messages left
      await Chat.findByIdAndUpdate(chat._id, { 
        lastMessage: newLastMessage ? newLastMessage._id : null 
      });
      console.log('Updated chat last message:', newLastMessage ? newLastMessage._id : 'null');
    }
    
    // Emit socket event for message deletion
    const io = req.app.get('io');
    if (io) {
      console.log(`Emitting message deletion event for chat ${message.chat}`);
      io.to(message.chat.toString()).emit('message deleted', {
        messageId: message._id.toString(),
        chatId: message.chat.toString()
      });
      console.log('Socket event emitted successfully');
    } else {
      console.warn('Socket.io not available - cannot broadcast message deletion');
    }
    
    console.log('===== END DELETE MESSAGE DEBUG =====');
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
}); 