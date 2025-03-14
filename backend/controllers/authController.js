import User from "../models/User.js";
import Profile from "../models/Profile.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../nodemailer/emails.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { processSkillsArray } from "../utils/skillUtils.js";

export const signup = async (req, res) => {
  console.log("Request Body:", req.body);
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationCode();
    
    // Create user with minimal required fields
    const userData = {
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    
    const user = new User(userData);
    await user.save();
    
    // Create a profile for the user
    const profile = new Profile({
      user: user._id,
      // Default empty values for profile fields
      skillsToLearn: [],
      skillsToTeach: []
    });
    await profile.save();
    
    // Link the profile to the user
    user.profile = profile._id;
    await user.save();
    
    // jwt
    generateTokenAndSetCookie(user._id, res);
    await sendVerificationEmail(user.email, verificationToken);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });

    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {}
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('profile');
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email" });
    }
    generateTokenAndSetCookie(user._id, res);
    user.lastLogin = new Date();
    await user.save();
    
    // Combine user and profile data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      ...(user.profile ? user.profile.toObject() : {})
    };
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
;
  try {
    const {token} = req.params
    const {password} = req.body
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('profile');
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    // Combine user and profile data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      ...(user.profile ? user.profile.toObject() : {})
    };
    
    res.status(200).json({
      success: true,
      message: "User found",
      user: userData
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }
    
    // Decode the JWT token from Google
    const decoded = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
    
    // Check if user exists with this email
    let user = await User.findOne({ email: decoded.email }).populate('profile');
    
    if (!user) {
      // Create a new user
      user = new User({
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        isVerified: true // Google accounts are already verified
      });
      
      // Create a profile for the user
      const profile = new Profile({
        user: user._id,
        skillsToLearn: [],
        skillsToTeach: []
      });
      await profile.save();
      
      // Link the profile to the user
      user.profile = profile._id;
      await user.save();
    } else {
      // Update the user's Google ID if not already set
      if (!user.googleId) {
        user.googleId = decoded.sub;
        await user.save();
      }
      
      // If user exists but doesn't have a profile, create one
      if (!user.profile) {
        const profile = new Profile({
          user: user._id,
          skillsToLearn: [],
          skillsToTeach: []
        });
        await profile.save();
        
        user.profile = profile._id;
        await user.save();
      }
    }
    
    // Set last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    generateTokenAndSetCookie(user._id, res);
    
    // Combine user and profile data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      ...(user.profile ? user.profile.toObject() : {})
    };
    
    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: userData
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(400).json({ message: error.message || "Error logging in with Google" });
  }
};
