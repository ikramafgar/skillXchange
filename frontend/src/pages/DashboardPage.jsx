import { useProfileStore } from '../store/ProfileStore';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-white shadow-lg z-40 flex flex-col"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Skill</h1>
                <img src="images/logo.png" alt="Swap Icon" className="w-6 h-6 mx-1" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Change</h1>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={profile.profilePic || "images/default-avatar.png"} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2"
                    onError={(e) => {
                      e.target.src = "images/default-avatar.png";
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{profile.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">{role}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Points</span>
                  <span className="text-xs font-medium text-blue-600">{profile.points}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-violet-50 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            {item.icon}
                          </span>
                          <span className="ml-3 font-medium">{item.name}</span>
                        </div>
                        {isActive && <FiChevronRight className="w-4 h-4 text-blue-600" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="px-4 py-3 rounded-lg flex items-center justify-between text-gray-600 hover:bg-gray-50 transition-colors relative">
                  <div className="flex items-center">
                    <span className="text-gray-400"><FiBell className="w-5 h-5" /></span>
                    <span className="ml-3 font-medium">Notifications</span>
                  </div>
                  <div className="notifications-container">
                    <Notifications inSidebar={true} />
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full flex items-center justify-between px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FiLogOut className="w-5 h-5" />
                    <span className="ml-3 font-medium">Logout</span>
                  </div>
                </button>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {profile.name}!</h1>
                <p className="mt-1 text-gray-500">Member since {memberSince}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span>Schedule</span>
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg shadow-sm text-white hover:opacity-90 flex items-center">
                  <FiTrendingUp className="w-4 h-4 mr-2" />
                  <span>Upgrade</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
            </div>

            {role === 'teacher' || role === 'both' ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
              </div>
            )}

            {role === 'teacher' || role === 'both' ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
              </div>
            )}
          </div>

          {/* Connection Requests Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Connection Requests</h2>
            </div>
            <div className="p-6">
              <ConnectionRequests />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Recent Achievements</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
              </div>
              <div className="p-6">
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {profile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <FiAward className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{achievement}</p>
                          <p className="text-xs text-gray-500 mt-1">Earned on {format(new Date(), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
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
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Active Badges</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
              </div>
              <div className="p-6">
                {profile.badges && profile.badges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profile.badges.map((badge, index) => (
                      <div key={index} className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-violet-50 rounded-lg border border-blue-100">
                        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm mb-3">
                          <FiAward className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm text-center font-medium text-blue-600">{badge}</span>
                      </div>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;