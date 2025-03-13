import { useState, useEffect } from 'react';
import { useConnectionStore } from '../store/connectionStore';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/ProfileStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';

// Create a custom event for connection updates
export const CONNECTION_UPDATED_EVENT = 'connection-updated';

export default function ConnectionRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);
  const { fetchConnections, respondToConnection } = useConnectionStore();
  const { user } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        setIsLoading(true);
        const connections = await fetchConnections('pending');
        
        // Filter connections where the user is the receiver (incoming requests)
        const requests = connections.filter(conn => 
          conn.receiver._id === user?._id && conn.status === 'pending'
        );
        
        setPendingRequests(requests);
      } catch (error) {
        console.error('Error fetching pending connection requests:', error);
        toast.error('Failed to load connection requests');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?._id) {
      loadPendingRequests();
    }

    // Listen for connection updates from other components
    const handleConnectionUpdate = () => {
      if (user?._id) {
        loadPendingRequests();
      }
    };

    window.addEventListener(CONNECTION_UPDATED_EVENT, handleConnectionUpdate);
    
    return () => {
      window.removeEventListener(CONNECTION_UPDATED_EVENT, handleConnectionUpdate);
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
      
      await respondToConnection(connectionId, status);
      
      // Remove the request from the list
      setPendingRequests(prev => 
        prev.filter(request => request._id !== connectionId)
      );
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent(CONNECTION_UPDATED_EVENT, { 
        detail: { 
          status, 
          connectionId,
          sender: senderInfo
        } 
      }));
      
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
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
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
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center mb-4">
          <UserPlus className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold">Connection Requests</h3>
        </div>
        <p className="text-gray-500 text-center py-4">No pending connection requests</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center mb-4">
        <UserPlus className="w-5 h-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold">Connection Requests</h3>
      </div>
      
      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <motion.div 
            key={request._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <img 
                src={request.sender.profilePic || '/default-avatar.png'} 
                alt={request.sender.name}
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div>
                <p className="font-medium text-gray-800">{request.sender.name}</p>
                <p className="text-sm text-gray-500">Wants to connect with you</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleResponse(request._id, 'accepted', request.sender)}
                disabled={processingIds.includes(request._id)}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                {processingIds.includes(request._id) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={() => handleResponse(request._id, 'rejected')}
                disabled={processingIds.includes(request._id)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {processingIds.includes(request._id) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 