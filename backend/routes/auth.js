import { Router } from "express";
import { authenticate } from "passport";
import { loginUser, googleCallback, githubCallback } from "../controllers/authController";

const router = Router();

// Login Route
router.post("/login", loginUser);

// Google OAuth Routes
router.get("/google", authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", authenticate("google", { failureRedirect: "/login" }), googleCallback);

// GitHub OAuth Routes
router.get("/github", authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback", authenticate("github", { failureRedirect: "/login" }), githubCallback);

export default router;
