import { useProfileStore } from '../store/ProfileStore';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ConnectionRequests from '../components/ConnectionRequests';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBook, 
  FiAward, 
  FiUsers, 
  FiUser, 
  FiMessageSquare, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiHome,
  FiSettings,
  FiBell,
  FiChevronRight,
  FiTrendingUp,
  FiCalendar,
  FiGrid
} from 'react-icons/fi';
import { format } from 'date-fns';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Notifications from '../components/Notifications';

function Dashboard() {
  const { profile, role, isLoading, fetchProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showConnectionRequests, setShowConnectionRequests] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Close sidebar on desktop by default
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleConnectionRequests = () => {
    setShowConnectionRequests(!showConnectionRequests);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center text-red-500">Profile not found</div>;

  const progress = (profile.points / 100) * 100;
  const memberSince = format(new Date(profile.createdAt), 'MMMM yyyy');

  const sidebarItems = [
    { name: "Dashboard", icon: <FiHome className="w-5 h-5" />, href: "/dashboard" },
    { name: "Profile", icon: <FiUser className="w-5 h-5" />, href: "/profile" },
    { name: "Messages", icon: <FiMessageSquare className="w-5 h-5" />, href: "/chat" },
    { name: "Skills", icon: <FiGrid className="w-5 h-5" />, href: "/skills" },
    { name: "Settings", icon: <FiSettings className="w-5 h-5" />, href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16"> {/* Added pt-16 to account for navbar */}
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Drawer Toggle Button - Centered on left side */}
      <div className="fixed left-5 top-1/2 -translate-y-[60%] z-50">
        <motion.button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            rotate: sidebarOpen ? 180 : 0,
            x: sidebarOpen ? 5 : 0
          }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="p-3.5 rounded-full text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center"
          style={{ 
            background: sidebarOpen 
              ? 'linear-gradient(to right, rgb(239, 68, 68), rgb(236, 72, 153))' 
              : 'linear-gradient(to right, rgb(59, 130, 246), rgb(124, 58, 237))'
          }}
          aria-label="Toggle drawer"
        >
          {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Modern Drawer - Slides from left */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 350, 
              damping: 30,
              duration: 0.4
            }}
            className="fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-white z-40 flex flex-col overflow-hidden shadow-2xl pt-12"
          >
            {/* Close button for mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-6 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors duration-200 md:hidden"
              aria-label="Close drawer"
            >
              <FiX className="w-4 h-4" />
            </button>
            
         

            {/* User Profile */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={profile.profilePic || "/images/default-avatar.png"} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2"
                    onError={(e) => {
                      e.target.src = "/images/default-avatar.png";
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-800 truncate">{profile.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">{role}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 font-medium">Points</span>
                  <span className="text-xs font-medium text-blue-600">{profile.points}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <div className="mb-4 px-3">
                <h3 className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Main Menu</h3>
              </div>
              <ul className="space-y-1.5">
                {sidebarItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 font-medium' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'} transition-colors duration-200`}>
                          {item.icon}
                        </span>
                        <span className="ml-3">{item.name}</span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="ml-auto"
                          >
                            <FiChevronRight className="w-4 h-4 text-blue-600" />
                          </motion.div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 px-3">
                <h3 className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Social</h3>
              </div>
              <ul className="mt-2 space-y-1.5">
                {/* Connection Requests and Notifications */}
                <li>
                  <button
                    onClick={toggleConnectionRequests}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      showConnectionRequests 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`${showConnectionRequests ? 'text-blue-600' : 'text-gray-400'} transition-colors duration-200`}>
                      <FiUsers className="w-5 h-5" />
                    </span>
                    <span className="ml-3">Connections</span>
                    <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">3</span>
                  </button>
                  {showConnectionRequests && (
                    <div className="mt-2 pl-10 pr-3">
                      <ConnectionRequests inSidebar={true} />
                    </div>
                  )}
                </li>
                <li>
                  <div className="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 relative">
                    <span className="text-gray-400"><FiBell className="w-5 h-5" /></span>
                    <span className="ml-3">Notifications</span>
                    <div className="notifications-container ml-auto">
                      <Notifications inSidebar={true} />
                    </div>
                  </div>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 px-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="ml-3 font-medium">Logout</span>
                </button>
                
                <div className="mt-6 text-center text-xs text-gray-400">
                  <p>SkillXchange v1.0.0</p>
                  <p className="mt-1">© 2023 All rights reserved</p>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarOpen ? 'lg:pl-[320px]' : 'lg:pl-20'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {profile.name}!</h1>
                <p className="mt-1 text-gray-500">Member since {memberSince}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span>Schedule</span>
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg shadow-sm text-white hover:opacity-90 transition-all duration-200 flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  <span>Upgrade</span>
                </button>
              </div>
            </div>
          </div>

          {/* Connection Requests Section - Shown when clicked */}
          <AnimatePresence>
            {showConnectionRequests && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">Connection Requests</h2>
                  <button 
                    onClick={toggleConnectionRequests}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <ConnectionRequests inSidebar={false} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Points</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{profile.points}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiAward className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">+12%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Connections</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{profile.connections || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FiUsers className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">+5</span>
                <span className="text-gray-500 ml-2">new this week</span>
              </div>
            </motion.div>

            {role === 'teacher' || role === 'both' ? (
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sessions Taught</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{profile.sessionsTaught || 0}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <FiBook className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">+3</span>
                  <span className="text-gray-500 ml-2">this month</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Courses Enrolled</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{profile.coursesEnrolled || 0}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <FiBook className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">+2</span>
                  <span className="text-gray-500 ml-2">new courses</span>
                </div>
              </motion.div>
            )}

            {role === 'teacher' || role === 'both' ? (
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Student Rating</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{profile.studentRating || '4.8'}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <FiAward className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">+0.2</span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Lessons</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{profile.completedLessons || 0}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <FiAward className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">+5</span>
                  <span className="text-gray-500 ml-2">this week</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Achievements */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Recent Achievements</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">View all</button>
              </div>
              <div className="p-6">
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {profile.achievements.map((achievement, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <FiAward className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{achievement}</p>
                          <p className="text-xs text-gray-500 mt-1">Earned on {format(new Date(), 'MMM dd, yyyy')}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                      <FiAward className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-500">No achievements yet</p>
                    <p className="text-sm text-gray-400 mt-1">Complete courses to earn achievements</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Active Badges</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">View all</button>
              </div>
              <div className="p-6">
                {profile.badges && profile.badges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profile.badges.map((badge, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-violet-50 rounded-lg border border-blue-100 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm mb-3">
                          <FiAward className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm text-center font-medium text-blue-600">{badge}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4">
                      <FiAward className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-gray-500">No badges yet</p>
                    <p className="text-sm text-gray-400 mt-1">Earn badges by completing challenges</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;