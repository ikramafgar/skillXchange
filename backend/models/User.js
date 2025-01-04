import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true    
    },
    password: {
        type: String,
        required: false  
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true  
    },
    bio: {
        type: String,
        default: ''
    },
    skillsToLearn: {
        type: String,
        default: ''
    },
    skillsToTeach: {
        type: String,
        default: ''
    },
    skillLevel: {
        type: String,
        default: 'Beginner'
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    github: {
        type: String,
        default: ''
    },
    linkedin: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date
}, {timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;