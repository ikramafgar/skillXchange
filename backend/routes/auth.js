import express from "express";
import passport from "passport";
const router = express.Router ();
import {signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, googleLogin } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import jwt from "jsonwebtoken";

router.get("/check-auth",verifyToken,checkAuth)
router.post("/signup", signup)
router.post("/login",login)
router.post("/logout", logout)  
router.post("/verify-email", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)
router.post("/google-login", googleLogin)

// Google OAuth login route
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Set JWT token in cookie after successful authentication
      if (req.user) {
        // Generate token and set cookie
        generateTokenAndSetCookie(req.user._id, res);
        
        // Create a token for the URL to help frontend identify the authenticated session
        const sessionToken = jwt.sign(
          { userId: req.user._id },
          process.env.JWT_SECRET,
          { expiresIn: '5m' } // Short-lived token just for this redirect
        );
        
        // Redirect to frontend with the session token
        res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${sessionToken}`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
      }
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);

export default router;