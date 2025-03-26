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
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Your Conversation</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
            // const email = otherUser?.email || "";
            const isSelected = selectedChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  isSelected ? "bg-blue-100 hover:bg-blue-100" : ""
                }`}
                onClick={() => {
                  setSelectedChat(chat);
                  clearNotifications(chat._id);
                }}
              >
                <img
                  src={avatar}
                  alt={name}
                  className="w-12 h-12 rounded-full mr-3 object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium truncate">{name}</p>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {/* <p className="text-xs text-gray-500 truncate">{email}</p> */}
                  {chat.lastMessage ? (
                    <p className="text-sm text-gray-600 truncate">
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
            <p>No chats found</p>
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
