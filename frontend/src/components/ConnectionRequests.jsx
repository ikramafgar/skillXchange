import { useState, useEffect } from 'react';
import { useConnectionStore } from '../store/connectionStore';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/ProfileStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';
import { socket } from '../socket';

// Create a custom event for connection updates
export const CONNECTION_UPDATED_EVENT = 'connection-updated';

export default function ConnectionRequests({ inSidebar = false }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);
  const { fetchConnections, respondToConnection } = useConnectionStore();
  const { user } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  const loadPendingRequests = async () => {
    try {
      setIsLoading(true);
      const connections = await fetchConnections('pending');

      
      if (connections && connections.length > 0) {
        console.log('First connection example:', JSON.stringify(connections[0], null, 2));
      } else {
        console.log('No connections returned from API');
      }
      
      // Filter using the enhanced information provided by the backend
      const requests = connections.filter(conn => {
        // Use the flag provided by the backend if available
        if (conn._isCurrentUserReceiver !== undefined) {
          console.log(`Connection ${conn._id}: Using backend flag _isCurrentUserReceiver:`, conn._isCurrentUserReceiver);
          return conn._isCurrentUserReceiver && conn.status === 'pending';
        }
        
        // Otherwise fall back to manual comparison
        if (!conn.receiver || !user?._id) {
          return false;
        }
        
        // Get string representations to ensure correct comparison
        const receiverId = typeof conn.receiver === 'object' 
          ? (conn.receiver._id?.toString() || '') 
          : String(conn.receiver);
          
        const userId = user._id?.toString() || '';
        
        // Check if THIS user is the RECEIVER of a pending request
        const isMatch = receiverId === userId && conn.status === 'pending';
        return isMatch;
      });
      
      
      setPendingRequests(requests);
    } catch  {

      toast.error('Failed to load connection requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadPendingRequests();
    }

    // Listen for connection updates from other components
    const handleConnectionUpdate = (event) => {
      console.log('ConnectionRequests: Received connection update event', event.detail);
      
      if (user?._id) {
        if (event.detail && event.detail.connection && event.detail.sender) {
          // Handle direct data from socket event
          handleNewConnectionRequest(event.detail);
        } else {
          // Fallback to reloading
          loadPendingRequests();
        }
      }
    };

    // Listen for new connection request via socket
    const handleNewConnectionRequest = (data) => {
      console.log('ConnectionRequests: Received new connection request', data);
      if (!user?._id || !data || !data.connection) {
        console.log('Missing user or connection data');
        return;
      }
    
      
      // Get string IDs for comparison
      const receiverId = data.connection.receiver?.toString() || 
        (typeof data.connection.receiver === 'object' 
          ? data.connection.receiver._id?.toString() 
          : String(data.connection.receiver));
      
      const userId = user._id?.toString() || '';
      
 
      
      // Only process requests meant for this user
      if (receiverId === userId && data.connection.status === 'pending') {
        console.log('This request is for the current user, processing...');
        
        // Construct the new request with proper structure
        const newRequest = {
          _id: data.connection._id,
          sender: data.sender,
          receiver: {
            _id: userId,
            name: user.name || 'You',
            profilePic: user.profilePic || '/default-avatar.png' 
          },
          status: 'pending',
          createdAt: data.connection.createdAt || new Date().toISOString()
        };
        
        console.log('New request constructed:', newRequest);
        
        // Add to state unless it already exists
        setPendingRequests(prev => {
          const exists = prev.some(req => String(req._id) === String(newRequest._id));
          if (!exists) {
            console.log('Adding new request to state');
            return [...prev, newRequest];
          }
          console.log('Request already exists in state');
          return prev;
        });
        
        // Additionally, force a refresh of all requests to ensure consistency
        loadPendingRequests();
      } else {
        console.log('This request is not for the current user or not pending');
      }
    };

    // Add event listeners
    window.addEventListener('connection-updated', handleConnectionUpdate);
    socket.on('connectionRequest', handleNewConnectionRequest);
    
    return () => {
      window.removeEventListener('connection-updated', handleConnectionUpdate);
      socket.off('connectionRequest', handleNewConnectionRequest);
    };
  }, [fetchConnections, user]);

  const handleResponse = async (connectionId, status, senderInfo) => {
    try {
      setProcessingIds(prev => [...prev, connectionId]);
      
      // Create a loading toast
      const toastId = toast.loading(
        `${status === 'accepted' ? 'Accepting' : 'Declining'} connection request...`,
        { duration: 3000 }
      );
      
      const response = await respondToConnection(connectionId, status);
      console.log('Response from respondToConnection:', response);
      
      // Remove the request from the list
      setPendingRequests(prev => 
        prev.filter(request => request._id !== connectionId)
      );
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('connection-updated', { 
        detail: { 
          status, 
          connectionId, // Ensure this is included for highlighting
          sender: senderInfo // Include sender info for the receiver to display
        } 
      }));
      
      console.log('Dispatched connection-updated event with details:', {
        status,
        connectionId,
        sender: senderInfo
      });
      
      // Dismiss the loading toast
      toast.dismiss(toastId);
      
      // If accepted, refresh profile data to update connection count and show success toast
      if (status === 'accepted') {
        await fetchProfile();
        
        // Show success toast with sender's name
        toast.success(
          <div className="flex items-center">
            <img 
              src={senderInfo.profilePic || '/default-avatar.png'} 
              alt={senderInfo.name}
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <div>
              <p className="font-medium">Connection Accepted</p>
              <p className="text-sm">You are now connected with {senderInfo.name}</p>
            </div>
          </div>,
          {
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
            },
          }
        );
      } else if (status === 'rejected') {
        // Show rejection toast
        toast.success(
          <div className="flex items-center">
            <img 
              src={senderInfo.profilePic || '/default-avatar.png'} 
              alt={senderInfo.name}
              className="w-8 h-8 rounded-full mr-2 object-cover grayscale opacity-70"
            />
            <div>
              <p className="font-medium">Connection Declined</p>
              <p className="text-sm">You declined the connection request from {senderInfo.name}</p>
            </div>
          </div>,
          {
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            },
          }
        );
      }
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Failed to process connection request');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== connectionId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className={`w-${inSidebar ? '5' : '8'} h-${inSidebar ? '5' : '8'} animate-spin text-blue-500`} />
      </div>
    );
  }

  console.log('Ready to render with pendingRequests:', pendingRequests, 'length:', pendingRequests.length);

  if (pendingRequests.length === 0) {
    return (
      <div className={`${inSidebar ? '' : 'bg-white p-6 rounded-xl shadow-sm'}`}>
        <div className={`flex items-center ${inSidebar ? 'mb-2' : 'mb-4'}`}>
          <UserPlus className={`${inSidebar ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500 mr-2`} />
          <h3 className={`${inSidebar ? 'text-sm' : 'text-lg'} font-semibold`}>Connection Requests</h3>
        </div>
        <p className={`text-gray-500 text-center ${inSidebar ? 'text-xs py-2' : 'py-4'}`}>No pending connection requests</p>
      </div>
    );
  }

  return (
    <div className={`${inSidebar ? '' : 'bg-white p-6 rounded-xl shadow-sm'}`}>
      <div className={`flex items-center ${inSidebar ? 'mb-2' : 'mb-4'}`}>
        <UserPlus className={`${inSidebar ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500 mr-2`} />
        <h3 className={`${inSidebar ? 'text-sm' : 'text-lg'} font-semibold`}>Connection Requests</h3>
      </div>
      
      <div className={`${inSidebar ? 'space-y-2' : 'space-y-4'}`}>
        {pendingRequests.map((request) => {
          // const senderId = request.sender?._id || 'unknown';
          const senderName = request.sender?.name || 'Unknown User';
          const senderPic = request.sender?.profilePic || '/default-avatar.png';
          
          return (
          <motion.div 
            key={request._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center justify-between ${inSidebar ? 'p-2 text-sm' : 'p-4'} bg-gray-50 rounded-lg`}
          >
            <div className="flex items-center">
              <img 
                src={senderPic} 
                alt={senderName}
                className={`${inSidebar ? 'w-8 h-8' : 'w-10 h-10'} rounded-full mr-3 object-cover`}
              />
              <div>
                <p className={`font-medium text-gray-800 ${inSidebar ? 'text-xs' : ''}`}>{senderName}</p>
                <p className={`${inSidebar ? 'text-xs' : 'text-sm'} text-gray-500`}>Wants to connect with you</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleResponse(request._id, 'accepted', request.sender)}
                disabled={processingIds.includes(request._id)}
                className={`${inSidebar ? 'p-1.5' : 'p-2'} bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50`}
              >
                {processingIds.includes(request._id) ? (
                  <Loader2 className={`${inSidebar ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />
                ) : (
                  <Check className={`${inSidebar ? 'w-4 h-4' : 'w-5 h-5'}`} />
                )}
              </button>
              
              <button
                onClick={() => handleResponse(request._id, 'rejected', request.sender)}
                disabled={processingIds.includes(request._id)}
                className={`${inSidebar ? 'p-1.5' : 'p-2'} bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50`}
              >
                {processingIds.includes(request._id) ? (
                  <Loader2 className={`${inSidebar ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />
                ) : (
                  <X className={`${inSidebar ? 'w-4 h-4' : 'w-5 h-5'}`} />
                )}
              </button>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  );
}