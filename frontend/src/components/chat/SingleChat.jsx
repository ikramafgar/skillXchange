import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import ScrollableChat from './ScrollableChat';
import { toast } from 'react-hot-toast';
import { socket } from '../../socket';

// Common emojis for the emoji picker
const emojiCategories = {
  recent: [],
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
  people: ['👍', '👎', '👋', '👏', '🙌', '🤝', '👨', '👩', '👶', '👦', '👧', '👨‍👩‍👧', '💪', '🧠', '👀'],
  emotions: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
  food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🍕', '🍔']
};

// Emoji keywords for search
const emojiKeywords = {
  '😀': ['smile', 'happy', 'joy', 'grin'], 
  '😃': ['smile', 'happy', 'joy', 'grin'],
  '👍': ['thumbs up', 'good', 'approve', 'like'],
  '👎': ['thumbs down', 'bad', 'disapprove', 'dislike'],
  '❤️': ['heart', 'love', 'like'],
  '🐶': ['dog', 'puppy', 'animal'],
  '🍎': ['apple', 'fruit', 'food'],
  // add more as needed
};

const MAX_RECENT_EMOJIS = 16;

const SingleChat = ({ fetchAgain, setFetchAgain, chatName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const fileInputRef = useRef(null);
  const endMessagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiSearchInputRef = useRef(null);

  const { user } = useAuthStore();
  const {
    selectedChat,
    fetchMessages,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    deleteChat,
    deleteMessage,
  } = useChatStore();


  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedChat?._id) {
      loadMessages();
      markMessagesAsRead(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on('typing', ({ chatId,  userEmail }) => {
      if (selectedChat?._id === chatId && userEmail !== user?.email) {
        setIsTyping(true);
      }
    });

    socket.on('stop typing', (chatId) => {
      if (selectedChat?._id === chatId) {
        setIsTyping(false);
      }
    });

    socket.on('message received', (newMessage) => {
      if (selectedChat?._id === newMessage.chat._id) {
        setMessages(prev => [...prev, newMessage]);
      }
    });

    socket.on('message deleted', ({ messageId, chatId }) => {
      if (selectedChat?._id === chatId) {
        setMessages(prev => {
          return prev.filter(message => message._id !== messageId);
        });
      }
    });

    // Cleanup function
    return () => {
      socket.off('typing');
      socket.off('stop typing');
      socket.off('message received');
      socket.off('message deleted');
    };
  }, [selectedChat, user]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load recent emojis from localStorage on component mount
  useEffect(() => {
    try {
      const savedRecents = localStorage.getItem('recentEmojis');
      if (savedRecents) {
        emojiCategories.recent = JSON.parse(savedRecents);
      }
    } catch (error) {
      console.error('Error loading recent emojis:', error);
    }
  }, []);

  const loadMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const data = await fetchMessages(selectedChat._id);
      setMessages(data);
      setLoading(false);
      socket.emit('join chat', selectedChat._id);
    } catch  {
      toast.error('Failed to load messages');
      setLoading(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (!typing) {
      setTyping(true);
      startTyping(selectedChat._id);
    }

    // Stop typing indicator after 3 seconds of inactivity
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedChat._id);
      setTyping(false);
    }, 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (!isImage && !isPdf) {
        toast.error('Only images and PDF files are supported');
        return;
      }

      setSelectedFile(file);
      console.log(`File selected: ${file.name} (${Math.round(file.size/1024)} KB)`);
      toast.success(`${isImage ? 'Image' : 'File'} ready to send`);

      // Create preview for images
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, show file info
        setFilePreview(null);
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !selectedChat) {
      return;
    }

    try {
      stopTyping(selectedChat._id);
      setShowEmojiPicker(false); // Close emoji picker when sending a message
      
      let messageType = 'text';
      if (selectedFile) {
        messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
        
        // Validate file type against supported types
        const isImage = selectedFile.type.startsWith('image/');
        const isPdf = selectedFile.type === 'application/pdf';
        
        if (!isImage && !isPdf) {
          toast.error('Only images and PDF files are supported');
          return;
        }
        
        console.log('Sending file:', selectedFile.name, selectedFile.type, selectedFile.size);
      }
      
      setLoading(true);
      const data = await sendMessage(
        newMessage,
        selectedChat._id,
        messageType,
        selectedFile
      );
      
      if (!data) {
        throw new Error('Failed to send message - no data returned');
      }
      
      setNewMessage('');
      removeSelectedFile();
      setMessages(prev => [...prev, data]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Send message error:', error);
      toast.error(error?.message || 'Failed to send message');
    }
  };

  const scrollToBottom = () => {
    if (endMessagesRef.current) {
      endMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getChatPartner = () => {
    // Safety check for invalid chat object
    if (!selectedChat || !selectedChat.participants || !Array.isArray(selectedChat.participants)) {
      console.warn('Invalid selectedChat object');
      return null;
    }
    
    if (!user || !user.email) {
      console.warn('User not properly loaded');
      return null;
    }
    
    // Find the participant who is NOT the current user using email
    const currentUserEmail = user.email;
    
    // Find the other participant by email
    const partner = selectedChat.participants.find(p => p.email !== currentUserEmail);
    
    // Debug logs
    if (partner) {
      console.log("Found partner by email:", partner.name);
    } else {
      console.warn("No partner found in chat participants");
      console.log("All participants:", selectedChat.participants.map(p => ({
        name: p.name,
        email: p.email
      })));
    }
    
    return partner;
  };

  const handleDeleteChat = async () => {
    if (!window.confirm('Are you sure you want to delete this entire chat? This cannot be undone.')) {
      return;
    }
    
    try {
      const success = await deleteChat(selectedChat._id);
      if (success) {
        toast.success('Chat deleted successfully');
        setFetchAgain(!fetchAgain); // Refresh the chat list
      } else {
        toast.error('Failed to delete chat');
      }
    } catch  {
      toast.error('Failed to delete chat');
    }
  };

  // Filter emojis based on search term
  const filteredEmojis = useMemo(() => {
    if (!emojiSearch.trim()) {
      return null;
    }
    
    const searchTerm = emojiSearch.toLowerCase();
    const results = [];
    
    // Search through all emojis
    Object.values(emojiCategories).flat().forEach(emoji => {
      // Check if emoji has keywords that match the search
      const keywords = emojiKeywords[emoji] || [];
      if (keywords.some(keyword => keyword.includes(searchTerm))) {
        results.push(emoji);
      }
    });
    
    return results;
  }, [emojiSearch]);

  // Focus search input when emoji picker opens
  useEffect(() => {
    if (showEmojiPicker && emojiSearchInputRef.current) {
      emojiSearchInputRef.current.focus();
    }
  }, [showEmojiPicker]);

  // Handle emoji selection and update recents
  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    setEmojiSearch('');
    
    // Update recent emojis
    try {
      // Remove the emoji if it already exists in recents
      const updatedRecents = emojiCategories.recent.filter(e => e !== emoji);
      
      // Add the emoji to the beginning of the recents array
      updatedRecents.unshift(emoji);
      
      // Limit the number of recent emojis
      emojiCategories.recent = updatedRecents.slice(0, MAX_RECENT_EMOJIS);
      
      // Save to localStorage
      localStorage.setItem('recentEmojis', JSON.stringify(emojiCategories.recent));
    } catch (error) {
      console.error('Error updating recent emojis:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm backdrop-blur-sm bg-opacity-90 sticky top-0 z-10">
        <div className="flex items-center">
          {selectedChat && selectedChat.participants && user && user.email && (
            (() => {
              // Find the participant who is NOT the current user using email
              const currentUserEmail = user.email;
             
              // Find the other participant by email
              const otherUser = selectedChat.participants.find(p => p.email !== currentUserEmail);
              
              // Get values with fallbacks
              const name = otherUser?.name || chatName || 'Chat';
              const avatar = otherUser?.profile?.profilePic || '';
              
              return (
                <>
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-white shadow-md"
                    />
                    <span className="absolute bottom-0 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{name}</h3>
                    {/* <p className="text-xs text-gray-500 flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      Online
                    </p> */}
                  </div>
                </>
              );
            })()
          )}
        </div>
        
        {/* Chat Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDeleteChat}
            className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors duration-200"
            title="Delete chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 border-indigo-100 rounded-full animate-spin"></div>
              </div>
              <p className="mt-3 text-gray-500 text-sm font-medium">Loading messages...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollableChat 
              key={messages.map(m => m._id).join(',')} 
              messages={messages} 
              loading={loading} 
              deleteMessage={deleteMessage} 
            />
          </div>
        )}
        {isTyping && (
          <div className="flex items-center text-gray-500 text-sm mt-1 ml-2">
            <div className="typing-indicator flex space-x-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-[bounce_1s_infinite_0ms]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-[bounce_1s_infinite_200ms]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-[bounce_1s_infinite_400ms]"></span>
            </div>
            <span className="ml-2 text-xs font-medium">typing...</span>
          </div>
        )}
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="px-4 pt-3 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              {filePreview ? (
                <div className="h-16 w-16 rounded-md overflow-hidden mr-3 border border-gray-200 bg-white flex-shrink-0 shadow-sm">
                  <img src={filePreview} alt="Preview" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium truncate max-w-[180px] md:max-w-xs">{selectedFile.name}</p>
                <p className="text-gray-500 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={removeSelectedFile}
              className="p-1.5 text-gray-500 hover:text-red-500 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-all duration-200 relative"
            title="Attach a file (Images or PDF)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
            {loading && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
            disabled={loading}
          />
          
          {/* Emoji Button */}
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 text-gray-500 hover:text-amber-500 rounded-full hover:bg-gray-100 transition-all duration-200"
              title="Add emoji"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg p-3 border border-gray-100 z-20 w-72">
                <div className="mb-2">
                  <input
                    ref={emojiSearchInputRef}
                    type="text"
                    placeholder="Search emoji..."
                    value={emojiSearch}
                    onChange={(e) => setEmojiSearch(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                
                {!filteredEmojis && (
                  <div className="flex border-b mb-2">
                    <button 
                      onClick={() => setActiveEmojiCategory('recent')}
                      className={`p-1.5 flex-1 ${activeEmojiCategory === 'recent' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} text-sm rounded-t-md transition-colors`}
                      title="Recent"
                    >
                      🕒
                    </button>
                    <button 
                      onClick={() => setActiveEmojiCategory('smileys')}
                      className={`p-1.5 flex-1 ${activeEmojiCategory === 'smileys' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} text-sm rounded-t-md transition-colors`}
                      title="Smileys & Emotions"
                    >
                      😀
                    </button>
                    <button 
                      onClick={() => setActiveEmojiCategory('people')}
                      className={`p-1.5 flex-1 ${activeEmojiCategory === 'people' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} text-sm rounded-t-md transition-colors`}
                      title="People"
                    >
                      👍
                    </button>
                    <button 
                      onClick={() => setActiveEmojiCategory('emotions')}
                      className={`p-1.5 flex-1 ${activeEmojiCategory === 'emotions' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} text-sm rounded-t-md transition-colors`}
                      title="Hearts & Symbols"
                    >
                      ❤️
                    </button>
                    <button 
                      onClick={() => setActiveEmojiCategory('animals')}
                      className={`p-1.5 flex-1 ${activeEmojiCategory === 'animals' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} text-sm rounded-t-md transition-colors`}
                      title="Animals"
                    >
                      🐶
                    </button>
                    <button 
                      onClick={() => setActiveEmojiCategory('food')}
                      className={`p-1.5 flex-1 ${activeEmojiCategory === 'food' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} text-sm rounded-t-md transition-colors`}
                      title="Food & Drinks"
                    >
                      🍎
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto pr-1 emoji-scrollbar">
                  {filteredEmojis 
                    ? filteredEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          className="p-1.5 hover:bg-indigo-50 rounded text-xl transition-colors"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))
                    : activeEmojiCategory === 'recent' && emojiCategories.recent.length === 0 ? (
                        <div className="col-span-8 py-4 text-center text-gray-500 text-sm">
                          No recent emojis yet.
                          <br />
                          Your frequently used emojis will appear here.
                        </div>
                      ) : (
                        emojiCategories[activeEmojiCategory].map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            className="p-1.5 hover:bg-indigo-50 rounded text-xl transition-colors"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </button>
                        ))
                      )
                  }
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full py-2.5 px-4 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent transition-all bg-gray-50"
            />
          </div>
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || loading}
            className="p-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full hover:from-indigo-600 hover:to-indigo-700 disabled:from-indigo-300 disabled:to-indigo-400 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

SingleChat.propTypes = {
  fetchAgain: PropTypes.bool.isRequired,
  setFetchAgain: PropTypes.func.isRequired,
  chatName: PropTypes.string.isRequired,
};

export default SingleChat; 