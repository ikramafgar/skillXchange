import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaTimes } from "react-icons/fa";
import { MapPin, Briefcase, Mail, DollarSign, Star, Calendar, Award, MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

// Add PropTypes validation
UserProfileModal.propTypes = {
  userId: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function UserProfileModal({ userId, isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      axios
        .get(`/api/users/${userId}`, {
          params: {
            includeDetails: true, // Request additional details including rating
          },
        })
        .then((response) => {
          console.log('User profile data received:', response.data);
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load user profile");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="flex items-center justify-center min-h-screen px-4 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative z-50 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>

            {isLoading ? (
              <div className="p-8 flex justify-center items-center min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 font-medium">Loading profile...</p>
                </div>
              </div>
            ) : (
              user && (
                <div className="relative">
                  {/* Header Section */}
                  <div className="pt-8 px-8 pb-8">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <img
                          src={user.profilePic || "https://via.placeholder.com/150"}
                          alt={user.name}
                          className="w-32 h-32 rounded-full shadow-lg border-4 border-white object-cover"
                        />
                        {user.role === "teacher" && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Teacher
                          </div>
                        )}
                        {user.role === "learner" && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Learner
                          </div>
                        )}
                        {user.role === "both" && (
                          <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Teacher & Learner
                          </div>
                        )}
                      </div>
                      <h1 className="text-3xl font-bold text-gray-800 mb-1">
                        {user.name}
                        {/* Verification badge */}
                        {user.verificationStatus === "approved" && (
                          <span 
                            className="inline-flex ml-2 bg-blue-500 text-white p-1 rounded-full"
                            title="Verified Teacher"
                          >
                            <CheckCircle size={14} />
                          </span>
                        )}
                      </h1>
                      
                      {/* Rating display */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              fill={(user.rating || 0) >= star ? "#EAB308" : "none"}
                              className={`w-5 h-5 ${
                                (user.rating || 0) >= star ? "text-yellow-500" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-600 ml-1">
                          {(user.rating || 0).toFixed(1)} ({user.reviewCount || 0} reviews)
                        </span>
                      </div>
                      
                      <p className="text-gray-600 max-w-md text-center">{user.bio}</p>

                      {/* Basic Info */}
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {user.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.work && (
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="w-4 h-4 mr-1 text-blue-500" />
                            <span>{user.work}</span>
                          </div>
                        )}
                        {user.joinDate && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                            <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-3 gap-1 mb-8 bg-gray-50 py-4 px-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="w-5 h-5 text-blue-500 mr-1" />
                        <div className="text-xl font-bold text-gray-800">
                          {user.sessionsTaught || 0}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">Sessions</div>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <div className="flex items-center justify-center mb-1">
                        <Award className="w-5 h-5 text-green-500 mr-1" />
                        <div className="text-xl font-bold text-gray-800">
                          {user.points || 0}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="w-5 h-5 text-purple-500 mr-1" />
                        <div className="text-xl font-bold text-gray-800">
                          {user.reviewCount || 0}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 px-8">
                    {(user.role === "teacher" || user.role === "both") && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm border border-blue-100">
                        <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                          <Award className="w-5 h-5 mr-2" />
                          Skills to Teach
                          {/* Teaching verification badge */}
                          {user.verificationStatus === "approved" && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full flex items-center ml-2">
                              <CheckCircle size={10} className="mr-1" /> Verified Teacher
                            </span>
                          )}
                        </h2>
                        {/* Display hourly rate */}
                        <div className="mb-4 flex items-center">
                          <div className="px-3 py-1.5 bg-white text-gray-800 rounded-lg border border-blue-200 flex items-center shadow-sm">
                            <DollarSign className="w-4 h-4 mr-1 text-blue-600" />
                            <span className="font-medium">
                              {user.hourlyRate > 0 
                                ? `${user.hourlyRate} PKR/hour` 
                                : "Teaching for free"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(user.skillsToTeach) &&
                            user.skillsToTeach.map((skillObj, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-white text-blue-600 rounded-full text-sm font-medium shadow-sm border border-blue-100"
                              >
                                {skillObj.skill?.name || "Unknown Skill"} (
                                {skillObj.level})
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {(user.role === "learner" || user.role === "both") && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 shadow-sm border border-green-100">
                        <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                          <Award className="w-5 h-5 mr-2" />
                          Skills to Learn
                        </h2>
                        {/* Display learning budget */}
                        <div className="mb-4 flex items-center">
                          <div className="px-3 py-1.5 bg-white text-gray-800 rounded-lg border border-green-200 flex items-center shadow-sm">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="font-medium">
                              {user.learningBudget > 0 
                                ? `Budget: ${user.learningBudget} PKR/hour` 
                                : "Looking for free sessions"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(user.skillsToLearn) &&
                            user.skillsToLearn.map((skillObj, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-white text-green-600 rounded-full text-sm font-medium shadow-sm border border-green-100"
                              >
                                {skillObj.skill?.name || "Unknown Skill"} (
                                {skillObj.level})
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Section */}
                  <div className="px-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {user.email && (
                        <a
                          href={`mailto:${user.email}`}
                          className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm"
                        >
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="text-gray-700 font-medium truncate">{user.email}</div>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="px-8 py-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                    <div className="flex justify-center gap-4">
                      {user.github && (
                        <a
                          href={user.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                        >
                          <FaGithub className="w-5 h-5" />
                        </a>
                      )}
                      {user.linkedin && (
                        <a
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                        >
                          <FaLinkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default UserProfileModal;
