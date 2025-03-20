import { useEffect, useState, useRef } from 'react';
import { Bell, X, Check, Clock } from 'lucide-react';
import { socket, authenticateSocket } from '../socket';
import { useAuthStore } from '../store/authStore';
import { useConnectionStore } from '../store/connectionStore';
import { toast } from 'react-hot-toast';
import { CONNECTION_UPDATED_EVENT } from './ConnectionRequests';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications({ inSidebar = false, inMobileMenu = false, isOpen = false }) {
  const [notifications, setNotifications] = useState([]);
  const [viewedNotifications, setViewedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(isOpen);
  const notificationRef = useRef(null);
  const { user } = useAuthStore();
  const { respondToConnection, fetchConnections } = useConnectionStore();

  // Update showPanel when isOpen prop changes
  useEffect(() => {
    setShowPanel(isOpen);
  }, [isOpen]);

  // Initialize socket connection and fetch pending connections
  useEffect(() => {
    if (!user?._id) return;
    
    console.log('Initializing socket connection for user:', user._id);
    
    // Connect and authenticate socket
    authenticateSocket(user._id);
    
    // Fetch existing pending connection requests
    const loadPendingConnections = async () => {
      try {
        const connections = await fetchConnections('pending');
        
        // Filter connections where the user is the receiver (incoming requests)
        const pendingRequests = connections.filter(conn => 
          conn.receiver._id === user._id && conn.status === 'pending'
        );
        
        // Add to notifications state
        if (pendingRequests.length > 0) {
          setNotifications(pendingRequests.map(conn => ({
            id: conn._id,
            type: 'request',
            connection: conn,
            sender: conn.sender,
            timestamp: new Date(conn.createdAt).getTime(),
            read: false
          })));
        }
      } catch (error) {
        console.error('Error fetching pending connections:', error);
      }
    };
    
    loadPendingConnections();

    // Remove any existing listeners to prevent duplicates
    socket.off('connectionRequest');
    socket.off('connectionResponse');
    socket.off('connectionRemoved');
    socket.off('connectionAccepted');

    // Handle connection request
    socket.on('connectionRequest', ({ connection, sender }) => {
      // Add to notifications state
      setNotifications(prev => [
        ...prev, 
        { 
          id: connection._id,
          type: 'request', 
          connection, 
          sender,
          timestamp: Date.now(),
          read: false
        }
      ]);

      // Show toast notification
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-blue-500 ring-opacity-20`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img 
                  className="h-10 w-10 rounded-full" 
                  src={sender.profilePic || 'images/default-avatar.png'} 
                  alt={sender.name}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {sender.name} sent you a connection request
                </p>
                <div className="mt-1 flex space-x-4">
                  <button
                    onClick={() => {
                      handleResponse(connection._id, 'accepted');
                      toast.dismiss(t.id);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 bg-blue-50 px-3 py-1 rounded-full"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      handleResponse(connection._id, 'rejected');
                      toast.dismiss(t.id);
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-500 bg-red-50 px-3 py-1 rounded-full"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    });

    // Handle connection response
    socket.on('connectionResponse', ({ connection, responder }) => {
      console.log('Received connection response notification:', { connection, responder });
      console.log('Current user ID:', user?._id);
      console.log('Connection sender ID:', connection.sender);
      console.log('Connection receiver ID:', connection.receiver);
      
      // Remove from notifications if exists
      setNotifications(prev => 
        prev.filter(n => n.connection._id !== connection._id)
      );

      // Show toast notification
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ${
          connection.status === 'accepted' 
            ? 'bg-green-50 ring-green-500 ring-opacity-20' 
            : 'bg-red-50 ring-red-500 ring-opacity-20'
        }`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img 
                  className={`h-10 w-10 rounded-full ${connection.status === 'rejected' ? 'grayscale opacity-70' : ''}`}
                  src={responder.profilePic || '/default-avatar.png'} 
                  alt={responder.name}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {responder.name} {connection.status === 'accepted' ? 'accepted' : 'declined'} your connection request
                </p>
                {connection.status === 'accepted' && (
                  <p className="mt-1 text-sm text-green-600">
                    You can now message and interact with {responder.name}
                  </p>
                )}
                {connection.status === 'rejected' && (
                  <p className="mt-1 text-sm text-red-600">
                    Your connection request has been declined
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 5000 });

      // If accepted, update the connection list
      if (connection.status === 'accepted') {
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent(CONNECTION_UPDATED_EVENT, { 
          detail: { 
            status: connection.status, 
            connectionId: connection._id,
            responder
          } 
        }));
      }
    });

    // Handle connection removed
    socket.on('connectionRemoved', ({ connectionId, user }) => {
      console.log('Received connection removed notification:', { connectionId, user });
      
      // Show toast notification
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-red-500 ring-opacity-20`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img 
                  className="h-10 w-10 rounded-full grayscale opacity-70"
                  src={user.profilePic || '/default-avatar.png'} 
                  alt={user.name}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.name} removed you from their connections
                </p>
                <p className="mt-1 text-sm text-red-600">
                  You are no longer connected with this user
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 5000 });
      
      // Dispatch a custom event to notify other components to refresh
      window.dispatchEvent(new CustomEvent(CONNECTION_UPDATED_EVENT));
    });

    // Handle connection accepted (for the receiver who accepted the request)
    socket.on('connectionAccepted', ({ connection, sender }) => {
      console.log('Received connection accepted notification:', { connection, sender });
      
      // Show toast notification
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-green-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-green-500 ring-opacity-20`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img 
                  className="h-10 w-10 rounded-full"
                  src={sender.profilePic || '/default-avatar.png'} 
                  alt={sender.name}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  You accepted {sender.name}&apos;s connection request
                </p>
                <p className="mt-1 text-sm text-green-600">
                  You can now message and interact with {sender.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 5000 });
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent(CONNECTION_UPDATED_EVENT, { 
        detail: { 
          status: connection.status, 
          connectionId: connection._id,
          sender
        } 
      }));
    });

    // Cleanup
    return () => {
      console.log('Cleaning up socket event listeners');
      socket.off('connectionRequest');
      socket.off('connectionResponse');
      socket.off('connectionRemoved');
      socket.off('connectionAccepted');
    };
  }, [user, fetchConnections]);

  // Handle click outside to close notification panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationRef]);

  // Mark notifications as viewed when panel is opened
  useEffect(() => {
    if (showPanel && notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        // Mark all as read
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        
        // Move previously unread to viewed
        setViewedNotifications(prev => [
          ...prev,
          ...unreadNotifications
        ]);
      }
    }
  }, [showPanel, notifications]);

  // Handle response to connection request
  const handleResponse = async (connectionId, status) => {
    try {
      setIsLoading(true);
      await respondToConnection(connectionId, status);
      
      // Remove from notifications
      setNotifications(prev => prev.filter(n => n.id !== connectionId));
      
      // Show success message
      toast.success(`Connection request ${status === 'accepted' ? 'accepted' : 'declined'}`);
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Failed to respond to connection request');
    } finally {
      setIsLoading(false);
    }
  };

  // Format time to relative format (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'just now';
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    // Convert to days
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    // Return formatted date
    return new Date(timestamp).toLocaleDateString();
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Don't render the bell if in mobile menu, just show the counter
  if (inMobileMenu) {
    return (
      <div className="relative inline-block">
        {unreadCount > 0 && (
          <span className="flex items-center justify-center h-5 min-w-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
    );
  }

  // If isOpen is true, only render the content panel
  if (isOpen) {
    return (
      <>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(80vh-8rem)] md:max-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  {notification.type === 'request' && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                          src={notification.sender.profilePic || 'images/default-avatar.png'} 
                          alt={notification.sender.name}
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.sender.name}
                          </p>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Sent you a connection request
                        </p>
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => handleResponse(notification.id, 'accepted')}
                            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleResponse(notification.id, 'rejected')}
                            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No new notifications</p>
              <p className="text-sm text-gray-500 mt-1">We&apos;ll notify you when something arrives</p>
            </div>
          )}
        </div>
        
        {viewedNotifications.length > 0 && (
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setViewedNotifications([])}
              className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
            >
              Clear all viewed notifications
            </button>
          </div>
        )}
      </>
    );
  }

  // Default bell button rendering
  return (
    <div className="relative inline-block notifications-container" ref={notificationRef}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-1.5 rounded-full ${
          inSidebar 
            ? 'hover:bg-gray-100' 
            : 'text-gray-700 hover:text-violet-400 transition-colors'
        } focus:outline-none`}
        aria-label="Notifications"
      >
        <Bell className={`${inSidebar ? 'w-5 h-5' : 'w-6 h-6'} ${unreadCount > 0 ? 'text-blue-500' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute notification-dropdown ${
              inSidebar 
                ? 'right-4 top-20 w-72 sm:w-80' 
                : 'right-0 top-12 w-72 sm:w-80 md:w-96'
            } bg-white rounded-xl shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden z-50`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <button 
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(80vh-8rem)] md:max-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length > 0 ? (
                <div>
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                    >
                      {notification.type === 'request' && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                              src={notification.sender.profilePic || 'images/default-avatar.png'} 
                              alt={notification.sender.name}
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.sender.name}
                              </p>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatRelativeTime(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Sent you a connection request
                            </p>
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={() => handleResponse(notification.id, 'accepted')}
                                className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleResponse(notification.id, 'rejected')}
                                className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No new notifications</p>
                  <p className="text-sm text-gray-500 mt-1">We&apos;ll notify you when something arrives</p>
                </div>
              )}
            </div>
            
            {viewedNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setViewedNotifications([])}
                  className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                >
                  Clear all viewed notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}