import { useProfileStore } from '../store/ProfileStore';
import { useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

function Dashboard() {
  const { profile, role, isLoading, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center text-red-500">Profile not found</div>;

  const progress = (profile.points / 100) * 100; // Example progress calculation

  return (
    <div className="min-h-screen bg-gray-200 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* <motion.h1
          className="text-4xl font-bold text-center text-white mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard
        </motion.h1> */}
        <motion.div
          className="bg-white shadow-lg rounded-lg p-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Welcome, {profile.name}!</h2>
          <p className="text-lg mb-6">Role: {role}</p>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Progress</h3>
            <div className="w-full  rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          {role === 'teacher' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Teaching Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="bg-blue-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Total Sessions Taught</h4>
                  <p className="text-2xl font-bold">{profile.sessionsTaught}</p>
                </motion.div>
                <motion.div
                  className="bg-green-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Points Earned</h4>
                  <p className="text-2xl font-bold">{profile.points}</p>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-4">Badges</h3>
              <ul className="flex flex-wrap gap-2">
                {profile.badges.map((badge, index) => (
                  <motion.li
                    key={index}
                    className="bg-yellow-100 p-2 rounded-lg shadow-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    {badge}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          {role === 'learner' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Learning Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="bg-blue-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Courses Enrolled</h4>
                  <p className="text-2xl font-bold">{profile.coursesEnrolled}</p>
                </motion.div>
                <motion.div
                  className="bg-green-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Points Earned</h4>
                  <p className="text-2xl font-bold">{profile.points}</p>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-4">Achievements</h3>
              <ul className="flex flex-wrap gap-2">
                {profile.achievements.map((achievement, index) => (
                  <motion.li
                    key={index}
                    className="bg-yellow-100 p-2 rounded-lg shadow-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    {achievement}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          {role === 'both' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Combined Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="bg-blue-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Total Sessions Taught</h4>
                  <p className="text-2xl font-bold">{profile.sessionsTaught}</p>
                </motion.div>
                <motion.div
                  className="bg-green-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Points Earned</h4>
                  <p className="text-2xl font-bold">{profile.points}</p>
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-4">Badges</h3>
              <ul className="flex flex-wrap gap-2">
                {profile.badges.map((badge, index) => (
                  <motion.li
                    key={index}
                    className="bg-yellow-100 p-2 rounded-lg shadow-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    {badge}
                  </motion.li>
                ))}
              </ul>
              <h3 className="text-xl font-semibold mt-6 mb-4">Learning Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="bg-blue-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Courses Enrolled</h4>
                  <p className="text-2xl font-bold">{profile.coursesEnrolled}</p>
                </motion.div>
                <motion.div
                  className="bg-green-100 p-4 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <h4 className="text-lg font-semibold">Achievements</h4>
                  <ul className="flex flex-wrap gap-2">
                    {profile.achievements.map((achievement, index) => (
                      <motion.li
                        key={index}
                        className="bg-yellow-100 p-2 rounded-lg shadow-md"
                        whileHover={{ scale: 1.05 }}
                      >
                        {achievement}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
