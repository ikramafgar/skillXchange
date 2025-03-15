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
import { Server } from 'socket.io';
import { createServer } from 'http';

// Configure environment variables
config();

// Import passport strategies
import './config/passport.js';

const app = express();

// Middleware
app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '50mb' })); // Increase payload size limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase payload size limit for URL-encoded data
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

// Routes
app.get('/', (req, res) => {
  res.send('Skill Exchange API is running...');
});

app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/profile', profileRoutes);
app.use(userRoutes); // Use user routes with paths defined in the route file
app.use('/api/connections', connectionRoutes);
app.use('/api/matches', matchRoutes); // Use match routes
app.use('/api/admin', adminRoutes); // Use admin routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
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
