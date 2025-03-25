import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await axiosInstance.get(`/api/users?search=${search}`);
      
      // Filter out current user from search results
      const filteredResults = response.data.filter(u => u._id !== user?._id);
      
      setSearchResult(filteredResults);
      setLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setLoading(false);
    }
  };

  const handleChatAccess = async (userId) => {
    try {
      setLoading(true);
      const data = await accessChat(userId);
      if (data) {
        setSelectedChat(data);
        onClose();
      }
      setLoading(false);
    } catch (error) {
      console.error('Error accessing chat:', error);
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Users */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleChatAccess(user._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Notification Badge */}
        {notification.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={resetNotifications}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {notification.map((notif) => (
                <div
                  key={notif._id}
                  className="p-2 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
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
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
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
                      <p className="text-xs text-gray-500">
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
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="font-semibold mb-2">Your Chats</h3>
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedChat(chat);
                  clearNotifications(chat._id);
                  onClose();
                }}
              >
                <p className="font-medium">
                  {chat.participants.find(
                    (p) => p._id !== user?._id
                  )?.name}
                </p>
                {chat.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage.messageType === 'text'
                      ? chat.lastMessage.content
                      : chat.lastMessage.messageType === 'image'
                      ? 'Image'
                      : 'File'}
                  </p>
                )}
              </div>
            ))}
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