import express from 'express';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import connectDB from './config/db.js'; // Import database connection
import authRoutes from './routes/auth.js'; // Import auth routes
import session from 'express-session'; // Add this import
import profileRoutes from './routes/profileRoutes.js'; // Add this import
import userRoutes from './routes/userRoutes.js'; // Add this import
import connectionRoutes from './routes/connectionRoutes.js';
import matchRoutes from './routes/matchRoutes.js'; // Import match routes
import adminRoutes from './routes/adminRoutes.js'; // Import admin routes
import contactRoutes from './routes/contactRoutes.js'; // Import contact routes
import chatRoutes from './routes/chatRoutes.js'; // Import chat routes
import messageRoutes from './routes/messageRoutes.js'; // Import message routes
import sessionRoutes from './routes/sessionRoutes.js'; // Import session routes
import skillRoutes from './routes/skillRoutes.js'; // Import skill routes
import { Server } from 'socket.io';
import { createServer } from 'http';
// import path from 'path';
// import fs from 'fs';

// Configure environment variables
config();

// Import passport strategies
import './config/passport.js';

const app = express();

// Middleware
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '50mb' })); // Increase payload size limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase payload size limit for URL-encoded data

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure CORS with more detailed options
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie']
  })
);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to Database
connectDB();

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Serve static files from the uploads directory
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Skill Exchange API is running...');
});

app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/profile', profileRoutes);
app.use('/', userRoutes); // Use user routes with paths defined in the route file
app.use('/api/connections', connectionRoutes);
app.use('/api/matches', matchRoutes); // Use match routes
app.use('/api/admin', adminRoutes); // Use admin routes
app.use('/api/contact', contactRoutes); // Use contact routes
app.use('/api/chat', chatRoutes); // Use chat routes
app.use('/api/message', messageRoutes); // Use message routes
app.use('/api/sessions', sessionRoutes); // Use session routes
app.use('/api/skills', skillRoutes); // Use skill routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

// Store socket connections with better structure
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected, socket ID:', socket.id);

  socket.on('authenticate', (userId) => {
    if (userId) {
      console.log(`User ${userId} authenticated with socket ID: ${socket.id}`);
      
      // Remove any existing socket connections for this user
      for (const [existingUserId, existingSocketId] of connectedUsers.entries()) {
        if (existingUserId === userId && existingSocketId !== socket.id) {
          console.log(`Replacing existing socket connection for user ${userId}: ${existingSocketId} -> ${socket.id}`);
        }
      }
      
      // Store the user's socket ID
      connectedUsers.set(userId.toString(), socket.id);
      
      // Join a room with the user's ID
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} joined room: ${userId.toString()}`);
      
      console.log('Current connected users:', Array.from(connectedUsers.entries()));
    } else {
      console.log('Received authenticate event without userId');
    }
  });

  // User joins a chat room
  socket.on('join chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  // New message handler
  socket.on('new message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat || !chat.participants) {
      console.log('Chat or participants not defined in message');
      return;
    }

    console.log(`New message in chat ${chat._id}: ${newMessageReceived.content.substring(0, 50)}`);

    // Send to all participants except the sender
    chat.participants.forEach((participant) => {
      // Skip if participant or its ID is undefined
      if (!participant || !participant._id) {
        console.log('Skipping undefined participant or missing _id');
        return;
      }
      
      // Skip the sender
      if (participant._id.toString() === newMessageReceived.sender._id.toString()) {
        return;
      }
      
      // Emit to the user's private room
      io.to(participant._id.toString()).emit('message received', newMessageReceived);
    });
  });

  // User is typing indicator
  socket.on('typing', ({chatId, userId}) => {
    socket.to(chatId).emit('typing', {chatId, userId});
  });

  // User stopped typing indicator
  socket.on('stop typing', (chatId) => {
    socket.to(chatId).emit('stop typing', chatId);
  });

  // Message deleted handler
  socket.on('message deleted', (data) => {
    const { messageId, chatId } = data;
    console.log(`Message deleted event: ${messageId} in chat ${chatId}`);
    
    // Broadcast to all users in the chat room (including sender for consistency)
    io.to(chatId).emit('message deleted', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected, socket ID:', socket.id);
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        console.log(`User ${userId} disconnected, removing socket ID: ${socketId}`);
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('Updated connected users:', Array.from(connectedUsers.entries()));
  });
});

// Make io available to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Use httpServer instead of app.listen
httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
