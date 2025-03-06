import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      {/* Dynamic Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[350px] h-[350px] bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full opacity-20 blur-[150px]"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </div>

      {/* Spinner */}
      <motion.div
        className="relative w-20 h-20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 w-full h-full border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full"></div>
        <div className="absolute inset-0 w-full h-full border-4 border-transparent border-b-pink-400 border-l-green-400 rounded-full opacity-50"></div>
      </motion.div>

      {/* Glow Effect */}
      <div className="absolute w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 blur-3xl rounded-full"></div>
    </div>
  );
};

export default LoadingSpinner;