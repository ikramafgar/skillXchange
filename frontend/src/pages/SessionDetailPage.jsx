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
  } = useSessionStore();
  const { user } = useAuthStore();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRefreshingZoom, setIsRefreshingZoom] = useState(false);

  // Fetch session data on component mount
  useEffect(() => {
    if (sessionId) {
      fetchSessionById(sessionId).catch((err) => {
        console.error("Error fetching session details:", err);
        toast.error("Failed to load session details");
      });
    }
  }, [sessionId, fetchSessionById]);

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
  const isTeacher = user?._id === currentSession.teacher._id;
  const isLearner = user?._id === currentSession.learner._id;

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
    <div className="max-w-full mx-auto px-4 py-8 bg-gray-50 pt-16">
      <button
        onClick={() => navigate("/sessions")}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to sessions
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in-up">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-gray-800 mb-2 md:mb-0">
              {currentSession.title}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                currentSession.status
              )}`}
            >
              {currentSession.status.charAt(0).toUpperCase() +
                currentSession.status.slice(1)}
              {timeRemaining && currentSession.status === "scheduled" && (
                <span className="ml-2">• {timeRemaining}</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Session Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Skill</p>
                    <p className="mt-1">
                      {currentSession.skill?.name || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="mt-1">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="mt-1">
                      {formattedStartTime} - {formattedEndTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock3 className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Duration
                    </p>
                    <p className="mt-1">{currentSession.duration} minutes</p>
                  </div>
                </div>

                {/* Price Information */}
                <div className="flex items-start">
                  <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <div className="flex items-center mt-1">
                      <span className="font-medium">
                        {currentSession.price > 0
                          ? `${currentSession.price} PKR/hr`
                          : "Free Session"}
                      </span>
                      {currentSession.price > 0 && (
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
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
                    <Laptop className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  ) : currentSession.mode === "in-person" ? (
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <Home className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500">Mode</p>
                    <p className="mt-1">
                      {currentSession.mode.charAt(0).toUpperCase() +
                        currentSession.mode.slice(1)}
                    </p>
                  </div>
                </div>

                {currentSession.mode === "in-person" &&
                  currentSession.location && (
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Location
                        </p>
                        <p className="mt-1">{currentSession.location}</p>
                      </div>
                    </div>
                  )}

                {currentSession.isRecurring && (
                  <div className="flex items-start">
                    <Repeat className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Recurrence
                      </p>
                      <p className="mt-1">
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

                {(currentSession.mode === "online" ||
                  currentSession.mode === "hybrid") && (
                  <div className="mt-2 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Zoom Meeting
                    </p>
                    <div className="mt-1">
                      {currentSession.meetingLink ||
                      zoomMeetingDetails?.joinUrl ? (
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
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
                              className=" flex items-center text-xs bg-white hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200 transition-colors duration-200"
                            >
                              <Copy className="h-4 w-4 mr-1.5" />
                              Copy Link
                            </button>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={handleJoinZoom}
                              className="flex items-center text-sm px-3 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                            >
                              <Video className="h-4 w-4 mr-1.5" />
                              Join Zoom Meeting
                            </button>

                            <button
                              onClick={handleRegenerateZoom}
                              disabled={
                                isRefreshingZoom ||
                                currentSession.status !== "scheduled"
                              }
                              className={`
                                flex items-center text-sm px-3 py-2 rounded-lg font-medium transition-colors duration-200
                                ${
                                  currentSession.status === "scheduled" &&
                                  !isRefreshingZoom
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
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
                                  <RotateCw className="h-4 w-4 mr-1.5" />
                                  Regenerate Link
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <AlertCircle className="h-5 w-5 mr-2" />

                            {currentSession.price > 0 && !currentSession.isPaid
                              ? "Zoom meeting link will be generated after payment is completed"
                              : "No Zoom link available"}
                          </div>

                          {/* Show payment button for paid unpaid sessions */}
                          {currentSession.price > 0 &&
                            !currentSession.isPaid && (
                              <button
                                onClick={handlePayment}
                                className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm self-start flex items-center hover:bg-amber-700 transition-colors duration-200"
                              >
                                <CreditCard className="h-4 w-4 mr-1.5" />
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
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm self-start flex items-center hover:bg-blue-700 transition-colors duration-200"
                            >
                              {isRefreshingZoom ? (
                                <>
                                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1.5" />
                                  Generate Zoom Link
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Participants
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Teacher
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 overflow-hidden border border-gray-200">
                      {currentSession.teacher?.profilePic ? (
                        <img
                          src={currentSession.teacher.profilePic}
                          alt={currentSession.teacher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {currentSession.teacher?.name?.charAt(0) || "T"}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">
                        {currentSession.teacher?.name || "Unknown"}
                      </p>
                      {isTeacher && (
                        <span className="text-xs text-blue-600">(You)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Learner
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 overflow-hidden border border-gray-200">
                      {currentSession.learner?.profilePic ? (
                        <img
                          src={currentSession.learner.profilePic}
                          alt={currentSession.learner.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {currentSession.learner?.name?.charAt(0) || "L"}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">
                        {currentSession.learner?.name || "Unknown"}
                      </p>
                      {isLearner && (
                        <span className="text-xs text-blue-600">(You)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {currentSession.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {currentSession.description}
                  </p>
                </div>
              )}

              {currentSession.status === "scheduled" && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel Session
                  </button>

                  {/* Payment button - Only for learners with unpaid sessions */}
                  {isLearner &&
                    currentSession.price > 0 &&
                    !currentSession.isPaid && (
                      <button
                        onClick={handlePayment}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                      >
                        <CreditCard className="w-4 h-4 mr-1.5" />
                        Pay Now
                      </button>
                    )}

                  {currentSession.status === "scheduled" &&
                    (currentSession.mode === "online" ||
                      currentSession.mode === "hybrid") &&
                    (currentSession.meetingLink ||
                      zoomMeetingDetails?.joinUrl) &&
                    // Only show Join button if the session is free or paid
                    (currentSession.price === 0 || currentSession.isPaid) && (
                      <button
                        onClick={handleJoinZoom}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <Video className="h-4 w-4 mr-1.5" />
                        Join Zoom Meeting
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Session History/Activity Log */}
          {currentSession.history && currentSession.history.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Session History
              </h2>
              <div className="space-y-4">
                {currentSession.history.map((entry, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                        {entry.action === "created" && (
                          <Plus className="h-4 w-4" />
                        )}
                        {entry.action === "updated" && (
                          <Edit className="h-4 w-4" />
                        )}
                        {entry.action === "cancelled" && (
                          <X className="h-4 w-4" />
                        )}
                        {entry.action === "completed" && (
                          <Check className="h-4 w-4" />
                        )}
                        {entry.action === "rescheduled" && (
                          <Clock3 className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">
                          {entry.action.charAt(0).toUpperCase() +
                            entry.action.slice(1)}
                        </span>
                      </p>
                      {entry.details && (
                        <p className="text-sm text-gray-600">{entry.details}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {entry.timestamp
                          ? format(
                              parseISO(entry.timestamp),
                              "MMM d, yyyy h:mm a"
                            )
                          : "Unknown time"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;
