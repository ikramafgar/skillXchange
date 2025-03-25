import { io } from 'socket.io-client';

// Create socket instance with better configuration
export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  withCredentials: true,
  autoConnect: false,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Add event listeners for connection status
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  
  // If the disconnection was initiated by the server, try to reconnect
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

// Helper function to authenticate user with socket
export const authenticateSocket = (userId) => {
  if (!userId) {
    console.log('No userId provided for socket authentication');
    return;
  }
  
  console.log('Attempting to authenticate socket for user:', userId);
  
  // Make sure socket is connected before authentication
  if (!socket.connected) {
    console.log('Socket not connected, connecting now...');
    socket.connect();
    
    // Wait for connection before authenticating
    socket.on('connect', () => {
      console.log('Socket connected, now authenticating user:', userId);
      socket.emit('authenticate', userId);
    });
  } else {
    socket.emit('authenticate', userId);
    console.log('Socket authentication sent for user:', userId);
  }
};