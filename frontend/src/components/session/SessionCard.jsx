import { format, isPast } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSessionStore } from "../../store/sessionStore";
import { useProfileStore } from "../../store/ProfileStore";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import { useEffect } from "react";
import {
  Eye,
  Layers,
  Calendar,
  Clock,
  Monitor,
  MapPin,
  Users,
  Video,
  XCircle,
  CheckCircle,
  DollarSign,
  CreditCard,
} from "lucide-react";

const SessionCard = ({ session }) => {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { changeSessionStatus, isLoading } = useSessionStore();
  const navigate = useNavigate();

  // Fetch profile data if needed
  useEffect(() => {
    if (!profile) {
      fetchProfile().catch((err) => {
        console.error("Error fetching profile:", err);
      });
    }
  }, [profile, fetchProfile]);

  // Check if the session is in the past
  const isSessionPast = isPast(new Date(session.endTime));

  // Check if the current user is the teacher or learner
  const isTeacher = user?._id === session?.teacher?._id;
  const isLearner = user?._id === session?.learner?._id;

  // Get the user's role from profile and session context
  const getUserRole = () => {
    // First check if the user's role in this session is a teacher or learner
    if (isTeacher) return "Teacher";
    if (isLearner) return "Learner";

    // If we can't determine from the session, use the profile role
    if (profile?.role) {
      if (profile.role === "teacher") return "Teacher";
      if (profile.role === "learner") return "Learner";
      if (profile.role === "both") return "Teacher/Learner";
    }

    // Default fallback
    return "Unknown";
  };

  const userRole = getUserRole();

  // Format time display
  const formatSessionTime = (startTime, endTime) => {
    if (!startTime || !endTime) return "Time not specified";

    try {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      const formattedStart = format(startDate, "MMM d, yyyy h:mm a");
      const formattedEnd = format(endDate, "h:mm a");

      return `${formattedStart} - ${formattedEnd}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time format";
    }
  };

  // Handle opening Zoom meeting
  const handleOpenZoom = (meetingLink) => {
    if (!meetingLink) {
      toast.error("No Zoom meeting link available");
      return;
    }

    // Open in new tab
    window.open(meetingLink, "_blank");
  };

  // Handle cancellation
  const handleCancel = async () => {
    if (!session?._id) {
      toast.error("Invalid session data");
      return;
    }

    try {
      await changeSessionStatus(session._id, "cancelled", "Cancelled by user");
      toast.success("Session cancelled successfully");
    } catch {
      toast.error("Failed to cancel session");
    }
  };

  // Handle marking as completed
  const handleComplete = async () => {
    if (!session?._id) {
      toast.error("Invalid session data");
      return;
    }

    try {
      await changeSessionStatus(
        session._id,
        "completed",
        "Marked as completed by user"
      );
      toast.success("Session marked as completed");
    } catch {
      toast.error("Failed to mark session as completed");
    }
  };

  // Handle payment
  const handlePayment = (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Store the sessionId in localStorage for the payment flow
    localStorage.setItem('current_payment_session', session._id);
    
    try {
      // Create the payment URL and navigate using React Router
      const paymentUrl = `/payment/${session._id}`;
      console.log("[SessionCard] Redirecting to:", paymentUrl);
      
      // Use React Router's navigate function which preserves auth state
      navigate(paymentUrl);
    } catch (error) {
      console.error("[SessionCard] Error navigating to payment page:", error);
      toast.error("Error navigating to payment page. Please try again.");
    }
  };

  // Determine status color
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

  // Determine if Join Zoom button should be enabled
  const isJoinZoomEnabled = () => {
    if (!session) return false;
    if (session.status !== "scheduled") return false;
    if (!session.meetingLink) return false;

    // Check if it's within 15 minutes of the start time
    const now = new Date();
    const startTime = new Date(session.startTime);
    const diffInMinutes = (startTime - now) / (1000 * 60);

    return (
      diffInMinutes <= 15 ||
      (now >= startTime && now <= new Date(session.endTime))
    );
  };

  // Ensure session data is valid
  if (!session || !session._id) {
    console.error("[SessionCard] Invalid session data:", session);
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <p className="text-red-500">Invalid session data</p>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-800 truncate">
            {session.title || "Untitled Session"}
          </h3>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(
              session.status
            )}`}
          >
            {session.status?.charAt(0).toUpperCase() +
              session.status?.slice(1) || "Unknown"}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-start">
            <Layers className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>{session.skill?.name || "Not specified"}</span>
          </div>

          <div className="flex items-start">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>{formatSessionTime(session.startTime, session.endTime)}</span>
          </div>

          <div className="flex items-start">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>{session.duration || 0} minutes</span>
          </div>

          <div className="flex items-start">
          
              {session.mode === "online" ? (
                <Monitor className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              ) : session.mode === "in-person" ? (
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              ) : (
                <Monitor className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
              )}
      
            <span>
              {session.mode
                ? session.mode.charAt(0).toUpperCase() + session.mode.slice(1)
                : "Not specified"}
              {session.mode === "in-person" &&
                session.location &&
                ` (${session.location})`}
            </span>
          </div>

          <div className="flex items-start">
            <Users className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <span className="font-medium">{userRole}</span> with{" "}
              {isTeacher ? session.learner?.name : session.teacher?.name}
            </div>
          </div>

          {/* Session Price */}
          <div className="flex items-start">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <span className="font-medium">
                {session.price > 0 
                  ? `${session.price} PKR/hr` 
                  : "Free Session"}
              </span>
              {session.price > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  session.isPaid 
                    ? "bg-green-100 text-green-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {session.isPaid ? "Paid" : "Payment Required"}
                </span>
              )}
            </div>
          </div>
        </div>

        {session.description && (
          <div className="mt-3 mb-4">
            <h4 className="text-xs font-medium uppercase text-gray-500 mb-1">
              Description
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {session.description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {/* View Details Button */}
          <Link
            to={`/sessions/${session._id}`}
            className="text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center border border-gray-100"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Details
          </Link>

          {/* Payment Button - For learners only */}
          {profile?.role && (profile.role === 'learner' || profile.role === 'both') && 
            session.price > 0 && !session.isPaid && session.status === "scheduled" && (
            <Link
              to={`/payment/${session._id}`}
              onClick={handlePayment}
              className="text-sm bg-amber-600 text-white hover:bg-amber-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              Pay Now
            </Link>
          )}

          {/* Join Zoom Button - Only show for online/hybrid sessions that are scheduled */}
          {(session.mode === "online" || session.mode === "hybrid") &&
            session.meetingLink &&
            isJoinZoomEnabled() && 
            // Only allow joining if free or paid
            (session.price === 0 || session.isPaid) && (
              <button
                onClick={() => handleOpenZoom(session.meetingLink)}
                className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <Video className="w-4 h-4 mr-1.5" />
                Join Zoom
              </button>
            )}

          {/* Message for online/hybrid paid sessions without payment */}
          {(session.mode === "online" || session.mode === "hybrid") &&
            !session.meetingLink &&
            session.price > 0 && 
            !session.isPaid && (
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                Zoom link will be available after payment
              </div>
            )}

          {/* Cancel Button - Only show for future scheduled sessions */}
          {session.status === "scheduled" && !isSessionPast && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center border border-red-100"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Cancel
            </button>
          )}

          {/* Complete Button - Only show for past scheduled sessions */}
          {session.status === "scheduled" && isSessionPast && (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center border border-green-100"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Add proper prop validation
SessionCard.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    status: PropTypes.string,
    skill: PropTypes.shape({
      name: PropTypes.string,
    }),
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    duration: PropTypes.number,
    mode: PropTypes.string,
    price: PropTypes.number,
    isPaid: PropTypes.bool,
    location: PropTypes.string,
    description: PropTypes.string,
    meetingLink: PropTypes.string,
    teacher: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
    learner: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
};

export default SessionCard;