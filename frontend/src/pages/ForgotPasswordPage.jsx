import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4  overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>
      <div className="relative w-full max-w-md p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Forgot Password
        </h2>

        {!isSubmitted ? (
          <form className="mt-6" onSubmit={handleSubmit}>
            <p className="text-gray-700 mb-6 text-center">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
            <div className="mb-4">
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md  px-4  focus:outline-none  focus:ring-offset-2 focus:ring-offset-gray-900 "
              type="submit"
            >
              {isLoading ? (
                <Loader className="size-6 animate-spin mx-auto" />
              ) : (
                "Send Reset Link"
              )}
            </motion.button>
            <div className="mt-6 space-y-4 ">
              <Link
                to={"/login"}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md  px-4  focus:outline-none  focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <p className="text-gray-700 mb-6">
              If an account exists for {email}, you will receive a password
              reset link shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
