import { useState, useEffect } from 'react';
import { useConnectionStore } from '../store/connectionStore';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/ProfileStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Loader2, UserMinus, AlertCircle, Mail, Phone, MapPin, Lightbulb, Book, ExternalLink } from 'lucide-react';
import { CONNECTION_UPDATED_EVENT } from './ConnectionRequests';
import { toast } from 'react-hot-toast';
import UserProfileModal from './UserProfileModal';

export default function AcceptedConnections() {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newConnectionId, setNewConnectionId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [connectionToRemove, setConnectionToRemove] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showConnectionInfoModal, setShowConnectionInfoModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
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
          // IMPORTANT: Prefer to use the backend flag if available
          let isCurrentUserSender = false;
          
          if (conn._isCurrentUserSender !== undefined) {
            // Use the backend flag
            isCurrentUserSender = conn._isCurrentUserSender;
          } else {
            // Fallback to manual calculation if backend flag not available
            const currentUserId = user?._id?.toString();
            const senderId = typeof conn.sender === 'object' 
              ? conn.sender._id?.toString() 
              : String(conn.sender);
            isCurrentUserSender = senderId === currentUserId;
          }
          
          // Set the otherUser based on whether current user is sender or receiver
          const otherUser = isCurrentUserSender ? conn.receiver : conn.sender;
          
          // Ensure otherUser has all required properties
          const sanitizedOtherUser = {
            _id: otherUser._id || 'unknown',
            name: otherUser.name || 'Unknown User',
            profilePic: otherUser.profilePic || '/default-avatar.png',
            ...otherUser
          };
          
          return {
            ...conn,
            otherUser: sanitizedOtherUser,
            isCurrentUserSender
          };
        });
        
        console.log('Processed connections:', processedConnections);
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
      console.log('AcceptedConnections: Received connection update event', event.detail);
      
      if (event.detail.status === 'accepted') {
        const { connectionId, sender } = event.detail;
        
        // Store the connection ID to highlight
        if (connectionId) {
          console.log('Setting new connection ID for highlight:', connectionId);
          setNewConnectionId(connectionId);
          
          // Clear the highlight after 5 seconds
          setTimeout(() => {
            setNewConnectionId(null);
          }, 5000);
        }
        
        // Refresh the connections list
        loadAcceptedConnections();
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

  const openConnectionInfoModal = (connection, e) => {
    // Prevent navigation if clicking on the connection card
    if (e) {
      e.preventDefault();
    }
    
    setSelectedConnection(connection);
    setShowConnectionInfoModal(true);
  };

  const openProfileModal = (connection) => {
    setSelectedUserProfile(connection.otherUser);
    setSelectedConnection(connection);
    setShowProfileModal(true);
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
            {connections.map((connection) => {
              // Check if this is the newly accepted connection
              const isNewConnection = newConnectionId && connection._id === newConnectionId;
              
              return (
                <motion.div
                  key={connection._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    boxShadow: isNewConnection
                      ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                      : 'none'
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all relative group ${
                    isNewConnection 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : ''
                  }`}
                >
                  {/* Remove button (visible on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openRemoveConfirmation(connection);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 z-10"
                    title="Remove connection"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                  
                  <div 
                    onClick={(e) => openConnectionInfoModal(connection, e)}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <img
                      src={connection.otherUser.profilePic || '/default-avatar.png'}
                      alt={connection.otherUser.name}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                    <h4 className="font-medium text-gray-800 text-center">{connection.otherUser.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Connected since {new Date(connection.updatedAt).toLocaleDateString()}
                    </p>
                    {isNewConnection && (
                      <span className="mt-2 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs animate-pulse">
                        New Connection
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Confirmation Modal for Removing Connection */}
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

      {/* Connection Info Modal */}
      {showConnectionInfoModal && selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Connection Details</h3>
              <button 
                onClick={() => setShowConnectionInfoModal(false)} 
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <img
                src={selectedConnection.otherUser.profilePic || '/default-avatar.png'}
                alt={selectedConnection.otherUser.name}
                className="w-24 h-24 rounded-full object-cover mb-3"
              />
              <h2 className="text-xl font-bold text-gray-800">{selectedConnection.otherUser.name}</h2>
              <div className="flex items-center mt-1">
                <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">Connected since {new Date(selectedConnection.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {selectedConnection.otherUser.bio && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{selectedConnection.otherUser.bio}</p>
                </div>
              )}
              
              <div className="space-y-2">
                {selectedConnection.otherUser.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{selectedConnection.otherUser.email}</span>
                  </div>
                )}
                
                {selectedConnection.otherUser.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{selectedConnection.otherUser.phone}</span>
                  </div>
                )}
                
                {selectedConnection.otherUser.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{selectedConnection.otherUser.location}</span>
                  </div>
                )}
              </div>
              
              {/* Skills to Teach */}
              {selectedConnection.otherUser.skillsToTeach && selectedConnection.otherUser.skillsToTeach.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mr-2" />
                    <h4 className="font-medium text-gray-700">Skills Teaching</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnection.otherUser.skillsToTeach.map((skillItem, index) => {
                      const skillName = skillItem.skill?.name || skillItem.name || skillItem;
                      return skillName ? (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-100"
                        >
                          {skillName}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {/* Skills to Learn */}
              {selectedConnection.otherUser.skillsToLearn && selectedConnection.otherUser.skillsToLearn.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <Book className="w-4 h-4 text-blue-500 mr-2" />
                    <h4 className="font-medium text-gray-700">Skills Learning</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnection.otherUser.skillsToLearn.map((skillItem, index) => {
                      const skillName = skillItem.skill?.name || skillItem.name || skillItem;
                      return skillName ? (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100"
                        >
                          {skillName}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfirmModal(true);
                  setConnectionToRemove(selectedConnection);
                  setShowConnectionInfoModal(false);
                }}
                className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
              >
                <UserMinus className="w-4 h-4 mr-1" />
                Remove Connection
              </button>
              
              <button
                onClick={() => {
                  setShowConnectionInfoModal(false);
                  openProfileModal(selectedConnection);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Full Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full User Profile Modal */}
      <UserProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userData={selectedUserProfile}
        connectionDate={selectedConnection?.updatedAt}
      />
    </div>
  );
} 