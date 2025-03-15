import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminPanel from '../components/AdminPanel';
import { 
  Shield, 
  Loader2,
  BarChart3,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPage = () => {
  const { isAuthenticated, isAdmin, isCheckingAuth, checkAuth, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/profile');
      }
    }
  }, [isAuthenticated, isAdmin, isCheckingAuth, navigate]);

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  if (isCheckingAuth) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"
        {...pageTransition}
      >
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="h-12 w-12 rounded-full bg-blue-400/20 mx-auto" />
            </motion.div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin dashboard...</p>
          <p className="text-sm text-gray-400">Please wait while we secure your session</p>
        </div>
      </motion.div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16"
        {...pageTransition}
      >
        {/* Admin Header Bar */}
        <div className="bg-white border-b border-gray-100 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white border-b border-gray-100 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Active Users</p>
                    <p className="text-xl font-bold text-blue-900">2,451</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">Today&apos;s Date</p>
                    <p className="text-xl font-bold text-green-900">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">Support Tickets</p>
                    <p className="text-xl font-bold text-purple-900">5</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <motion.div 
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl mr-4 shadow-lg">
                  <Shield className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Welcome back, {user?.name || 'Admin'}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Here&apos;s what&apos;s happening with your platform today
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <AdminPanel />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-4 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} SkillXChange Admin Portal
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminPage; 
