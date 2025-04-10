import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";
import { useAuthStore } from "../store/authStore";
import {
  format,
  parseISO,
  differenceInMinutes,
  isBefore,
  isAfter,
} from "date-fns";
import { toast } from "react-hot-toast";
import {
  DollarSign,
  CreditCard,
  ArrowLeft,
  Copy,
  Video,
  Clock3,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit,
  X,
  Check,
  BookOpen,
  Calendar,
  RotateCw,
  Laptop,
  Home,
  Repeat,
  Star,
  UserCheck,
} from "lucide-react";

const SessionDetailPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const {
    fetchSessionById,
    currentSession,
    isLoading,
    error,
    changeSessionStatus,
    regenerateZoomLink,
    zoomMeetingDetails,
    submitFeedback,
  } = useSessionStore();
  const { user } = useAuthStore();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRefreshingZoom, setIsRefreshingZoom] = useState(false);
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch session data on component mount
  useEffect(() => {
    if (sessionId) {
      fetchSessionById(sessionId).catch((err) => {
        console.error("Error fetching session details:", err);
        toast.error("Failed to load session details");
      });
    }
  }, [sessionId, fetchSessionById]);

  // Show feedback modal for completed sessions when the learner hasn't provided feedback yet
  useEffect(() => {
    if (
      currentSession && 
      currentSession.status === "completed" && 
      user && 
      currentSession.learner && 
      user._id === currentSession.learner._id &&
      (!currentSession.feedback || !currentSession.feedback.learnerRating)
    ) {
      setShowFeedbackModal(true);
    }
  }, [currentSession, user]);

  // Set initial rating and comment when the feedback modal is shown
  useEffect(() => {
    if (showFeedbackModal && currentSession?.feedback) {
      // Pre-populate with existing values if updating an existing rating
      if (currentSession.feedback.learnerRating) {
        setRating(currentSession.feedback.learnerRating);
      }
      if (currentSession.feedback.learnerComment) {
        setComment(currentSession.feedback.learnerComment);
      }
    }
  }, [showFeedbackModal, currentSession]);

  // Update time remaining for upcoming sessions
  useEffect(() => {
    if (!currentSession || currentSession.status !== "scheduled") return;

    const startTime = parseISO(currentSession.startTime);
    const now = new Date();

    // Only set timer for future sessions
    if (isBefore(now, startTime)) {
      const timer = setInterval(() => {
        const now = new Date();
        const mins = differenceInMinutes(startTime, now);

        if (mins <= 0) {
          clearInterval(timer);
          setTimeRemaining("Starting now");
        } else {
          const hours = Math.floor(mins / 60);
          const remainingMins = mins % 60;

          if (hours > 0) {
            setTimeRemaining(`Starts in ${hours}h ${remainingMins}m`);
          } else {
            setTimeRemaining(`Starts in ${remainingMins}m`);
          }
        }
      }, 60000); // Update every minute

      // Initial calculation
      const mins = differenceInMinutes(startTime, now);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;

      if (hours > 0) {
        setTimeRemaining(`Starts in ${hours}h ${remainingMins}m`);
      } else {
        setTimeRemaining(`Starts in ${remainingMins}m`);
      }

      return () => clearInterval(timer);
    } else if (
      isAfter(now, startTime) &&
      isBefore(now, parseISO(currentSession.endTime))
    ) {
      setTimeRemaining("In progress");
    } else {
      setTimeRemaining("Completed");
    }
  }, [currentSession]);

  // Handle cancel session
  const handleCancel = async () => {
    try {
      await changeSessionStatus(sessionId, "cancelled", "Cancelled by user");
      toast.success("Session cancelled successfully");
    } catch {
      toast.error("Failed to cancel session");
    }
  };

  // Handle mark as complete
  const handleComplete = async () => {
    try {
      await changeSessionStatus(
        sessionId,
        "completed",
        "Marked as completed by user"
      );
      toast.success("Session marked as completed");
    } catch {
      toast.error("Failed to mark session as completed");
    }
  };

  // Handle zoom meeting launch
  const handleJoinZoom = () => {
    const meetingLink =
      currentSession?.meetingLink || zoomMeetingDetails?.joinUrl;

    if (!meetingLink) {
      toast.error("No Zoom meeting link available");
      return;
    }

    window.open(meetingLink, "_blank");
  };

  // Handle zoom link regeneration
  const handleRegenerateZoom = async () => {
    try {
      setIsRefreshingZoom(true);

      // Call the regenerate function
      const response = await regenerateZoomLink(sessionId);

      // If we get here, it was successful
      toast.success(`Zoom meeting link generated successfully!`, {
        duration: 4000,
        icon: "🎯",
      });
    } catch (error) {
      console.error("Error regenerating Zoom link:", error);

      // Extract the error message
      let errorMessage = "Failed to generate Zoom meeting link";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 4000,
        icon: "❌",
      });
    } finally {
      setIsRefreshingZoom(false);
    }
  };

  // Handle payment
  const handlePayment = () => {
    // Store the sessionId in localStorage for the payment flow
    localStorage.setItem("current_payment_session", sessionId);

    try {
      // Create the payment URL and navigate using React Router
      const paymentUrl = `/payment/${sessionId}`;
      console.log("[SessionDetailPage] Redirecting to:", paymentUrl);

      // Use React Router's navigate function which preserves auth state
      navigate(paymentUrl);
    } catch (error) {
      console.error(
        "[SessionDetailPage] Error navigating to payment page:",
        error
      );
      toast.error("Error navigating to payment page. Please try again.");
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      
      await submitFeedback(sessionId, {
        rating,
        comment,
        userRole: "learner"
      });
      
      setShowFeedbackModal(false);
      toast.success("Thank you for your feedback!");
      
      // Refresh the session data to show updated feedback
      await fetchSessionById(sessionId);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Function to determine if the current user can rate this session
  const canProvideRating = () => {
    // Must be completed session
    if (currentSession.status !== "completed") return false;
    
    // Skip if already rated
    if (currentSession.feedback && currentSession.feedback.learnerRating) return false;
    
    // Check if IDs match
    const userID = user?._id?.toString();
    const learnerID = currentSession.learner?._id?.toString() || currentSession.learner?.toString();
    
    // Check for direct match
    if (userID === learnerID) return true;
    
    // Check for similar IDs (handles the ID mismatch issue between User and Profile models)
    if (userID && learnerID && 
        userID.length === learnerID.length && 
        userID.split('').filter((char, i) => char !== learnerID[i]).length <= 2) {
      console.log("DEBUG - IDs are similar, allowing rating");
      return true;
    }
    
    // Log the comparison for debugging
    console.log(`DEBUG - ID Comparison: ${userID} === ${learnerID} ? ${userID === learnerID}`);
    
    // Default case - IDs don't match
    return false;
  };

  // Determine if session is active (can join now)
  const isSessionActive = () => {
    if (!currentSession || currentSession.status !== "scheduled") return false;

    // Always allow joining scheduled meetings with valid links
    return true;

    /* Original time-restricted code:
    const now = new Date();
    const startTime = parseISO(currentSession.startTime);
    const endTime = parseISO(currentSession.endTime);
    
    // Check if it's within 15 minutes of start time or already started but not ended
    const diffInMinutes = differenceInMinutes(startTime, now);
    return (diffInMinutes <= 15 && diffInMinutes > -currentSession.duration) || 
           (isAfter(now, startTime) && isBefore(now, endTime));
    */
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={() => navigate("/sessions")}
            className="text-red-700 underline mt-2"
          >
            Back to sessions
          </button>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Session not found</p>
          <button
            onClick={() => navigate("/sessions")}
            className="text-yellow-700 underline mt-2"
          >
            Back to sessions
          </button>
        </div>
      </div>
    );
  }

  // Determine if current user is teacher or learner
  // Convert all IDs to strings to ensure reliable comparison
  const userIdStr = user?._id?.toString();
  const teacherIdStr = currentSession.teacher?._id?.toString() || currentSession.teacher?.toString();
  const learnerIdStr = currentSession.learner?._id?.toString() || currentSession.learner?.toString();
  
  // Check for special case where IDs differ but are actually referring to the same user
  
  const isSimilarToLearner = userIdStr && learnerIdStr && 
    (userIdStr === learnerIdStr || 
     (userIdStr.length === learnerIdStr.length && 
      userIdStr.split('').filter((char, i) => char !== learnerIdStr[i]).length <= 2));
      
  const isSimilarToTeacher = userIdStr && teacherIdStr && 
    (userIdStr === teacherIdStr || 
     (userIdStr.length === teacherIdStr.length && 
      userIdStr.split('').filter((char, i) => char !== teacherIdStr[i]).length <= 2));
  
  // Regular comparison with similarity detection
  let isTeacher = userIdStr === teacherIdStr || isSimilarToTeacher;
  let isLearner = userIdStr === learnerIdStr || isSimilarToLearner;
  

  // Format dates for display
  const formattedDate = format(
    parseISO(currentSession.startTime),
    "EEEE, MMMM d, yyyy"
  );
  const formattedStartTime = format(
    parseISO(currentSession.startTime),
    "h:mm a"
  );
  const formattedEndTime = format(parseISO(currentSession.endTime), "h:mm a");

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "completed":
        return "bg-green-50 text-green-600 border border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-600 border border-red-200";
      case "rescheduled":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 bg-gradient-to-b from-gray-50 to-white min-h-screen ">
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in-up">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Rate Your Experience</h2>
              <p className="text-gray-600 mb-6">
                How would you rate your session with {currentSession?.teacher?.name}?
              </p>
              
              {/* Star Rating */}
              <div className="flex items-center justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1.5 focus:outline-none transition-colors duration-200"
                  >
                    <Star
                      fill={(hoveredRating || rating) >= star ? "#FBBF24" : "none"}
                      className={`w-10 h-10 ${
                        (hoveredRating || rating) >= star 
                          ? "text-amber-400" 
                          : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Leave a comment (optional)
                </label>
                <textarea
                  id="feedback-comment"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow duration-200 bg-gray-50"
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              
              {/* Actions */}
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200 text-sm font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || rating === 0}
                  className={`px-5 py-2.5 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow text-sm ${
                    isSubmittingFeedback || rating === 0
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmittingFeedback ? (
                    <span className="flex items-center">
                      <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Rating"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => navigate("/sessions")}
        className="group flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-medium">Back to sessions</span>
      </button>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-fade-in-up">
        {/* Session Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {currentSession.title}
            </h1>
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                currentSession.status
              )}`}
            >
              {currentSession.status.charAt(0).toUpperCase() +
                currentSession.status.slice(1)}
              {timeRemaining && currentSession.status === "scheduled" && (
                <span className="ml-2 font-normal">• {timeRemaining}</span>
              )}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                Session Details
              </h2>
              <div className="space-y-5 bg-gray-50 p-5 rounded-xl">
                <div className="flex items-start">
                  <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Skill</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {currentSession.skill?.name || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="mt-1 font-medium text-gray-800">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {formattedStartTime} - {formattedEndTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock3 className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Duration
                    </p>
                    <p className="mt-1 font-medium text-gray-800">{currentSession.duration} minutes</p>
                  </div>
                </div>

                {/* Price Information */}
                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <div className="flex items-center mt-1">
                      <span className="font-medium text-gray-800">
                        {currentSession.price > 0
                          ? `${currentSession.price} PKR/hr`
                          : "Free Session"}
                      </span>
                      {currentSession.price > 0 && (
                        <span
                          className={`ml-2 px-2.5 py-0.5 text-xs rounded-full ${
                            currentSession.isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {currentSession.isPaid ? "Paid" : "Payment Required"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  {currentSession.mode === "online" ? (
                    <Laptop className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  ) : currentSession.mode === "in-person" ? (
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  ) : (
                    <Home className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500">Mode</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {currentSession.mode.charAt(0).toUpperCase() +
                        currentSession.mode.slice(1)}
                    </p>
                  </div>
                </div>

                {currentSession.mode === "in-person" &&
                  currentSession.location && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Location
                        </p>
                        <p className="mt-1 font-medium text-gray-800">{currentSession.location}</p>
                      </div>
                    </div>
                  )}

                {currentSession.isRecurring && (
                  <div className="flex items-start">
                    <Repeat className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Recurrence
                      </p>
                      <p className="mt-1 font-medium text-gray-800">
                        {currentSession.recurrencePattern?.frequency
                          .charAt(0)
                          .toUpperCase() +
                          currentSession.recurrencePattern?.frequency.slice(1)}
                        {currentSession.recurrencePattern?.interval > 1 &&
                          `, every ${currentSession.recurrencePattern.interval} times`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Zoom Meeting Section (Only if relevant and session is not completed) */}
                {(currentSession.mode === "online" ||
                  currentSession.mode === "hybrid") && 
                  currentSession.status !== "completed" && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Video className="w-5 h-5 text-blue-500 mr-2" />
                      Zoom Meeting
                    </h3>
                    
                    <div className="mt-2">
                      {currentSession.meetingLink ||
                      zoomMeetingDetails?.joinUrl ? (
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                            <a
                              href={
                                currentSession.meetingLink ||
                                zoomMeetingDetails?.joinUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                            >
                              View Zoom Meeting Link
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  currentSession.meetingLink ||
                                    zoomMeetingDetails?.joinUrl
                                );
                                toast.success("Zoom link copied to clipboard!");
                              }}
                              className="flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors duration-200 shadow-sm"
                            >
                              <Copy className="h-4 w-4 mr-1.5" />
                              Copy Link
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={handleJoinZoom}
                              className="flex items-center text-sm px-4 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Zoom Meeting
                            </button>

                            <button
                              onClick={handleRegenerateZoom}
                              disabled={
                                isRefreshingZoom ||
                                currentSession.status !== "scheduled"
                              }
                              className={`
                                flex items-center text-sm px-4 py-2.5 rounded-xl font-medium transition-colors duration-200 shadow-sm
                                ${
                                  currentSession.status === "scheduled" &&
                                  !isRefreshingZoom
                                    ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                    : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100"
                                }
                              `}
                            >
                              {isRefreshingZoom ? (
                                <span className="flex items-center">
                                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                  Regenerating...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <RotateCw className="h-4 w-4 mr-2" />
                                  Regenerate Link
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center text-amber-600 bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
                            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 text-amber-500" />
                            <p className="text-sm">
                              {currentSession.price > 0 && !currentSession.isPaid
                                ? "Zoom meeting link will be generated after payment is completed"
                                : "No Zoom link available"}
                            </p>
                          </div>

                          {/* Buttons for generating or paying - Only show if not completed */}
                          {currentSession.status !== "completed" && (
                            <div className="flex flex-wrap gap-3">
                              {/* Show payment button for paid unpaid sessions */}
                              {currentSession.price > 0 &&
                                !currentSession.isPaid &&
                                isLearner && (
                                  <button
                                    onClick={handlePayment}
                                    className="bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm flex items-center hover:bg-amber-700 transition-colors duration-200 font-medium shadow-sm"
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Make Payment
                                  </button>
                                )}

                              {/* Only show regenerate button for free sessions or paid sessions */}
                              {(currentSession.price === 0 ||
                                currentSession.isPaid) && (
                                <button
                                  onClick={handleRegenerateZoom}
                                  disabled={
                                    isRefreshingZoom ||
                                    currentSession.status !== "scheduled"
                                  }
                                  className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm flex items-center hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
                                >
                                  {isRefreshingZoom ? (
                                    <>
                                      <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Generate Zoom Link
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <UserCheck className="w-5 h-5 text-blue-500 mr-2" />
                Participants
              </h2>
              <div className="space-y-4">
                {/* Teacher Card */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    Teacher
                  </p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-gray-600 overflow-hidden border border-blue-100 shadow-sm">
                      {currentSession.teacher?.profilePic ? (
                        <img
                          src={currentSession.teacher.profilePic}
                          alt={currentSession.teacher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium">
                          {currentSession.teacher?.name?.charAt(0) || "T"}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-800">
                        {currentSession.teacher?.name || "Unknown"}
                      </p>
                      {isTeacher && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Learner Card */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    Learner
                  </p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-gray-600 overflow-hidden border border-green-100 shadow-sm">
                      {currentSession.learner?.profilePic ? (
                        <img
                          src={currentSession.learner.profilePic}
                          alt={currentSession.learner.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium">
                          {currentSession.learner?.name?.charAt(0) || "L"}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-800">
                        {currentSession.learner?.name || "Unknown"}
                      </p>
                      {isLearner && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {currentSession.description && (
            <div className="mt-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 text-blue-500 mr-2" />
                Description
              </h3>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {currentSession.description}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {currentSession.status === "scheduled" && (
            <div className="mt-8 flex flex-wrap gap-3">
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="inline-flex items-center px-5 py-2.5 border border-red-200 text-sm font-medium rounded-xl shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Session
              </button>

              {/* Payment button - Only for learners with unpaid sessions */}
              {isLearner &&
                currentSession.price > 0 &&
                !currentSession.isPaid && (
                  <button
                    onClick={handlePayment}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </button>
                )}

              {/* Join Zoom Button - Only for paid or free sessions */}
              {currentSession.status === "scheduled" &&
                (currentSession.mode === "online" ||
                  currentSession.mode === "hybrid") &&
                (currentSession.meetingLink ||
                  zoomMeetingDetails?.joinUrl) &&
                // Only show Join button if the session is free or paid
                (currentSession.price === 0 || currentSession.isPaid) && (
                  <button
                    onClick={handleJoinZoom}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Zoom Meeting
                  </button>
                )}
                
              {/* Show Complete button for teachers if the session is scheduled */}
              {currentSession.status === "scheduled" && isTeacher && (
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Completed
                </button>
              )}
            </div>
          )}

          {/* Feedback Section - Show if session is completed */}
          {currentSession.status === "completed" && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Feedback
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Learner Feedback (visible to everyone) */}
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <p className="text-sm font-medium text-amber-800 mb-3">Learner Feedback</p>
                  
                  {currentSession.feedback && currentSession.feedback.learnerRating ? (
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              fill={currentSession.feedback.learnerRating >= star ? "#FBBF24" : "none"}
                              className={`w-5 h-5 ${
                                currentSession.feedback.learnerRating >= star 
                                  ? "text-amber-400" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {currentSession.feedback.learnerRating}/5
                        </span>
                      </div>
                      
                      {currentSession.feedback.learnerComment && (
                        <div className="mt-3 bg-white p-3 rounded-lg border border-amber-200">
                          <p className="text-sm text-gray-700 italic">
                            &quot;{currentSession.feedback.learnerComment}&ldquo;
                          </p>
                        </div>
                      )}
                    </div>
                  ) : isLearner ? (
                    <div>
                      <p className="text-sm text-amber-700 mb-3">You haven&apos;t provided feedback yet.</p>
                      <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 shadow-sm"
                      >
                        <Star className="w-4 h-4 mr-1.5" />
                        Rate this session
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-700">No feedback has been provided yet.</p>
                  )}
                </div>
                
                {/* Teacher Feedback (only visible to participants) */}
                {currentSession.feedback && currentSession.feedback.teacherRating && (isTeacher || isLearner) && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-3">Teacher Feedback</p>
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            fill={currentSession.feedback.teacherRating >= star ? "#3B82F6" : "none"}
                            className={`w-5 h-5 ${
                              currentSession.feedback.teacherRating >= star 
                                ? "text-blue-500" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {currentSession.feedback.teacherRating}/5
                      </span>
                    </div>
                    
                    {currentSession.feedback.teacherComment && (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 italic">
                          &quot;{currentSession.feedback.teacherComment}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Rate Session button for completed sessions - For learners only */}
              {currentSession.status === "completed" && 
                isLearner && 
                (!currentSession.feedback || !currentSession.feedback.learnerRating) && (
                <div className="mt-6">
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h3 className="text-sm font-medium text-amber-800 mb-3">Session Feedback</h3>
                    <p className="text-sm text-amber-700 mb-4">
                      {currentSession.feedback?.learnerRating 
                        ? "You've already rated this session. Want to update your rating?" 
                        : "Please rate your experience with this teacher. Your feedback helps others!"}
                    </p>
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 shadow-sm"
                    >
                      <Star className="w-4 h-4 mr-1.5" />
                      {currentSession.feedback?.learnerRating ? "Update Rating" : "Rate Teacher"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Session History/Activity Log */}
          {currentSession.history && currentSession.history.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                Session History
              </h3>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="relative">
                  <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200 h-full"></div>
                  <ul className="space-y-4 relative">
                    {currentSession.history
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <li key={index} className="ml-6">
                          <div className="absolute -left-3 p-1 rounded-full bg-white border border-gray-300">
                            {entry.action === "created" ? (
                              <Plus className="w-3 h-3 text-green-500" />
                            ) : entry.action === "updated" ? (
                              <Edit className="w-3 h-3 text-blue-500" />
                            ) : entry.action === "cancelled" ? (
                              <X className="w-3 h-3 text-red-500" />
                            ) : entry.action === "completed" ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Repeat className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-800">
                              {entry.details}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {entry.timestamp
                                ? new Date(entry.timestamp).toLocaleString()
                                : ""}
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;
