import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Import database connection

config();

const app = express();

// Middleware
app.use(json());
app.use(cors());

// Connect to Database
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('Skill Swap API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on Port:${PORT}`);
});
