import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    matchedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    matchType: {
      type: String,
      enum: ['direct', 'alternative', 'group', 'similar'],
      default: 'direct'
    },
    // For group matches, store the chain of users
    groupChain: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Match details
    skillToLearn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    skillToTeach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    // Scoring components
    score: {
      type: Number,
      required: true,
      default: 0
    },
    scoreComponents: {
      exactSkillMatch: { type: Number, default: 0 },
      availabilityOverlap: { type: Number, default: 0 },
      locationProximity: { type: Number, default: 0 },
      preferredModeMatch: { type: Number, default: 0 },
      userRating: { type: Number, default: 0 }
    },
    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'connected', 'completed', 'rejected'],
      default: 'pending'
    },
    // Feedback after match completion
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      submittedAt: { type: Date }
    },
    // For algorithm improvement
    isSuccessful: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create compound index for user and matchedUser
matchSchema.index({ user: 1, matchedUser: 1 }, { unique: true });
// Create index for score to quickly retrieve top matches
matchSchema.index({ user: 1, score: -1 });

const Match = mongoose.model("Match", matchSchema);
export default Match; 