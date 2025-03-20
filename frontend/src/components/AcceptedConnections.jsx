import { useState, useEffect } from 'react';
import { useConnectionStore } from '../store/connectionStore';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/ProfileStore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Loader2, UserMinus, AlertCircle } from 'lucide-react';
import { CONNECTION_UPDATED_EVENT } from './ConnectionRequests';
import { toast } from 'react-hot-toast';

export default function AcceptedConnections() {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newConnection, setNewConnection] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [connectionToRemove, setConnectionToRemove] = useState(null);
  const { fetchConnections, removeConnection } = useConnectionStore();
  const { user } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  const loadAcceptedConnections = async () => {
    try {
      setIsLoading(true);
      const allConnections = await fetchConnections('accepted');
      
      if (allConnections && allConnections.length > 0) {
        // Process connections to get the other user in each connection
        const processedConnections = allConnections.map(conn => {
          const isCurrentUserSender = conn.sender._id === user?._id;
          const otherUser = isCurrentUserSender ? conn.receiver : conn.sender;
          return {
            ...conn,
            otherUser
          };
        });
        
        setConnections(processedConnections);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.error('Error fetching accepted connections:', error);
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadAcceptedConnections();
    }

    // Listen for connection updates
    const handleConnectionUpdate = (event) => {
      if (event.detail.status === 'accepted') {
        // Highlight the new connection
        setNewConnection(event.detail.sender);
        
        // Refresh the connections list
        loadAcceptedConnections();
        
        // Clear the highlight after 5 seconds
        setTimeout(() => {
          setNewConnection(null);
        }, 5000);
      }
    };

    window.addEventListener(CONNECTION_UPDATED_EVENT, handleConnectionUpdate);
    
    return () => {
      window.removeEventListener(CONNECTION_UPDATED_EVENT, handleConnectionUpdate);
    };
  }, [fetchConnections, user]);

  const handleRemoveConnection = async (connectionId) => {
    try {
      setRemovingId(connectionId);
      
      // Get the connection details before removing
      const connectionToBeRemoved = connections.find(conn => conn._id === connectionId);
      const otherUserName = connectionToBeRemoved?.otherUser?.name || 'user';
      
      // Create a loading toast
      const toastId = toast.loading('Removing connection...', { duration: 3000 });
      
      await removeConnection(connectionId);
      
      // Remove the connection from the list
      setConnections(prev => prev.filter(conn => conn._id !== connectionId));
      
      // Refresh profile data to update connection count
      await fetchProfile();
      
      // Dismiss the loading toast
      toast.dismiss(toastId);
      
      // Show success toast
      toast.success(`Connection with ${otherUserName} removed successfully`, {
        icon: '🔗',
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
        }
      });
      
      // Close the modal
      setShowConfirmModal(false);
      setConnectionToRemove(null);
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    } finally {
      setRemovingId(null);
    }
  };

  const openRemoveConfirmation = (connection) => {
    setConnectionToRemove(connection);
    setShowConfirmModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center mb-6">
        <Users className="w-5 h-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold">My Connections</h3>
        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
          {connections.length}
        </span>
      </div>
      
      {connections.length === 0 ? (
        <div className="text-center py-8">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No connections yet</p>
          <p className="text-sm text-gray-400 mt-1">Connect with other users to grow your network</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {connections.map((connection) => (
              <motion.div
                key={connection._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: newConnection && newConnection._id === connection.otherUser._id 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : 'none'
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all relative group ${
                  newConnection && newConnection._id === connection.otherUser._id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : ''
                }`}
              >
                {/* Remove button (visible on hover) */}
                <button
                  onClick={() => openRemoveConfirmation(connection)}
                  className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                  title="Remove connection"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
                
                <Link to={`/user/${connection.otherUser._id}`} className="flex flex-col items-center">
                  <img
                    src={connection.otherUser.profilePic || '/default-avatar.png'}
                    alt={connection.otherUser.name}
                    className="w-16 h-16 rounded-full object-cover mb-2"
                  />
                  <h4 className="font-medium text-gray-800 text-center">{connection.otherUser.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Connected since {new Date(connection.updatedAt).toLocaleDateString()}
                  </p>
                  {newConnection && newConnection._id === connection.otherUser._id && (
                    <span className="mt-2 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs animate-pulse">
                      New Connection
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && connectionToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-500 w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Remove Connection</h3>
            </div>
            
            <div className="flex items-center mb-4">
              <img
                src={connectionToRemove.otherUser.profilePic || '/default-avatar.png'}
                alt={connectionToRemove.otherUser.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <p className="font-medium">{connectionToRemove.otherUser.name}</p>
                <p className="text-sm text-gray-500">
                  Connected since {new Date(connectionToRemove.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove this connection? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConnectionToRemove(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveConnection(connectionToRemove._id)}
                disabled={removingId === connectionToRemove._id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {removingId === connectionToRemove._id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Removing...
                  </>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 