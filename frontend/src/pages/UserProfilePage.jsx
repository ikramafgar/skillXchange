import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaArrowLeft } from "react-icons/fa";

function UserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/users/${userId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  }, [userId]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-20 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-20 blur-2xl rounded-full animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl transition-transform transform hover:scale-105"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-500 hover:text-blue-600 transition"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        {user && (
          <>
            <div className="flex flex-col md:flex-row items-center mb-8">
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-lg border-4 border-blue-100 mb-6 md:mb-0 md:mr-8"
              />
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {user.name}
                </h1>
                <p className="text-lg text-gray-600 italic">{user.bio}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {user.role === "teacher" && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Skills to Teach
                  </h2>
                  <p className="text-gray-700">
                    {Array.isArray(user.skillsToTeach)
                      ? user.skillsToTeach.join(", ")
                      : "No skills to teach listed"}
                  </p>
                </div>
              )}
              {user.role === "learner" && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Skills to Learn
                  </h2>
                  <p className="text-gray-700">
                    {Array.isArray(user.skillsToLearn)
                      ? user.skillsToLearn.join(", ")
                      : "No skills to learn listed"}
                  </p>
                </div>
              )}
              {user.role === "both" && (
                <>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                      Skills to Teach
                    </h2>
                    <p className="text-gray-700">
                      {Array.isArray(user.skillsToTeach)
                        ? user.skillsToTeach.join(", ")
                        : "No skills to teach listed"}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                      Skills to Learn
                    </h2>
                    <p className="text-gray-700">
                      {Array.isArray(user.skillsToLearn)
                        ? user.skillsToLearn.join(", ")
                        : "No skills to learn listed"}
                    </p>
                  </div>
                </>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Skill Level
                </h2>
                <p className="text-gray-700">
                  {user.skillLevel || "No skill level listed"}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Role
                </h2>
                <p className="text-gray-700">{user.role || "No role listed"}</p>
              </div>
            </div>

            <div className="flex justify-center space-x-6">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FaGithub className="w-8 h-8" />
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FaLinkedin className="w-8 h-8" />
                </a>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default UserProfilePage;
