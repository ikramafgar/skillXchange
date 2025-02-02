import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: { type: String },
    skillsToLearn: { type: String },
    skillsToTeach: { type: String },
    profilePic: { type: String },
    skillLevel: { type: String },
    location: { type: String },
    phone: { type: String },
    github: { type: String },
    linkedin: { type: String },
    role: {
      type: String,
      enum: ['teacher', 'learner', 'both'],
      default: 'learner',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    certificates: [{ type: String }], // Array to store certificate file paths

    sessionsTaught: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    badges: [{ type: String }], // Array to store badges
    coursesEnrolled: {
      type: Number,
      default: 0,
    },
    achievements: [{ type: String }], // Array to store achievements
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;