import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-10 left-10 w-96 h-96 bg-blue-200 opacity-30 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300 opacity-20 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-64 h-64 bg-teal-200 opacity-20 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -10, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Main card container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Decorative top border */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600" />
        
        <div className="p-8">
          <div className="flex flex-col items-center">
            {/* 404 with animations */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">404</div>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-800 mt-2 mb-4 text-center"
            >
              Oops! Page Not Found
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 text-center mb-8 max-w-sm"
            >
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </motion.p>
            
            {/* Button container */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 w-full"
            >
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
                <span>Go Back</span>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Home Page</span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage; 