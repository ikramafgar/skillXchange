import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    // For group conversations (future feature)
    isGroup: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      trim: true
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // For tracking conversation activity
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastMessageText: {
      type: String
    },
    lastMessageTime: {
      type: Date
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // For tracking unread messages
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },
    // For related match/skill context
    relatedMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    relatedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    // For AI conversation starters
    conversationStarters: [{
      text: {
        type: String,
        required: true
      },
      used: {
        type: Boolean,
        default: false
      },
      usedAt: {
        type: Date
      }
    }],
    // For conversation status
    isActive: {
      type: Boolean,
      default: true
    },
    // For pinned conversations
    pinnedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

// Create indexes for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 }); // For sorting by most recent
conversationSchema.index({ isActive: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation; 