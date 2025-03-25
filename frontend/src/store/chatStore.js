import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import { socket, authenticateSocket } from '../socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  loading: false,
  messageLoading: false,
  error: null,
  notification: [],
  isTyping: false,

  // Reset state
  resetChatState: () => {
    set({
      chats: [],
      selectedChat: null,
      messages: [],
      loading: false,
      messageLoading: false,
      error: null,
      notification: [],
      isTyping: false
    });
  },

  // Get all chats for the current user
  fetchChats: async () => {
    try {
      set({ loading: true, error: null });
      
      const response = await axiosInstance.get(`/api/chat`);
      
      set({ chats: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch chats', 
        loading: false 
      });
      return [];
    }
  },

  // Create or access a one-on-one chat
  accessChat: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      console.log('Attempting to access chat with user:', userId);
      const response = await axiosInstance.post(
        `/api/chat`,
        { userId }
      );
      console.log('Chat access response:', response.data);
      
      const chatExists = get().chats.some(
        (c) => c._id === response.data._id
      );
      
      if (!chatExists) {
        set({ chats: [response.data, ...get().chats] });
      }
      
      set({ selectedChat: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Error accessing chat:', error.response?.data || error.message || error);
      set({ 
        error: error.response?.data?.message || 'Failed to access chat', 
        loading: false 
      });
      return null;
    }
  },

  // Set selected chat
  setSelectedChat: (chat) => {
    set({ selectedChat: chat });
  },

  // Get messages for a chat
  fetchMessages: async (chatId) => {
    try {
      set({ messageLoading: true, error: null });
      
      const response = await axiosInstance.get(`/api/message/${chatId}`);
      
      set({ messages: response.data, messageLoading: false });
      
      // Join the chat room with Socket.io
      socket.emit('join chat', chatId);
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch messages', 
        messageLoading: false 
      });
      return [];
    }
  },

  // Send a message
  sendMessage: async (content, chatId, messageType = 'text', file = null) => {
    try {
      set({ messageLoading: true, error: null });
      
      const formData = new FormData();
      formData.append('content', content);
      formData.append('chatId', chatId);
      formData.append('messageType', messageType);
      
      if (file) {
        formData.append('file', file);
      }
      
      // Create a custom headers object for form data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axiosInstance.post(
        `/api/message`, 
        formData, 
        config
      );
      
      // Add new message to messages array
      const newMessage = response.data;
      set({ messages: [...get().messages, newMessage], messageLoading: false });
      
      // Make sure the chat object is properly formatted for socket emission
      // Create a sanitized version of the message with resolved references
      const messageForSocket = {
        ...newMessage,
        chat: {
          _id: newMessage.chat._id,
          participants: newMessage.chat.participants.map(p => ({
            _id: p._id,
            name: p.name,
            email: p.email
          }))
        }
      };
      
      // Emit the message to other users in the chat
      socket.emit('new message', messageForSocket);
      
      // Update last message in chats
      const updatedChats = get().chats.map((c) => {
        if (c._id === chatId) {
          return { ...c, lastMessage: newMessage };
        }
        return c;
      });
      
      set({ chats: updatedChats });
      
      return newMessage;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send message', 
        messageLoading: false 
      });
      return null;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId) => {
    try {
      await axiosInstance.put(`/api/message/read/${chatId}`, {});
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      console.log('ChatStore: Starting message deletion process for ID:', messageId);
      set({ loading: true, error: null });
      
      // Make sure messageId is valid
      if (!messageId) {
        console.error('ChatStore: Invalid messageId provided (null or undefined)');
        set({ 
          error: 'Invalid message ID', 
          loading: false 
        });
        return false;
      }

      // Log current state before deletion
      const currentMessages = get().messages;
      const messageToDelete = currentMessages.find(m => m._id === messageId);
      console.log('ChatStore: Message to delete found?', !!messageToDelete);
      if (messageToDelete) {
        console.log('ChatStore: Message content:', messageToDelete.content?.substring(0, 30));
      }
      
      // Call the API endpoint
      console.log('ChatStore: Calling API to delete message:', messageId);
      const response = await axiosInstance.delete(`/api/message/delete/${messageId}`);
      console.log('ChatStore: API response status:', response.status);
      
      // Double check for successful response
      if (response.status !== 200) {
        console.error('ChatStore: API returned non-200 status:', response.status);
        set({ 
          error: response.data?.message || 'Server responded with an error', 
          loading: false 
        });
        return false;
      }

      console.log('ChatStore: API call successful, updating local state');
      
      // Update the messages list by removing the deleted message
      const updatedMessages = get().messages.filter(
        (message) => message._id !== messageId
      );
      console.log('ChatStore: Filtered messages count:', updatedMessages.length, 'original count:', currentMessages.length);
      
      // Get the chat ID from the selected chat
      const chatId = get().selectedChat?._id;
      if (chatId) {
        // Emit socket event to notify other users about the deletion
        console.log('ChatStore: Emitting socket event for message deletion');
        socket.emit('message deleted', { messageId, chatId });
      } else {
        console.warn('ChatStore: No chat ID available to emit socket event');
      }
      
      // Update state with filtered messages
      set({ messages: updatedMessages, loading: false });
      console.log('ChatStore: State updated with filtered messages');
      
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      console.error('ChatStore: Error deleting message:', errorMessage);
      console.error('ChatStore: Full error object:', error);
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      return false;
    }
  },

  // Delete a chat
  deleteChat: async (chatId) => {
    try {
      set({ loading: true, error: null });
      
      await axiosInstance.delete(`/api/chat/${chatId}`);
      
      // Remove the deleted chat from the chats list
      const updatedChats = get().chats.filter(
        (chat) => chat._id !== chatId
      );
      
      // If the deleted chat was selected, set selectedChat to null
      if (get().selectedChat && get().selectedChat._id === chatId) {
        set({ selectedChat: null });
      }
      
      set({ chats: updatedChats, loading: false });
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete chat', 
        loading: false 
      });
      return false;
    }
  },

  // Socket typing event handlers
  startTyping: (chatId) => {
    socket.emit('typing', { chatId, userId: localStorage.getItem('userId') });
  },

  stopTyping: (chatId) => {
    socket.emit('stop typing', chatId);
  },

  // Set typing status
  setIsTyping: (status) => {
    set({ isTyping: status });
  },

  // Setup socket listeners for chat functionality
  setupSocketListeners: (userId) => {
    if (!userId) return;
    
    // Authenticate with socket
    authenticateSocket(userId);
    
    // Remove any existing listeners to prevent duplicates
    socket.off('message received');
    socket.off('typing');
    socket.off('stop typing');
    socket.off('message deleted');
    
    // Set up new listeners
    socket.on('message received', (newMessage) => {
      const { addMessage, handleNotification } = get();
      console.log('New message received via socket:', newMessage);
      addMessage(newMessage);
      handleNotification(newMessage);
    });
    
    socket.on('typing', ({chatId, userId: typingUserId}) => {
      const { selectedChat } = get();
      if (selectedChat && selectedChat._id === chatId && typingUserId !== userId) {
        set({ isTyping: true });
      }
    });
    
    socket.on('stop typing', (chatId) => {
      const { selectedChat } = get();
      if (selectedChat && selectedChat._id === chatId) {
        set({ isTyping: false });
      }
    });
    
    // Listen for message deletion events
    socket.on('message deleted', ({ messageId, chatId }) => {
      console.log('Message deletion event received:', messageId, 'in chat', chatId);
      const { selectedChat, messages } = get();
      
      // Only update if we're in the affected chat
      if (selectedChat && selectedChat._id === chatId) {
        // Filter out the deleted message
        const updatedMessages = messages.filter(msg => msg._id !== messageId);
        set({ messages: updatedMessages });
        console.log('Updated messages after deletion event');
      }
    });
  },

  // Add message to messages array (for socket received messages)
  addMessage: (message) => {
    // Check if message already exists
    const exists = get().messages.some(m => m._id === message._id);
    
    if (!exists) {
      set({ messages: [...get().messages, message] });
      
      // Update last message in chats
      const updatedChats = get().chats.map((c) => {
        if (c._id === message.chat._id) {
          return { ...c, lastMessage: message };
        }
        return c;
      });
      
      // Move chat with new message to the top of the list
      const chatIndex = updatedChats.findIndex(c => c._id === message.chat._id);
      if (chatIndex > 0) {
        const chatToMove = updatedChats[chatIndex];
        updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(chatToMove);
      }
      
      set({ chats: updatedChats });
      
      // For image and file messages, show a notification if the chat is not selected
      const { selectedChat } = get();
      if (
        (!selectedChat || selectedChat._id !== message.chat._id) && 
        (message.messageType === 'image' || message.messageType === 'file')
      ) {
        try {
          const messageType = message.messageType === 'image' ? 'an image' : 'a file';
          const senderName = message.sender?.name || 'Someone';
          
          // Use browser notification if available and permission is granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${senderName} sent you ${messageType}`, {
              body: `Click to view and download ${messageType}`,
              icon: message.messageType === 'image' ? message.fileUrl : '/favicon.ico'
            });
          } else {
            // Import toast dynamically to avoid circular dependencies
            import('react-hot-toast').then((toastModule) => {
              const toast = toastModule.toast;
              toast(`${senderName} sent you ${messageType}. Click to view and download.`, {
                duration: 5000,
                icon: message.messageType === 'image' ? '🖼️' : '📎'
              });
            }).catch(() => {
              console.error('Failed to import toast module');
            });
          }
        } catch (error) {
          console.error('Error showing file notification:', error);
        }
      }
    }
  },

  // Add or remove notification
  handleNotification: (newMessage) => {
    const { selectedChat, notification } = get();
    
    // If the chat is not selected or not open, add notification
    if (
      !selectedChat || 
      selectedChat._id !== newMessage.chat._id
    ) {
      // Check if this notification already exists
      const exists = notification.some(
        n => n._id === newMessage._id
      );
      
      if (!exists) {
        console.log('Adding notification for new message:', newMessage);
        set({ notification: [newMessage, ...notification] });
      }
    } else {
      // If chat is selected, mark message as read immediately
      console.log('Chat is selected, marking message as read');
      const { markMessagesAsRead } = get();
      markMessagesAsRead(newMessage.chat._id);
    }
  },

  // Clear notifications for a specific chat
  clearNotifications: (chatId) => {
    const { notification } = get();
    const filteredNotifications = notification.filter(
      n => n.chat._id !== chatId
    );
    
    set({ notification: filteredNotifications });
  },
  
  // Clear all notifications
  resetNotifications: () => {
    set({ notification: [] });
  }
})); 