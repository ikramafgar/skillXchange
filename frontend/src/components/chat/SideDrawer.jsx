import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import UserListItem from './UserListItem';
import ChatLoading from './ChatLoading';
import axiosInstance from '../../utils/axios';

const SideDrawer = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const { user } = useAuthStore();
  const { 
    setSelectedChat, 
    chats, 
    fetchChats, 
    accessChat, 
    notification,
    clearNotifications,
    resetNotifications,
  } = useChatStore();

  // Handle ESC key press to close drawer
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    // Add event listener for ESC key
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen, fetchChats]);

  const handleSearch = async () => {
    if (!search) {
      return;
    }

    try {
      setLoading(true);
      setSearchError('');
      const response = await axiosInstance.get(`/api/users?search=${search}`);
      
      // Filter out current user from search results
      const filteredResults = response.data.filter(u => u._id !== user?._id);
      
      setSearchResult(filteredResults);
      
      if (filteredResults.length === 0) {
        setSearchError('No connected users found with that name');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError(error.response?.data?.message || 'Error searching for users');
      setLoading(false);
    }
  };

  const handleChatAccess = async (userId) => {
    try {
      setLoading(true);
      setSearchError('');
      const data = await accessChat(userId);
      if (data) {
        setSelectedChat(data);
        onClose();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error accessing chat:', error);
      setSearchError(error.response?.data?.message || 'Error accessing chat');
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`fixed left-0 top-0 h-full md:w-1/3 max-w-md w-4/5 bg-white shadow-2xl transform transition-all duration-400 ease-out 
          ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-70'}`}
        style={{ 
          borderTopRightRadius: '20px',
          borderBottomRightRadius: '20px',
          boxShadow: isOpen ? '10px 0 25px -5px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <div className={`absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-20 bg-indigo-500 rounded-r-lg transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col h-full justify-center items-center">
            <div className="w-1 h-1 bg-white rounded-full my-0.5"></div>
            <div className="w-1 h-1 bg-white rounded-full my-0.5"></div>
            <div className="w-1 h-1 bg-white rounded-full my-0.5"></div>
          </div>
        </div>

        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white" style={{ borderTopRightRadius: '20px' }}>
          <h2 className="text-2xl font-semibold text-gray-800">Chats</h2>
          <div className="flex items-center">
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md mr-2">ESC</span>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Users */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-xl text-sm shadow-sm">
            <p>You can only chat with users you&apos;re connected with.</p>
          </div>
          
          <div className="mb-5">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search connected users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full p-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all duration-200"
                />
                <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-sm flex items-center justify-center group"
              >
                <span className="sr-only">Search</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </div>

          {searchError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm shadow-sm">
              {searchError}
            </div>
          )}

          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar rounded-xl">
            {loading ? (
              <ChatLoading />
            ) : searchResult.length > 0 ? (
              <div className="space-y-2">
                {searchResult.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleChatAccess(user._id)}
                  />
                ))}
              </div>
            ) : search && !searchError ? (
              <div className="text-center py-5 text-gray-500 bg-gray-50 rounded-xl">
                <p>No connected users found</p>
                <p className="text-sm mt-1">Try connecting with users first</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Notification Badge */}
        {notification.length > 0 && (
          <div className="p-5 border-b border-gray-100 bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 text-lg">Notifications</h3>
              <button
                onClick={resetNotifications}
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
              {notification.map((notif) => (
                <div
                  key={notif._id}
                  className="p-3 bg-indigo-50 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors duration-200 shadow-sm"
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    clearNotifications(notif.chat._id);
                    onClose();
                  }}
                >
                  <div className="flex items-center">
                    <img
                      src={notif.sender.profile?.profilePic || ''}
                      alt={notif.sender.name}
                      className="w-11 h-11 rounded-full mr-3 object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{notif.sender.name}: </span>
                        {notif.messageType === 'text'
                          ? notif.content.length > 40
                            ? notif.content.substring(0, 40) + '...'
                            : notif.content
                          : notif.messageType === 'image'
                          ? 'Sent an image'
                          : 'Sent a file'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chats List */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-white">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">Your Chats</h3>
          <div className="space-y-3">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  className="p-3.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200 shadow-sm transform hover:scale-[1.01]"
                  onClick={() => {
                    setSelectedChat(chat);
                    clearNotifications(chat._id);
                    onClose();
                  }}
                >
                  <p className="font-medium text-gray-800">
                    {chat.participants.find(
                      (p) => p._id !== user?._id
                    )?.name}
                  </p>
                  {chat.lastMessage && (
                    <div className="flex justify-between items-center mt-1.5">
                      <p className="text-sm text-gray-500 truncate max-w-[70%]">
                        {chat.lastMessage.messageType === 'text'
                          ? chat.lastMessage.content
                          : chat.lastMessage.messageType === 'image'
                          ? '📷 Image'
                          : '📎 File'}
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <p>No chats yet</p>
                <p className="text-sm mt-1">Start by searching for connected users</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SideDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SideDrawer; 