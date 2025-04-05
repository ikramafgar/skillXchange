import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // Duration in minutes
      required: true
    },
    price: {
      type: Number,
      min: 0,
      default: 0 // Default to free
    },
    isPaid: {
      type: Boolean,
      default: false // Default to unpaid
    },
    mode: {
      type: String,
      enum: ['online', 'in-person', 'hybrid'],
      default: 'online'
    },
    location: {
      type: String,
      trim: true
    },
    meetingLink: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    // For recurring sessions
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrencePattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      },
      interval: {
        type: Number,
        default: 1
      },
      endDate: {
        type: Date
      }
    },
    // For session feedback
    feedback: {
      learnerRating: {
        type: Number,
        min: 1,
        max: 5
      },
      learnerComment: {
        type: String
      },
      teacherRating: {
        type: Number,
        min: 1,
        max: 5
      },
      teacherComment: {
        type: String
      },
      submittedAt: {
        type: Date
      }
    },
    // For session materials
    materials: [{
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['document', 'video', 'link', 'other'],
        default: 'document'
      },
      url: {
        type: String
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // For session reminders
    reminders: [{
      time: {
        type: Date,
        required: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    }],
    // For session notes
    notes: {
      type: String
    },
    // For tracking session changes
    history: [{
      action: {
        type: String,
        enum: ['created', 'updated', 'cancelled', 'rescheduled', 'completed'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      details: {
        type: String
      }
    }]
  },
  { timestamps: true }
);

// Create indexes for efficient querying
sessionSchema.index({ teacher: 1, startTime: 1 });
sessionSchema.index({ learner: 1, startTime: 1 });
sessionSchema.index({ skill: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ startTime: 1 }); // For finding upcoming sessions

const Session = mongoose.model("Session", sessionSchema);
export default Session; 