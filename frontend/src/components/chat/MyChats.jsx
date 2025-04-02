import { useEffect } from "react";
import PropTypes from "prop-types";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import ChatLoading from "./ChatLoading";
import { format } from "date-fns";

const MyChats = ({ fetchAgain }) => {
  const { user } = useAuthStore();
  const {
    chats,
    fetchChats,
    selectedChat,
    setSelectedChat,
    clearNotifications,
    loading,
  } = useChatStore();

  useEffect(() => {
    fetchChats();
  }, [fetchAgain, fetchChats]);

  // Listen for updates to chats
  useEffect(() => {
    // When a new message is received, update the chat list
    const refreshChats = () => {
      fetchChats();
    };

    // Refresh chats every minute to ensure data is up to date
    const intervalId = setInterval(refreshChats, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchChats]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    // If today, return time
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    }

    // If this week, return day name
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(date, "EEE");
    }

    // Otherwise return date
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Your Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 custom-scrollbar">
        {loading ? (
          <ChatLoading />
        ) : chats.length > 0 ? (
          chats.map((chat) => {
            // Make sure user is loaded
            if (!user || !user.email) {
              return null;
            }

            // Find the other user by email comparison
            const currentUserEmail = user.email;

            // Find the other participant by email
            const otherUser = chat.participants.find(
              (p) => p.email !== currentUserEmail
            );
            const name = otherUser?.name || "User";
            const avatar = otherUser?.profile?.profilePic || "";
            const isSelected = selectedChat?._id === chat._id;
            
            // Check if there are unread messages in this chat
            const hasNotifications = chat.hasUnreadMessages;

            return (
              <div
                key={chat._id}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? "bg-indigo-50 border-l-4 border-indigo-500 pl-2 shadow-md" 
                    : "hover:bg-white hover:shadow-sm"
                }`}
                onClick={() => {
                  setSelectedChat(chat);
                  clearNotifications(chat._id);
                }}
              >
                <div className="relative">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-white shadow-sm"
                  />
                  {hasNotifications && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                      {/* Notification indicator */}
                      <span className="animate-pulse">•</span>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-medium truncate ${hasNotifications ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {name}
                    </p>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage ? (
                    <p className={`text-sm truncate ${hasNotifications ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {chat.lastMessage.messageType === "text"
                        ? chat.lastMessage.content
                        : chat.lastMessage.messageType === "image"
                        ? "📷 Image"
                        : "📎 File"}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No messages yet
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-gray-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <p className="text-lg font-medium mb-1">No chats found</p>
            <p className="text-sm">Start a conversation with someone!</p>
          </div>
        )}
      </div>
    </div>
  );
};

MyChats.propTypes = {
  fetchAgain: PropTypes.bool,
};

export default MyChats;
