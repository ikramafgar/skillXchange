import express from "express";
import passport from "passport";
const router = express.Router ();
import {signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

router.get("/check-auth",verifyToken,checkAuth)
router.post("/signup", signup)
router.post("/login",login)
router.post("/logout", logout)  
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)

// Google OAuth login route
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: process.env.FRONTEND_URL + '/profile'
  })
);

export default router;