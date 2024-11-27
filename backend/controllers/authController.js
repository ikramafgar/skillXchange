import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { findOne } from "../models/User";

// Utility Function: Generate JWT
const generateToken = (user) => {
  return sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Login Controller
export async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = generateToken(user);
    res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

// Google OAuth Callback
export function googleCallback(req, res) {
  const token = generateToken(req.user);
  res.redirect(`/dashboard?token=${token}`);
}

// GitHub OAuth Callback
export function githubCallback(req, res) {
  const token = generateToken(req.user);
  res.redirect(`/dashboard?token=${token}`);
}
