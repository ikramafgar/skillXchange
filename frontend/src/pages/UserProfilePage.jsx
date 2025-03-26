import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaTimes } from "react-icons/fa";
import { MapPin, Briefcase, Mail, Phone } from "lucide-react";
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
            includeDetails: true, // Request additional details
          },
        })
        .then((response) => {
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
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="flex items-center justify-center min-h-screen px-4 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-50"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>

            {isLoading ? (
              <div className="p-6 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              user && (
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <img
                      src={user.profilePic || "https://via.placeholder.com/150"}
                      alt={user.name}
                      className="w-28 h-28 rounded-full shadow-lg border-4 border-blue-100 object-cover"
                    />
                    <div className="text-center sm:text-left flex-1">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {user.name}
                      </h1>
                      <p className="text-gray-600">{user.bio}</p>

                      {/* Stats Section */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {user.sessionsTaught || 0}
                          </div>
                          <div className="text-sm text-gray-600">Sessions</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <div className="text-xl font-bold text-green-600">
                            {user.points || 0}
                          </div>
                          <div className="text-sm text-gray-600">Points</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2 text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {user.rating || 0}
                          </div>
                          <div className="text-sm text-gray-600">Rating</div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 mt-4">
                        {user.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user.work && (
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="w-4 h-4 mr-1" />
                            <span>{user.work}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    {(user.role === "teacher" || user.role === "both") && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                          Skills to Teach
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(user.skillsToTeach) &&
                            user.skillsToTeach.map((skillObj, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm"
                              >
                                {skillObj.skill?.name || "Unknown Skill"} (
                                {skillObj.level})
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {(user.role === "learner" || user.role === "both") && (
                      <div className="bg-green-50 rounded-xl p-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                          Skills to Learn
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(user.skillsToLearn) &&
                            user.skillsToLearn.map((skillObj, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-white text-green-600 rounded-full text-sm"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {user.email && (
                      <a
                        href={`mailto:${user.email}`}
                        className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100"
                      >
                        <Mail className="text-gray-500" />
                        <span className="text-gray-700">{user.email}</span>
                      </a>
                    )}
                    {user.phone && (
                      <a
                        href={`tel:${user.phone}`}
                        className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100"
                      >
                        <Phone className="text-gray-500" />
                        <span className="text-gray-700">{user.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-4 pt-4 border-t">
                    {user.github && (
                      <a
                        href={user.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 transition"
                      >
                        <FaGithub className="w-6 h-6" />
                      </a>
                    )}
                    {user.linkedin && (
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 transition"
                      >
                        <FaLinkedin className="w-6 h-6" />
                      </a>
                    )}
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
