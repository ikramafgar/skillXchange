import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true
    },
    sessions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true
    }],
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedAt: {
      type: Date
    },
    certificateUrl: {
      type: String
    },
    rejectionReason: {
      type: String
    },
    certificateId: {
      type: String,
      unique: true
    },
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for faster lookups
certificateSchema.index({ user: 1, status: 1 });
certificateSchema.index({ status: 1 });

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate; 