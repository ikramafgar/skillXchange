import { create } from 'zustand';
import axios from '../utils/axios';
import { useAuthStore } from './authStore';
import { toast } from 'react-hot-toast';

// Helper function to ensure we have a valid object
const ensureObject = (value) => {
  if (!value || typeof value !== 'object') {
    return { _id: 'unknown', name: 'Unknown User', profilePic: '/default-avatar.png' };
  }
  return {
    _id: value._id || 'unknown',
    name: value.name || 'Unknown User',
    profilePic: value.profilePic || '/default-avatar.png',
    ...value
  };
};

export const useConnectionStore = create((set) => ({
  connections: [],
  isLoading: false,
  error: null,

  sendConnectionRequest: async (userId) => {
    console.log('sendConnectionRequest called with userId:', userId);
    set({ isLoading: true, error: null });
    console.log('Set loading state to true');
    
    try {
      // Validate userId
      if (!userId) {
        console.log('Error: userId is missing');
        throw new Error('User ID is required');
      }

      // Check if user is authenticated
      const authState = useAuthStore.getState();
      console.log('Auth state:', authState);
      
      if (!authState.isAuthenticated) {
        console.log('Error: User is not authenticated');
        throw new Error('You must be logged in to send connection requests');
      }

      // Make the request
      console.log('Making POST request to /api/connections/request with userId:', userId);
      const response = await axios.post('/api/connections/request', { userId });
      console.log('Received response from server:', response.data);
      
      // Show success toast with custom styling
      console.log('Showing success toast');
      toast.success('Connection request sent successfully!', {
        icon: '🔗',
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #bae6fd',
        },
      });
      
      // Update state with new connection
      console.log('Updating state with new connection');
      set(state => {
        console.log('Previous connections state:', state.connections);
        const newState = { 
          connections: [...state.connections, response.data.connection],
          isLoading: false,
          error: null
        };
        console.log('New connections state:', newState);
        return newState;
      });

      console.log('Returning response data');
      return response.data;
      
    } catch (error) {
      console.log('Error in sendConnectionRequest:', error);
      
      // Handle different types of errors
      let errorMessage;
      
      if (error.response?.data?.message) {
        console.log('Server responded with error:', error.response.data);
        // Server responded with an error message
        errorMessage = error.response.data.message;
        
        // If connection already exists, return a more user-friendly message and the status
        if (error.response.status === 400 && error.response.data.status) {
          const status = error.response.data.status;
          console.log('Connection already exists with status:', status);
          
          // Create a more user-friendly message based on the status
          if (status === 'pending') {
            errorMessage = 'You already have a pending connection request with this user';
            toast.error('Request already sent: You have a pending request with this user', { 
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#fefce8',
                color: '#854d0e',
                border: '1px solid #fde68a',
              }
            });
          } else if (status === 'accepted') {
            errorMessage = 'You are already connected with this user';
            toast.success('Already connected: You are already connected with this user', { 
              icon: '✅',
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              }
            });
          } else if (status === 'rejected') {
            errorMessage = 'This connection request was previously rejected';
            toast.error('Request previously rejected: This connection was previously declined', { 
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
              }
            });
          }
          
          set({ isLoading: false, error: errorMessage });
          console.log('Returning alreadyExists response');
          return { 
            message: errorMessage,
            status: status,
            alreadyExists: true
          };
        } else {
          // Show error toast for other server errors
          console.log('Showing error toast for server error');
          toast.error(`Error: ${errorMessage}`, { duration: 4000 });
        }
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received from server');
        errorMessage = 'No response from server. Please check your connection.';
        toast.error('Connection Error: No response from server. Please check your connection.', { duration: 4000 });
      } else {
        // Something else happened while setting up the request
        console.log('Error setting up request:', error.message);
        errorMessage = error.message || 'An error occurred while sending the request';
        toast.error(`Error: ${errorMessage}`, { duration: 4000 });
      }

      // Update state with error
      console.log('Updating state with error:', errorMessage);
      set({ 
        error: errorMessage,
        isLoading: false 
      });

      throw new Error(errorMessage);
    }
  },

  respondToConnection: async (connectionId, status) => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate inputs
      if (!connectionId) throw new Error('Connection ID is required');
      if (!['accepted', 'rejected'].includes(status)) {
        throw new Error('Status must be either "accepted" or "rejected"');
      }

      const response = await axios.post('/api/connections/respond', { connectionId, status });
      
      // Update connections state
      set(state => {
        if (status === 'rejected') {
          // If rejected, remove the connection from the state
          return {
            connections: state.connections.filter(conn => conn._id !== connectionId),
            isLoading: false,
            error: null
          };
        } else {
          // If accepted, update the status
          return {
            connections: state.connections.map(conn => 
              conn._id === connectionId 
                ? { ...conn, status } 
                : conn
            ),
            isLoading: false,
            error: null
          };
        }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to respond to connection';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  removeConnection: async (connectionId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate input
      if (!connectionId) throw new Error('Connection ID is required');

      const response = await axios.post('/api/connections/remove', { connectionId });
      
      // Update connections state by removing the connection
      set(state => ({
        connections: state.connections.filter(conn => conn._id !== connectionId),
        isLoading: false,
        error: null
      }));

      // Show success toast
      toast.success('Connection removed successfully', {
        icon: '🔗',
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
        }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove connection';
      
      // Show error toast
      toast.error(`Error: ${errorMessage}`, { duration: 3000 });
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  fetchConnections: async (status = null) => {
    set({ isLoading: true, error: null });
    try {
      const url = status 
        ? `/api/connections?status=${status}`
        : '/api/connections';
      
      console.log('Fetching connections from URL:', url);  
      const response = await axios.get(url);
      console.log('API response for connections:', response.data);
      
      // Log the structure of the first item if available
      if (response.data && response.data.length > 0) {
        console.log('First connection item structure:', JSON.stringify(response.data[0], null, 2));
      }
      
      // Validate and sanitize the data
      let connections = [];
      if (Array.isArray(response.data)) {
        connections = response.data.map(conn => {
          // Ensure proper structure for each connection
          return {
            ...conn,
            _id: conn._id || null,
            sender: ensureObject(conn.sender),
            receiver: ensureObject(conn.receiver),
            status: conn.status || 'unknown'
          };
        });
        console.log('Sanitized connections:', connections.length);
      } else {
        console.error('Expected array of connections but got:', typeof response.data);
      }
      
      set({ 
        connections: connections, 
        isLoading: false,
        error: null
      });

      return connections;
    } catch (error) {
      console.error('Error in fetchConnections:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch connections';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));