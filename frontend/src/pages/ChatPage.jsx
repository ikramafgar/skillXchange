import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    clearNotifications
  } = useChatStore();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
            border: '1px solid #38B2AC',
            padding: '16px',
            color: '#333',
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

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      {/* Header */}
      <header className="bg-white shadow-sm w-full p-3 flex justify-between items-center mt-14">
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setIsDrawerOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        
        <div className="flex gap-2">
          {/* Search button - visible on all screens */}
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setIsDrawerOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          
          {notification.length > 0 && (
            <div className="relative inline-block">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => setIsDrawerOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notification.length}
                </span>
              </button>
            </div>
          )}
          
          {/* <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => navigate('/profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button> */}
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List - Hidden on mobile */}
        <div className="w-1/3 bg-white border-r border-gray-200 md:flex flex-col hidden">
          <MyChats fetchAgain={fetchAgain} />
        </div>
        
        {/* Chat Area */}
        <div className="w-full md:w-2/3 flex flex-col">
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
      </div>
      
      {/* Mobile Chat List Button - Only visible when no chat is selected */}
      {!selectedChat && (
        <div className="fixed bottom-5 right-5 md:hidden">
          <button 
            className="bg-blue-600 text-white rounded-full p-4 shadow-lg"
            onClick={() => setIsDrawerOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPage; 