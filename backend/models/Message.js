import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      enum: ['text', 'image', 'file', 'session-invite', 'system'],
      default: 'text'
    },
    // For file/image messages
    fileUrl: {
      type: String
    },
    fileName: {
      type: String
    },
    fileSize: {
      type: Number
    },
    // For session invites
    sessionInvite: {
      sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
      }
    },
    // For AI-suggested messages
    isAiSuggested: {
      type: Boolean,
      default: false
    },
    // Message status
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Create indexes for efficient querying
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 }); // For unread messages

const Message = mongoose.model("Message", messageSchema);
export default Message; 