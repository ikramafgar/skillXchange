import { useProfileStore } from '../store/ProfileStore';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ConnectionRequests from '../components/ConnectionRequests';
import Certificates from '../components/Certificates';
import { motion, AnimatePresence } from 'framer-motion';
import { socket, authenticateSocket } from '../socket';
import { 
  FiBook, 
  FiAward, 
  FiUsers, 
  FiUser, 
  FiMessageSquare, 
  FiLogOut, 
 
  FiX,
  FiHome,
  FiSettings,
 
  FiTrendingUp,
  FiCalendar,
  FiGrid,
  FiActivity,
  FiBell,
  FiClock,
  FiStar,
  FiTarget,
  FiShield
} from 'react-icons/fi';
import { format } from 'date-fns';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Dashboard() {
  const { profile, role, isLoading, fetchProfile } = useProfileStore();
  const { logout, user } = useAuthStore();
  const [showConnectionRequests, setShowConnectionRequests] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  // Initialize socket connection
  useEffect(() => {
    if (user?._id) {
      authenticateSocket(user._id);
      
      // Listen for new connection requests
      socket.on('connectionRequest', (data) => {
        // Increment counter or refresh requests
        setPendingRequestsCount(prev => prev + 1);
        
        // Also trigger a custom event to notify the ConnectionRequests component
        window.dispatchEvent(new CustomEvent('connection-updated', {
          detail: data
        }));
        
        // Show toast notification for the new connection request
        if (data && data.sender) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-blue-500 ring-opacity-20`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={data.sender.profilePic || '/images/default-avatar.png'} 
                      alt={data.sender.name}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      New Connection Request
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {data.sender.name} wants to connect with you
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    // Open connection requests panel when clicked
                    setShowConnectionRequests(true);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  View
                </button>
              </div>
            </div>
          ), { duration: 5000 });
        }
      });
      
      return () => {
        socket.off('connectionRequest');
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleConnectionRequests = () => {
    setShowConnectionRequests(!showConnectionRequests);
    // Reset counter when opening connection requests
    if (!showConnectionRequests) {
      setPendingRequestsCount(0);
    }
  };

  // Effect to fetch pending requests count on mount and socket events
  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      try {
        const response = await fetch('/api/connections/pending/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        // Use the count of pending requests where the user is the receiver
        const incomingCount = data.count;
        setPendingRequestsCount(incomingCount);
        
        // Use debug data to set the title of the button
        if (data.debug) {
          const { totalPendingConnections, asReceiver } = data.debug;
          const outgoingCount = totalPendingConnections - asReceiver;
          
          console.log(`Pending requests: ${asReceiver} incoming, ${outgoingCount} outgoing`);
        }
      } catch (error) {
        console.error('Error fetching pending requests count:', error);
      }
    };
    
    if (user?._id) {
      fetchPendingRequestsCount();
    }
    
    // Listen for connection updates
    const handleConnectionUpdate = (event) => {
      console.log('Dashboard: Connection updated event received', event.detail);
      fetchPendingRequestsCount();
    };
    
    window.addEventListener('connection-updated', handleConnectionUpdate);
    
    return () => {
      window.removeEventListener('connection-updated', handleConnectionUpdate);
    };
  }, [user]);

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center text-red-500">Profile not found</div>;

  // const progress = (profile.points / 100) * 100;
  const memberSince = format(new Date(profile.createdAt), 'MMMM yyyy');

  const navItems = [
    { name: "Dashboard", icon: <FiHome className="w-5 h-5" />, href: "/dashboard" },
    { name: "Profile", icon: <FiUser className="w-5 h-5" />, href: "/profile" },
    { name: "Messages", icon: <FiMessageSquare className="w-5 h-5" />, href: "/chat" },
    { name: "Skills", icon: <FiGrid className="w-5 h-5" />, href: "/skills" },
    { name: "Settings", icon: <FiSettings className="w-5 h-5" />, href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="fixed inset-0 bg-blue-500 opacity-5 z-0 pointer-events-none" style={{ 
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%235b9bd5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        backgroundSize: "60px 60px"
      }}></div>
      <div className="flex flex-col lg:flex-row relative z-10">
        {/* Main Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="mb-8 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full -mr-32 -mt-32 opacity-70"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-full -ml-32 -mb-32 opacity-50"></div>
                <div className="p-6 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {/* User Profile Section */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse blur-md opacity-30"></div>
                        <img 
                          src={profile.profilePic || "/images/default-avatar.png"} 
                          alt="Profile" 
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 relative z-10"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white z-20"></span>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                          {profile.name}
                          <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full">
                            {role}
                          </span>
                        </h1>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 flex items-center">
                            <FiClock className="mr-1 text-blue-400" />
                            Member since {memberSince}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Level Indicator */}
                    {/* <div className="flex-shrink-0 sm:ml-auto md:w-48">
                      <div className="mb-1 flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium flex items-center">
                          <span className="inline-flex justify-center items-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mr-1">
                            {Math.floor(profile.points / 20) + 1}
                          </span>
                          Level {Math.floor(profile.points / 20) + 1}
                        </span>
                        <span className="text-xs font-medium text-blue-600">{profile.points}/100 XP</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div> */}
                  </div>
                  
                  {/* Navigation Menu */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                      <div className="flex space-x-1.5">
                        {navItems.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap ${
                                isActive 
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100 shadow-sm' 
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border hover:border-gray-100'
                              }`}
                            >
                              <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'} transition-colors duration-200`}>
                                {item.icon}
                              </span>
                              <span className="ml-2">{item.name}</span>
                            </Link>
                          );
                        })}
                        
                        {/* Connection Requests Button */}
                        <button
                          onClick={toggleConnectionRequests}
                          className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap ${
                            showConnectionRequests 
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100 shadow-sm' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border hover:border-gray-100'
                          }`}
                        >
                          <span className={`${showConnectionRequests ? 'text-blue-600' : 'text-gray-400'} transition-colors duration-200`}>
                            <FiUsers className="w-5 h-5" />
                          </span>
                          <span className="ml-2">Connections</span>
                          {pendingRequestsCount > 0 && (
                            <span className="ml-1.5 flex items-center justify-center min-w-[22px] h-[22px] rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-2 ring-white">
                              {pendingRequestsCount}
                            </span>
                          )}
                        </button>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center">
                          <FiCalendar className="w-4 h-4 text-gray-500" />
                          <span className="ml-2 hidden sm:inline text-sm font-medium">Schedule</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="px-3.5 py-2.5 border border-red-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span className="ml-2 hidden sm:inline text-sm font-medium">Logout</span>
                        </button>
                        <button className="px-3.5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center">
                          <FiTrendingUp className="w-4 h-4" />
                          <span className="ml-2 hidden sm:inline text-sm font-medium">Upgrade</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Requests Section */}
            <AnimatePresence>
              {showConnectionRequests && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white backdrop-blur-sm rounded-2xl shadow-md border border-blue-100 overflow-hidden mb-8 relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-50 to-transparent rounded-full -ml-10 -mb-10"></div>
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center relative z-10">
                    <div className="flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-3">
                        <FiUsers className="w-4 h-4 text-blue-600" />
                      </span>
                      <h2 className="font-semibold text-gray-800">Connection Requests</h2>
                    </div>
                    <button 
                      onClick={toggleConnectionRequests}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 relative z-10">
                    <ConnectionRequests inSidebar={false} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-50 to-transparent rounded-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Points</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{profile.points}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition-colors duration-200">
                    <FiAward className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm relative z-10">
                  <span className="text-green-500 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    +12%
                  </span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-indigo-50 to-transparent rounded-full"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Connections</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{profile.connections || 0}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 group-hover:bg-indigo-100 transition-colors duration-200">
                    <FiUsers className="w-6 h-6 text-indigo-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm relative z-10">
                  <span className="text-green-500 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    +5
                  </span>
                  <span className="text-gray-500 ml-2">new this week</span>
                </div>
              </motion.div>

              {role === 'teacher' || role === 'both' ? (
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-50 to-transparent rounded-full"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sessions Taught</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{profile.sessionsTaught || 0}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100 group-hover:bg-green-100 transition-colors duration-200">
                      <FiBook className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm relative z-10">
                    <span className="text-green-500 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +3
                    </span>
                    <span className="text-gray-500 ml-2">this month</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-50 to-transparent rounded-full"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Courses Enrolled</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{profile.coursesEnrolled || 0}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100 group-hover:bg-green-100 transition-colors duration-200">
                      <FiBook className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm relative z-10">
                    <span className="text-green-500 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +2
                    </span>
                    <span className="text-gray-500 ml-2">new courses</span>
                  </div>
                </motion.div>
              )}

              {role === 'teacher' || role === 'both' ? (
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-50 to-transparent rounded-full"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Student Rating</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{profile.studentRating || '4.8'}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 group-hover:bg-amber-100 transition-colors duration-200">
                      <FiStar className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm relative z-10">
                    <span className="text-green-500 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +0.2
                    </span>
                    <span className="text-gray-500 ml-2">from last month</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-50 to-transparent rounded-full"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Completed Lessons</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{profile.completedLessons || 0}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 group-hover:bg-amber-100 transition-colors duration-200">
                      <FiTarget className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm relative z-10">
                    <span className="text-green-500 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +5
                    </span>
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
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-transparent rounded-full -ml-20 -mt-20 opacity-80"></div>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center relative z-10">
                  <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-3">
                      <FiActivity className="w-4 h-4 text-blue-600" />
                    </span>
                    <h2 className="font-semibold text-gray-800">Recent Achievements</h2>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center">
                    View all
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 relative z-10">
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <div className="space-y-4">
                      {profile.achievements.map((achievement, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-blue-50 transition-all duration-200 border border-transparent hover:border-blue-100 group"
                        >
                          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mr-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-200 border border-blue-200">
                            <FiAward className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-800 font-medium group-hover:text-blue-700 transition-colors duration-200">{achievement}</p>
                            <p className="text-xs text-gray-500 mt-1">Earned on {format(new Date(), 'MMM dd, yyyy')}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                        <FiAward className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-gray-500 font-medium">No achievements yet</p>
                      <p className="text-sm text-gray-400 mt-1">Complete courses to earn achievements</p>
                      <button className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors duration-200">
                        Explore Session 
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-transparent rounded-full -mr-20 -mt-20 opacity-80"></div>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center relative z-10">
                  <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 mr-3">
                      <FiShield className="w-4 h-4 text-indigo-600" />
                    </span>
                    <h2 className="font-semibold text-gray-800">Active Badges</h2>
                  </div>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 flex items-center">
                    View all
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 relative z-10">
                  {profile.badges && profile.badges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {profile.badges.map((badge, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          whileHover={{ y: -5, scale: 1.03, transition: { duration: 0.2 } }}
                          className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-indigo-100 transition-all duration-200 hover:shadow-md hover:border-indigo-200 group"
                        >
                          <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full shadow-sm mb-3 group-hover:from-indigo-100 group-hover:to-indigo-200 transition-colors duration-200 border border-indigo-200">
                            <FiAward className="w-7 h-7 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" />
                          </div>
                          <span className="text-sm text-center font-medium text-gray-700 group-hover:text-indigo-700 transition-colors duration-200">{badge}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                        <FiShield className="w-8 h-8 text-indigo-500" />
                      </div>
                      <p className="text-gray-500 font-medium">No badges yet</p>
                      <p className="text-sm text-gray-400 mt-1">Earn badges by completing challenges</p>
                      <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-100 transition-colors duration-200">
                        Explore Challenges
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Certificates Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-8"
            >
              <div className="flex items-center mb-6">
                <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 mr-3">
                  <FiBell className="w-5 h-5 text-blue-600" />
                </span>
                <h2 className="text-xl font-bold text-gray-800">My Certificates</h2>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -ml-32 -mt-32 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-indigo-50 to-purple-50 rounded-full -mr-32 -mb-32 opacity-50"></div>
                <div className="relative z-10">
                <Certificates />
                </div>
              </div>
            </motion.div>
            
            {/* Footer */}
            <div className="mt-12 text-center text-xs text-gray-400 py-6">
              <div className="inline-flex items-center justify-center space-x-1 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              </div>
              <p className="font-medium">SkillXChange v1.0.0</p>
              <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;