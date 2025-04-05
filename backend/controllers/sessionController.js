import Session from "../models/Session.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";
import { createZoomMeeting } from "../utils/zoomUtils.js";

// Create a new session
export const createSession = async (req, res) => {
  try {
    const {
      otherUserId, // ID of the other participant
      userRole, // 'teacher' or 'learner' - the role of the authenticated user
      skillId,
      matchId,
      title,
      description,
      startTime,
      endTime,
      duration,
      mode,
      location,
      price, // New price field
      isRecurring,
      recurrencePattern,
    } = req.body;

    const userId = req.userId;

    // Ensure that only teachers can create sessions
    if (userRole !== "teacher") {
      console.log("DEBUG - INVALID ROLE: Only teachers can create sessions, received:", userRole);
      return res
        .status(403)
        .json({ message: 'Only teachers can create sessions' });
    }

    // Determine teacher and learner IDs based on the user's role
    const teacherId = userId;
    const learnerId = otherUserId;

    // Validate price field
    let sessionPrice = 0;
    if (price !== undefined) {
      sessionPrice = Number(price);
      if (isNaN(sessionPrice) || sessionPrice < 0) {
        return res.status(400).json({ message: "Invalid price. Price must be a non-negative number." });
      }
    }

    // Convert startTime and endTime strings to Date objects
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    // Validate dates
    if (isNaN(startTimeDate) || isNaN(endTimeDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (startTimeDate >= endTimeDate) {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    }

    // Get teacher and learner details
    const [teacher, learner, skill] = await Promise.all([
      User.findById(teacherId),
      User.findById(learnerId),
      Skill.findById(skillId),
    ]);

    if (!teacher || !learner || !skill) {
      return res
        .status(404)
        .json({ message: "Teacher, learner, or skill not found" });
    }

    let meetingLink = null;
    let zoomMeetingDetails = null;

    // Create Zoom meeting link if mode is 'online' or 'hybrid'
    if (mode === "online" || mode === "hybrid") {
      try {
        console.log("DEBUG - Creating Zoom meeting for new session");
        zoomMeetingDetails = await createZoomMeeting(
          title,
          startTimeDate.toISOString(),
          duration,
          teacher.name,
          learner.name
        );
        meetingLink = zoomMeetingDetails.joinUrl;
        console.log("DEBUG - Zoom meeting created successfully:", meetingLink);
      } catch (error) {
        console.error("Error creating Zoom meeting:", error.message);
        // Continue without Zoom link if there's an error, but log the issue
        console.log(
          "DEBUG - Will create session without Zoom link due to error"
        );
      }
    }

    // Create session
    const session = new Session({
      teacher: teacherId,
      learner: learnerId,
      skill: skillId,
      match: matchId,
      title,
      description,
      startTime: startTimeDate,
      endTime: endTimeDate,
      duration,
      mode,
      location,
      price: sessionPrice,
      isPaid: sessionPrice === 0, // Mark as paid if it's free
      meetingLink: zoomMeetingDetails?.joinUrl || null,
      isRecurring,
      recurrencePattern,
      // Add initial history entry
      history: [
        {
          action: "created",
          userId,
          details: `Session created by ${userRole}`,
        },
      ],
      // Add automatic reminder for 30 minutes before session
      reminders: [
        {
          time: new Date(startTimeDate.getTime() - 30 * 60 * 1000),
        },
      ],
    });

    await session.save();

    // Add zoom meeting details to the response if available
    const responseData = {
      session,
      zoomMeeting: zoomMeetingDetails,
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all sessions for a user
export const getSessions = async (req, res) => {
  try {
    const userId = req.userId;

    // Find sessions where the user is either teacher or learner
    const sessions = await Session.find({
      $or: [{ teacher: userId }, { learner: userId }],
    })
      .populate("teacher", "name")
      .populate("learner", "name")
      .populate("skill", "name")
      .sort({ startTime: 1 }); // Sort by start time ascending

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error getting sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single session by ID
export const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const session = await Session.findById(sessionId)
      .populate("teacher", "name")
      .populate("learner", "name")
      .populate("skill", "name category")
      .populate("match");

    if (!session) {
      console.log("DEBUG - getSessionById: Session not found");
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the user is authorized to view this session
    if (
      session.teacher._id.toString() !== userId &&
      session.learner._id.toString() !== userId
    ) {
      console.log("DEBUG - getSessionById: Authorization failed");
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update session
export const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    // Fetch the existing session
    const session = await Session.findById(sessionId);

    if (!session) {
      console.log("DEBUG - updateSession: Session not found");
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the user is authorized to update this session
    if (
      session.teacher.toString() !== userId &&
      session.learner.toString() !== userId
    ) {
      console.log("DEBUG - updateSession: Authorization failed");
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Handle Zoom meeting update if needed
    if (
      (updateData.startTime || updateData.duration || updateData.title) &&
      (session.mode === "online" || session.mode === "hybrid")
    ) {
      try {
        // Get user details
        const [teacher, learner] = await Promise.all([
          User.findById(session.teacher),
          User.findById(session.learner),
        ]);

        // Create a new Zoom meeting
        const zoomMeetingDetails = await createZoomMeeting(
          updateData.title || session.title,
          new Date(updateData.startTime || session.startTime).toISOString(),
          updateData.duration || session.duration,
          teacher.name,
          learner.name
        );

        // Update the meeting link
        updateData.meetingLink = zoomMeetingDetails.joinUrl;
      } catch (error) {
        console.error("Error updating Zoom meeting:", error);
        // Continue without updating Zoom link if there's an error
      }
    }

    // Add history entry for the update
    if (!updateData.history) {
      updateData.history = session.history || [];
    }

    updateData.history.push({
      action: "updated",
      userId,
      timestamp: new Date(),
      details: `Session updated by ${
        userId === session.teacher.toString() ? "teacher" : "learner"
      }`,
    });

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("teacher", "name")
      .populate("learner", "name")
      .populate("skill", "name");

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cancel or reschedule session
export const changeSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, reason } = req.body;
    const userId = req.userId;

    if (
      !["scheduled", "completed", "cancelled", "rescheduled"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      console.log("DEBUG - changeSessionStatus: Session not found");
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the user is authorized to change this session
    if (
      session.teacher.toString() !== userId &&
      session.learner.toString() !== userId
    ) {
      console.log("DEBUG - changeSessionStatus: Authorization failed");
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Add history entry for the status change
    const historyEntry = {
      action: status,
      userId,
      timestamp: new Date(),
      details:
        reason ||
        `Session ${status} by ${
          userId === session.teacher.toString() ? "teacher" : "learner"
        }`,
    };

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      {
        $set: { status },
        $push: { history: historyEntry },
      },
      { new: true, runValidators: true }
    )
      .populate("teacher", "name")
      .populate("learner", "name")
      .populate("skill", "name");

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error changing session status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Submit session feedback
export const submitFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, comment, userRole } = req.body;
    const userId = req.userId;

    if (!["teacher", "learner"].includes(userRole)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      console.log("DEBUG - submitFeedback: Session not found");
      return res.status(404).json({ message: "Session not found" });
    }

    console.log("DEBUG - submitFeedback: Session found", session._id);

    // Check if the user is authorized to submit feedback
    const isTeacher = session.teacher.toString() === userId;
    const isLearner = session.learner.toString() === userId;

    if (!isTeacher && !isLearner) {
      console.log("DEBUG - submitFeedback: Authorization failed");
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Ensure the user role matches their actual role in the session
    if (
      (userRole === "teacher" && !isTeacher) ||
      (userRole === "learner" && !isLearner)
    ) {
      return res
        .status(400)
        .json({ message: "User role does not match session participation" });
    }

    // Update feedback based on the user's role
    const feedbackUpdate = {};
    if (userRole === "teacher") {
      feedbackUpdate["feedback.teacherRating"] = rating;
      feedbackUpdate["feedback.teacherComment"] = comment;
    } else {
      feedbackUpdate["feedback.learnerRating"] = rating;
      feedbackUpdate["feedback.learnerComment"] = comment;
    }

    // Set submission time if this is the first feedback
    if (!session.feedback || !session.feedback.submittedAt) {
      feedbackUpdate["feedback.submittedAt"] = new Date();
    }

    // Update the session
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { $set: feedbackUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate a new Zoom meeting link for a session
export const regenerateZoomLink = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const session = await Session.findById(sessionId)
      .populate("teacher", "name")
      .populate("learner", "name");

    if (!session) {
      console.log("DEBUG - regenerateZoomLink: Session not found");
      return res.status(404).json({
        message: "Session not found",
        success: false,
      });
    }

    // Check if the user is authorized to regenerate the Zoom link
    if (
      session.teacher._id.toString() !== userId &&
      session.learner._id.toString() !== userId
    ) {
      console.log("DEBUG - regenerateZoomLink: Authorization failed");
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }

    // Check if the session is online or hybrid
    if (session.mode !== "online" && session.mode !== "hybrid") {
      return res.status(400).json({
        message: "Cannot create Zoom link for in-person sessions",
        success: false,
      });
    }

    // Generate the Zoom meeting link - our createZoomMeeting function now handles errors internally
    const zoomMeetingDetails = await createZoomMeeting(
      session.title,
      new Date(session.startTime).toISOString(),
      session.duration,
      session.teacher.name,
      session.learner.name
    );

    // Update the session with the new meeting link
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          meetingLink: zoomMeetingDetails.joinUrl,
        },
        $push: {
          history: {
            action: "updated",
            userId,
            timestamp: new Date(),
            details: `Zoom meeting link regenerated`,
          },
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      session: updatedSession,
      zoomMeeting: zoomMeetingDetails,
      success: true,
    });
  } catch (error) {
    console.error("Error regenerating Zoom link:", error);
    res.status(500).json({
      message: "Server error: " + error.message,
      error: error.message,
      success: false,
    });
  }
};
