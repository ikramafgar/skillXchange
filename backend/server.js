import express from 'express';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import connectDB from './config/db.js'; // Import database connection
import authRoutes from './routes/auth.js'; // Import auth routes
import session from 'express-session'; // Add this import

// Configure environment variables
config();

// Import passport strategies
import './config/passport.js';

const app = express();

// Middleware
app.use(express.json()); // Built-in middleware for parsing JSON
// app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(cookieParser()); // Parse cookies
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
    origin: "http://localhost:5173", // or your frontend URL
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
