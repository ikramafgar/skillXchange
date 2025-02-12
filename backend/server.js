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
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
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
app.use(userRoutes); // Use user routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
