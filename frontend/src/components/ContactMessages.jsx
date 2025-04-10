import { useState, useEffect } from 'react';
import customAxios from '../utils/axios';
import { toast } from 'react-toastify';
import { 
  Loader2, 
  Mail, 
  AlertCircle, 
  User, 
  Clock, 
  Trash2, 
  CheckCircle, 
  Inbox,
  Search,
  MailOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  Reply,
  CornerDownRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await customAxios.get('/api/contact/messages');
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      setError('Failed to load contact messages');
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
    toast.success('Messages refreshed');
  };

  // Toggle message expansion
  const toggleMessageExpansion = async (messageId) => {
    if (expandedMessageId === messageId) {
      setExpandedMessageId(null);
      setReplyingToId(null);
    } else {
      // If the message is unread, mark it as read
      const message = messages.find(m => m._id === messageId);
      if (message && message.status === 'unread') {
        try {
          // Try using POST instead of PATCH as it might be causing issues
          await customAxios.post(`/api/contact/messages/${messageId}/mark-read`);
          
          // Update local state
          setMessages(messages.map(msg => 
            msg._id === messageId 
              ? { ...msg, status: 'read' }
              : msg
          ));
        } catch (err) {
          console.error('Error marking message as read:', err);
          toast.error('Failed to mark message as read');
        }
      }
      
      // Then set the expanded message ID
      setExpandedMessageId(messageId);
    }
  };

  // Confirm delete message
  const confirmDeleteMessage = (messageId, e) => {
    if (e) {
      e.stopPropagation();
    }
    setMessageToDelete(messageId);
  };

  // Cancel delete
  const cancelDelete = () => {
    setMessageToDelete(null);
  };

  // Delete message
  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    setIsDeleting(true);
    try {
      await customAxios.delete(`/api/contact/messages/${messageToDelete}`);
      
      // Update local state
      setMessages(messages.filter(message => message._id !== messageToDelete));
      setExpandedMessageId(null);
      setMessageToDelete(null);
      
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle reply form
  const toggleReplyForm = (messageId) => {
    setReplyingToId(replyingToId === messageId ? null : messageId);
    setReplyText('');
  };

  // Send reply
  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsReplying(true);
    try {
      const response = await customAxios.post(`/api/contact/messages/${messageId}/reply`, {
        replyText: replyText
      });

      // Update the message in the local state with the new reply
      setMessages(messages.map(msg => 
        msg._id === messageId 
          ? { ...msg, replies: [...(msg.replies || []), response.data.contactMessage.replies[response.data.contactMessage.replies.length - 1]] }
          : msg
      ));

      setReplyText('');
      setReplyingToId(null);
      toast.success('Reply sent successfully');
    } catch (err) {
      console.error('Error sending reply:', err);
      toast.error('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  // Filter messages based on search term
  const filteredMessages = searchTerm
    ? messages.filter(message => 
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  // Group messages by date
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Mark message as read (manual button)
  const handleMarkAsRead = async (messageId, e) => {
    if (e) {
      e.stopPropagation(); // Prevent toggling expansion when clicking button
    }
    
    try {
      await customAxios.post(`/api/contact/messages/${messageId}/mark-read`);
      
      // Update local state
      setMessages(messages.map(msg => 
        msg._id === messageId 
          ? { ...msg, status: 'read' }
          : msg
      ));
      
      toast.success('Message marked as read');
    } catch (err) {
      console.error('Error marking message as read:', err);
      toast.error('Failed to mark message as read');
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error && !messages.length) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center bg-red-50 p-6 rounded-xl max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Messages</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchMessages} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white">
            <Mail />
          </div>
          <h2 className="text-xl font-bold text-gray-800 ml-3">Contact Messages</h2>
          <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {messages.filter(m => m.status === 'unread').length} unread
          </div>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-gray-50"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">No messages found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'You have no contact messages yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-2">
              <div className="sticky top-0 bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium text-gray-600">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              
              <AnimatePresence>
                {dateMessages.map((message) => (
                  <motion.div 
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                      expandedMessageId === message._id 
                        ? 'shadow-md border-purple-200' 
                        : 'hover:shadow-sm border-gray-100'
                    } ${
                      message.status === 'unread' && expandedMessageId !== message._id
                        ? 'bg-purple-50 border-purple-100'
                        : 'bg-white'
                    }`}
                  >
                    {/* Message Header */}
                    <div 
                      className={`p-4 flex justify-between items-center cursor-pointer ${
                        expandedMessageId === message._id ? 'border-b border-gray-100' : ''
                      }`}
                      onClick={() => toggleMessageExpansion(message._id)}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          message.status === 'unread' 
                            ? 'bg-purple-100 text-purple-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {message.status === 'unread' ? <Mail size={18} /> : <MailOpen size={18} />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 flex items-center">
                            {message.name}
                            {message.status === 'unread' && (
                              <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                            {message.replies && message.replies.length > 0 && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                Replied
                              </span>
                            )}
                          </h4>
                          <div className="flex flex-col xs:flex-row xs:items-center text-sm text-gray-500">
                            <span className="truncate max-w-[150px] sm:max-w-xs">{message.email}</span>
                            <span className="hidden xs:block mx-2">•</span>
                            <span className="text-gray-400">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {message.status === 'unread' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(message._id, e);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors mr-2"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {expandedMessageId === message._id ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {expandedMessageId === message._id && (
                      <div className="p-4 bg-white">
                        <div className="mb-6">
                          <div className="flex items-center mb-2 text-sm text-gray-500">
                            <User size={14} className="mr-1.5" />
                            <span className="font-medium mr-2">From:</span> 
                            <span>{message.name} ({message.email})</span>
                          </div>
                          <div className="flex items-center mb-4 text-sm text-gray-500">
                            <Clock size={14} className="mr-1.5" />
                            <span className="font-medium mr-2">Received:</span>
                            <span>{format(new Date(message.createdAt), 'PPpp')}</span>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap text-gray-700 mb-4">
                            {message.message}
                          </div>
                          
                          {/* Previous Replies */}
                          {message.replies && message.replies.length > 0 && (
                            <div className="mt-6 space-y-4">
                              <h5 className="text-sm font-semibold text-gray-700 flex items-center">
                                <Reply size={16} className="mr-1.5" />
                                Previous Replies
                              </h5>
                              {message.replies.map((reply, index) => (
                                <div key={index} className="pl-4 border-l-2 border-green-300">
                                  <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center mb-1 text-xs text-gray-500">
                                      <Clock size={12} className="mr-1" />
                                      <span>
                                        {format(new Date(reply.date), 'PPpp')}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                                      {reply.text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Form */}
                          {replyingToId === message._id ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 border border-purple-200 rounded-xl overflow-hidden"
                            >
                              <div className="bg-purple-50 p-3 flex items-center">
                                <CornerDownRight size={16} className="text-purple-600 mr-2" />
                                <span className="text-sm font-medium text-purple-700">
                                  Reply to {message.name}
                                </span>
                              </div>
                              <div className="p-3">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Write your reply to ${message.name}...`}
                                  rows={5}
                                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                                  disabled={isReplying}
                                />
                                <div className="flex justify-end mt-3 space-x-2">
                                  <button
                                    onClick={() => toggleReplyForm(message._id)}
                                    className="px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={isReplying}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(message._id)}
                                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                    disabled={isReplying}
                                  >
                                    {isReplying ? (
                                      <>
                                        <Loader2 size={16} className="mr-1.5 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Send size={16} className="mr-1.5" />
                                        Send Reply
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="mt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleReplyForm(message._id);
                                }}
                                className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
                              >
                                <Reply size={16} className="mr-1.5" />
                                Reply to this message
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
                          {messageToDelete === message._id ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 bg-red-50 p-2 rounded-lg"
                            >
                              <span className="text-red-700 text-sm font-medium">Confirm delete?</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage();
                                }}
                                disabled={isDeleting}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
                              >
                                {isDeleting ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <span>Yes</span>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelDelete();
                                }}
                                disabled={isDeleting}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                              >
                                No
                              </button>
                            </motion.div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteMessage(message._id, e);
                              }}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                            >
                              <Trash2 size={16} className="mr-1.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessages; 