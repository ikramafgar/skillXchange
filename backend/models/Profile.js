import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bio: { type: String },
    skills: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Skill' 
    }],
    skillsToLearn: [{ 
      skill: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Skill',
        required: false
      },
      level: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced'], 
        default: 'beginner' 
      },
      _id: false
    }],
    skillsToTeach: [{ 
      skill: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Skill',
        required: false
      },
      level: { 
        type: String, 
        enum: ['intermediate', 'advanced', 'expert'], 
        default: 'intermediate' 
      },
      yearsOfExperience: { 
        type: Number, 
        default: 0 
      },
      _id: false
    }],
    profilePic: { type: String },
    title: { type: String },
    work: { type: String },
    skillLevel: { type: String },
    location: { type: String },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    },
    matchingMode: {
      type: String,
      enum: ['local', 'global', 'both'],
      default: 'both'
    },
    maxDistance: {
      type: Number,
      default: 50 // Default to 50km
    },
    phone: { type: String },
    github: { type: String },
    linkedin: { type: String },
    role: {
      type: String,
      enum: ['teacher', 'learner', 'both'],
      default: 'learner',
    },
    availability: [{
      day: { 
        type: String, 
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] 
      },
      startTime: { type: String }, // Format: "HH:MM" in 24-hour format
      endTime: { type: String }    // Format: "HH:MM" in 24-hour format
    }],
    preferredMode: {
      type: String,
      enum: ['online', 'in-person', 'both'],
      default: 'both'
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    certificates: [{ type: String }], // Array to store certificate URLs from Cloudinary
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
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    successfulMatches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    verifiedSkills: [{
      skill: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Skill' 
      },
      verificationMethod: {
        type: String,
        enum: ['certificate', 'portfolio', 'experience', 'assessment'],
        default: 'experience'
      },
      verificationDate: {
        type: Date,
        default: Date.now
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      verificationProof: { type: String } // URL to proof in Cloudinary
    }],
    receiveMatchNotifications: {
      type: Boolean,
      default: true
    },
    scheduledSessions: [{
      matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
      },
      withUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
      },
      startTime: { type: Date },
      endTime: { type: Date },
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
      },
      notes: { type: String }
    }],
    learningPaths: [{
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      targetCompletionDate: { type: Date },
      milestones: [{
        title: { type: String },
        description: { type: String },
        completed: {
          type: Boolean,
          default: false
        },
        completionDate: { type: Date }
      }]
    }]
  },
  { timestamps: true }
);

profileSchema.index({ coordinates: '2dsphere' });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile; 