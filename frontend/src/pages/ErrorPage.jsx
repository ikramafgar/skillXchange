import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get error message from URL query parameter
  const errorMessage = searchParams.get('message') || 'An unexpected error occurred';

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-200 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-300 opacity-20 blur-2xl rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="flex flex-col items-center">
          <div className="bg-red-100 p-4 rounded-full mb-6">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Authentication Error</h2>
          
          <p className="text-gray-600 text-center mb-8">
            {errorMessage}
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Go to Login Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage; 