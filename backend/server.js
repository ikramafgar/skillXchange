import express, { json } from 'express';
import { config } from 'dotenv';
const passport = require("passport");
const session = require("express-session");
import cors from 'cors';
import connectDB from './config/db.js'; // Import database connection

config();
require("./passport");

const app = express();

// Middleware
app.use(json());
app.use(cors());
app.use(session({ secret: "ikramafgar", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Connect to Database
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('Skill Swap API is running...');
});
const authRoutes = require("./auth");
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on Port:${PORT}`);
});
