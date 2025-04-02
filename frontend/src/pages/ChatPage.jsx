import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import SideDrawer from '../components/chat/SideDrawer';
import MyChats from '../components/chat/MyChats';
import ChatBox from '../components/chat/ChatBox';
import { socket } from '../socket';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { 
    setupSocketListeners, 
    notification, 
    selectedChat,
    setSelectedChat,
    clearNotifications,
  } = useChatStore();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { userId } = useParams(); // Get userId from URL params
  const [directChatLoading, setDirectChatLoading] = useState(false);

  // Handle keyboard shortcut to open drawer
  const handleKeyPress = useCallback((event) => {
    // Check if Ctrl+K or Cmd+K is pressed
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault(); // Prevent default browser behavior
      setIsDrawerOpen(prev => !prev); // Toggle drawer
    }
  }, []);

  useEffect(() => {
    // Add event listener for keyboard shortcut
    window.addEventListener('keydown', handleKeyPress);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    // Check if user is authenticated
    const initializeChat = async () => {
      const isLoggedIn = await checkAuth();
      
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }
      
      // Request notification permissions
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          Notification.requestPermission();
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      }
    };

    initializeChat();
  }, [checkAuth, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Store user ID in localStorage for socket authentication
      localStorage.setItem('userId', user._id);
      
      // Ensure socket is connected
      if (!socket.connected) {
        socket.connect();
      }
      
      // Set up socket event listeners
      setupSocketListeners(user._id);
    }
    
    return () => {
      // Clean up when unmounting
      if (socket.connected) {
        socket.off('message received');
        socket.off('typing');
        socket.off('stop typing');
      }
    };
  }, [isAuthenticated, user, setupSocketListeners]);

  // Show toast notification when new message arrives
  useEffect(() => {
    if (notification.length > 0 && notification[0].sender) {
      const latestNotification = notification[0];
      const sender = latestNotification.sender.name;
      const content = latestNotification.messageType === 'text' 
        ? latestNotification.content.substring(0, 30) 
        : latestNotification.messageType === 'image'
          ? 'Sent an image'
          : 'Sent a file';
      
      // Only show notification if not in the same chat
      if (!selectedChat || selectedChat._id !== latestNotification.chat._id) {
        toast(`New message from ${sender}: ${content}${content.length > 30 ? '...' : ''}`, {
          icon: '🔔',
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          iconTheme: {
            primary: '#4F46E5',
            secondary: '#fff',
          },
          onClick: () => {
            // When clicked, open the chat
            setSelectedChat(latestNotification.chat);
            // Clear notifications for this chat
            clearNotifications(latestNotification.chat._id);
          },
        });
      }
    }
  }, [notification, selectedChat]);

  // Effect to handle direct message from profile
  useEffect(() => {
    const accessDirectChat = async () => {
      if (userId && user?._id && userId !== user._id) {
        setDirectChatLoading(true);
        try {
          // Check if we already have a chat with this user
          const chatStore = useChatStore.getState();
          const existingChats = await chatStore.fetchChats();
          
          
          // Find existing chat with this user, checking various possible structures
          const existingChat = existingChats.find(chat => {
            // Safety check for null/undefined chat
            if (!chat) return false;
            
            // Skip group chats
            if (chat.isGroupChat === true) return false;
            
            try {
              // First check users array if it exists
              if (Array.isArray(chat.users)) {
                return chat.users.some(u => {
                  if (!u) return false;
                  return (u._id === userId) || (typeof u === 'string' && u === userId);
                });
              }
              
              // Then check participants array if it exists
              if (Array.isArray(chat.participants)) {
                return chat.participants.some(p => {
                  if (!p) return false;
                  return (p._id === userId) || (typeof p === 'string' && p === userId);
                });
              }
            } catch  {
             
              return false;
            }
            
            // If neither exists, this isn't the chat we're looking for
            return false;
          });
          
          if (existingChat) {
            // We already have a chat, just select it
            setSelectedChat(existingChat);
          } else {
            console.log("Creating new chat with user:", userId);
            // Create a new chat by using the accessChat function from the store
            try {
              const newChat = await chatStore.accessChat(userId);
              setSelectedChat(newChat);
            } catch (err) {
              console.error("Error creating new chat:", err);
              toast.error("Could not create chat. Please try again later.");
            }
          }
        } catch (error) {
          console.error("Error accessing direct chat:", error);
          
          // Provide more specific error messages based on the type of error
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 403) {
              toast.error("You need to connect with this user before starting a chat", {
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                },
              });
            } else if (error.response.status === 404) {
              toast.error("User not found", {
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                },
              });
            } else {
              toast.error(error.response.data?.message || "Failed to access chat", {
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                },
              });
            }
          } else if (error.request) {
            // The request was made but no response was received
            toast.error("Network error. Please check your connection", {
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            });
          } else {
            // Something happened in setting up the request that triggered an Error
            toast.error("Failed to start chat with this user", {
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            });
          }
        } finally {
          setDirectChatLoading(false);
        }
      }
    };
    
    if (userId && user?._id) {
      accessDirectChat();
    }
  }, [userId, user, setSelectedChat]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      {/* Header */}
      <header className="bg-white shadow-sm w-full p-4 flex justify-between items-center mt-14 border-b border-gray-100 sticky top-0 z-20">
        <button 
          className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setIsDrawerOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        
        <div className="flex gap-3">
          {/* Search button for larger screens */}
          <button 
            className="hidden md:flex p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-indigo-600 transition-all duration-200 hover:scale-105 items-center"
            onClick={() => setIsDrawerOpen(true)}
            title="Search users (Ctrl+K)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="text-sm font-medium">Find users</span>
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md">⌘K</span>
          </button>
          
          {/* Notification button */}
          {notification.length > 0 && (
            <div className="relative inline-block">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-indigo-600 transition-colors duration-200 relative"
                onClick={() => setIsDrawerOpen(true)}
                title="View notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {notification.length}
                </span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List - Hidden on mobile */}
        <div className="w-1/3 bg-white border-r border-gray-100 md:flex flex-col hidden shadow-sm">
          <MyChats fetchAgain={fetchAgain} />
        </div>
        
        {/* Chat Area */}
        <div className="w-full md:w-2/3 flex flex-col relative">
          {directChatLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="relative w-14 h-14">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-700 font-medium">Opening chat...</p>
              </div>
            </div>
          )}
          <ChatBox 
            fetchAgain={fetchAgain} 
            setFetchAgain={setFetchAgain}
            directChatLoading={directChatLoading}
          />
        </div>
      </div>
      
      {/* Mobile Chat Action Button - Only visible when no chat is selected */}
      {!selectedChat && (
        <div className="fixed bottom-5 right-5 md:hidden z-10">
          <button 
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            onClick={() => setIsDrawerOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </button>
        </div>
      )}

      {/* Empty state on large screens - when no chat is selected */}
      {/* {!selectedChat && (
        <div className="hidden md:flex absolute inset-0 items-center justify-center" style={{ pointerEvents: 'none' }}>
          <div className="max-w-md text-center p-6 rounded-xl bg-white shadow-sm bg-opacity-80 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-indigo-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No chat selected</h3>
            <p className="text-gray-500 mb-5">Search for connected users to start a conversation or select an existing chat.</p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center mx-auto"
              onClick={() => setIsDrawerOpen(true)}
              style={{ pointerEvents: 'auto' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span>Find Users</span>
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ChatPage; 