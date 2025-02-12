import { useProfileStore } from '../store/ProfileStore';
import { useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { FiBook, FiAward } from 'react-icons/fi';
import { format } from 'date-fns';

function Dashboard() {
  const { profile, role, isLoading, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center text-red-500">Profile not found</div>;

  const progress = (profile.points / 100) * 100;
  const memberSince = format(new Date(profile.createdAt), 'MMMM yyyy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 mb-8 mt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {profile.name}!</h1>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">{role}</span>
                    <span className="text-gray-500">Member since {memberSince}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 w-full md:w-auto">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-0.5 rounded-xl">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Current Points</p>
                      <p className="text-2xl font-bold text-gray-800">{profile.points}</p>
                    </div>
                  </div>
                </div>
              </div>

              {role !== 'teacher' && (
                <div className="mt-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Learning Progress</span>
                    <span className="text-sm text-blue-600">{progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}
            </div>
            {(role === 'teacher' || role === 'both') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Sessions Taught</p>
                      <p className="text-3xl font-bold text-gray-800">{profile.sessionsTaught}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FiBook className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Student Rating</p>
                      <p className="text-3xl font-bold text-gray-800">{profile.studentRating}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FiAward className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {(role === 'learner' || role === 'both') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Courses Enrolled</p>
                      <p className="text-3xl font-bold text-gray-800">{profile.coursesEnrolled}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FiBook className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Completed Lessons</p>
                      <p className="text-3xl font-bold text-gray-800">{profile.completedLessons}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FiAward className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FiAward className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Active Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.badges.map((badge, index) => (
                    <div key={index} className="flex items-center px-4 py-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full border border-blue-100">
                      <span className="text-sm text-blue-600">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;