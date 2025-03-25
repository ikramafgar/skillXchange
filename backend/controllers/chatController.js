import asyncHandler from 'express-async-handler';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

// @desc    Create or access a one-on-one chat
// @route   POST /api/chat
// @access  Private
export const accessChat = asyncHandler(async (req, res) => {
  console.log('Access chat request received:', req.body);
  console.log('User ID from request:', req.userId);
  
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  try {
    // Get the current user
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      console.log('Current user not found with ID:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Current user found:', currentUser.name);

    // Check if chat already exists between these two users
    let chatExists = await Chat.find({
      isGroupChat: false,
      participants: {
        $all: [req.userId, userId],
      },
    })
      .populate({
        path: 'participants',
        select: '-password',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      })
      .populate('lastMessage');

    console.log('Existing chat check result:', chatExists);

    // Populate the lastMessage sender info
    if (chatExists.length > 0 && chatExists[0].lastMessage) {
      chatExists = await User.populate(chatExists, {
        path: 'lastMessage.sender',
        select: 'name email profile',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      });
    }

    if (chatExists.length > 0) {
      console.log('Returning existing chat');
      res.status(200).json(chatExists[0]);
    } else {
      console.log('Creating new chat between', req.userId, 'and', userId);
      // Create a new chat
      const newChat = {
        participants: [req.userId, userId],
        isGroupChat: false,
      };

      const createdChat = await Chat.create(newChat);
      console.log('New chat created:', createdChat);
      
      const fullChat = await Chat.findById(createdChat._id)
        .populate({
          path: 'participants',
          select: '-password',
          populate: {
            path: 'profile',
            select: 'profilePic'
          }
        });
      console.log('Returning new chat');
      res.status(201).json(fullChat);
    }
  } catch (error) {
    console.error('Error in accessChat:', error);
    res.status(500).json({ message: 'Failed to access or create the chat' });
  }
});

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
export const fetchChats = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching chats for user:', req.userId);
    
    let chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.userId } },
      isGroupChat: false
    })
      .populate({
        path: 'participants',
        select: '-password',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    console.log('Chats found:', chats.length);

    if (chats.length > 0 && chats.some(chat => chat.lastMessage)) {
      chats = await User.populate(chats, {
        path: 'lastMessage.sender',
        select: 'name email profile',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      });
    }

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// @desc    Create a group chat
// @route   POST /api/chat/group
// @access  Private
// export const createGroupChat = asyncHandler(async (req, res) => {
//   if (!req.body.users || !req.body.name) {
//     return res.status(400).json({ message: 'Please fill all the fields' });
//   }

//   let users = JSON.parse(req.body.users);

//   if (users.length < 2) {
//     return res
//       .status(400)
//       .json({ message: 'More than 2 users are required to form a group chat' });
//   }

//   // Add current user to the group
//   users.push(req.user._id);

//   try {
//     const groupChat = await Chat.create({
//       groupName: req.body.name,
//       participants: users,
//       isGroupChat: true,
//       groupAdmin: req.user._id,
//     });

//     const fullGroupChat = await Chat.findById(groupChat._id)
//       .populate('participants', '-password')
//       .populate('groupAdmin', '-password');

//     res.status(201).json(fullGroupChat);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to create the group chat' });
//   }
// });

// @desc    Rename a group chat
// @route   PUT /api/chat/group/rename
// @access  Private
// export const renameGroup = asyncHandler(async (req, res) => {
//   const { chatId, groupName } = req.body;

//   if (!chatId || !groupName) {
//     return res.status(400).json({ message: 'Please provide chatId and new name' });
//   }

//   const updatedChat = await Chat.findByIdAndUpdate(
//     chatId,
//     { groupName },
//     { new: true }
//   )
//     .populate('participants', '-password')
//     .populate('groupAdmin', '-password');

//   if (!updatedChat) {
//     return res.status(404).json({ message: 'Chat not found' });
//   }

//   res.status(200).json(updatedChat);
// });

// @desc    Add user to a group
// @route   PUT /api/chat/group/add
// @access  Private
// export const addToGroup = asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   if (!chatId || !userId) {
//     return res.status(400).json({ message: 'Please provide chatId and userId' });
//   }

//   // Check if the user trying to add is the admin
//   const chat = await Chat.findById(chatId);
//   if (!chat) {
//     return res.status(404).json({ message: 'Chat not found' });
//   }

//   if (chat.groupAdmin.toString() !== req.user._id.toString()) {
//     return res.status(403).json({ message: 'Only admin can add users to the group' });
//   }

//   const updatedChat = await Chat.findByIdAndUpdate(
//     chatId,
//     { $push: { participants: userId } },
//     { new: true }
//   )
//     .populate('participants', '-password')
//     .populate('groupAdmin', '-password');

//   res.status(200).json(updatedChat);
// });

// @desc    Remove user from a group
// @route   PUT /api/chat/group/remove
// @access  Private
// export const removeFromGroup = asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   if (!chatId || !userId) {
//     return res.status(400).json({ message: 'Please provide chatId and userId' });
//   }

//   // Check if the user trying to remove is the admin or the user themselves
//   const chat = await Chat.findById(chatId);
//   if (!chat) {
//     return res.status(404).json({ message: 'Chat not found' });
//   }

//   if (
//     chat.groupAdmin.toString() !== req.user._id.toString() &&
//     userId !== req.user._id.toString()
//   ) {
//     return res.status(403).json({
//       message: 'Only admin can remove users or users can remove themselves',
//     });
//   }

//   const updatedChat = await Chat.findByIdAndUpdate(
//     chatId,
//     { $pull: { participants: userId } },
//     { new: true }
//   )
//     .populate('participants', '-password')
//     .populate('groupAdmin', '-password');

//   res.status(200).json(updatedChat);
// });

// @desc    Delete a chat
// @route   DELETE /api/chat/:chatId
// @access  Private
export const deleteChat = asyncHandler(async (req, res) => {
  try {
    console.log('Deleting chat:', req.params.chatId);
    
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant in the chat
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this chat' });
    }
    
    // For one-on-one chats, just delete the chat
    if (!chat.isGroupChat) {
      // Delete all messages in the chat first
      await Message.deleteMany({ chat: req.params.chatId });
      
      // Then delete the chat
      await Chat.findByIdAndDelete(req.params.chatId);
      
      res.status(200).json({ message: 'Chat deleted successfully' });
    } else {
      // For group chats, only admin can delete
      if (chat.groupAdmin.toString() !== req.userId) {
        return res.status(403).json({ message: 'Only group admin can delete a group chat' });
      }
      
      // Delete all messages in the chat first
      await Message.deleteMany({ chat: req.params.chatId });
      
      // Then delete the chat
      await Chat.findByIdAndDelete(req.params.chatId);
      
      res.status(200).json({ message: 'Group chat deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
}); 