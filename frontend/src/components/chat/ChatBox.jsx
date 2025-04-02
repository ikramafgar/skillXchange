import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import SingleChat from './SingleChat';
import { socket } from '../../socket';

const ChatBox = ({ fetchAgain, setFetchAgain, directChatLoading = false }) => {
  const { user } = useAuthStore();
  const { selectedChat, setSelectedChat } = useChatStore();

  useEffect(() => {
    // Cleanup function for socket events
    return () => {
      if (socket.connected) {
        socket.off('typing');
        socket.off('stop typing');
      }
    };
  }, []);

  const getChatName = (chat) => {
    // Safety check for invalid chat object
    if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
      console.warn('ChatBox: Invalid chat object');
      return 'Chat';
    }
    
    if (!user || !user.email) {
      console.warn('ChatBox: User not properly loaded');
      return 'Chat';
    }
    
    // Find the participant who is NOT the current user using email comparison
    const currentUserEmail = user.email;
    // Find the other participant by email
    const otherUser = chat.participants.find(p => p.email !== currentUserEmail);
    
    // If the other user is found, return their name
    if (otherUser) {
      return otherUser.name;
    } 

    return 'Chat';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {directChatLoading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative w-14 h-14">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-700 font-medium">Opening chat...</p>
        </div>
      ) : selectedChat ? (
        <SingleChat
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          chatName={getChatName(selectedChat)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center px-8 py-6 max-w-md bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Welcome to SkillXchange Chat
            </h3>
            <p className="text-gray-600 mb-4">
              Select a chat from the list or start a new conversation to begin messaging
            </p>
            <button
              onClick={() => document.querySelector('[title="Search connected users..."]')?.click()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full"
            >
              Find Someone to Chat With
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ChatBox.propTypes = {
  fetchAgain: PropTypes.bool.isRequired,
  setFetchAgain: PropTypes.func.isRequired,
  directChatLoading: PropTypes.bool
};

export default ChatBox; 