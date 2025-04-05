import { useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle, AlertCircle, Mail, User, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact/submit`,
        formData
      );
      
      console.log("Message sent successfully:", response.data);
      setSubmitStatus("success");
      
      // Reset the form
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus("error");
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.08]"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -top-64 left-1/2 w-96 h-96 bg-yellow-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-lg"
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 pointer-events-none">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-blue-500 to-purple-400"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-yellow-400 to-pink-400"></div>
        </div>

        {/* Main Content Card */}
        <motion.div 
          className="relative p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100/50 transform transition-all duration-300 bg-white/90 backdrop-blur-xl"
          whileHover={{ scale: 1.01 }}
        >
          {/* Header Section */}
          <motion.div variants={formItemVariants} className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium mb-4"
            >
              <span className="relative flex items-center">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                Contact Us
              </span>
            </motion.div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600">
              Get in Touch
            </h1>
            <p className="text-gray-600 mt-3 text-lg leading-relaxed">
              Questions or need assistance? Reach out, and we&apos;ll respond promptly.
            </p>
          </motion.div>

          {/* Status Message */}
          <AnimatePresence>
            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl ${
                  submitStatus === "success" 
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-100" 
                    : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-100"
                } flex items-center shadow-sm`}
              >
                {submitStatus === "success" ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                )}
                <span>
                  {submitStatus === "success"
                    ? "Thank you! Your message has been sent successfully."
                    : "Sorry, there was an error sending your message. Please try again."}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <motion.div variants={formItemVariants}>
              <label htmlFor="name" className="block text-gray-800 font-medium mb-2 text-sm">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Email Input */}
            <motion.div variants={formItemVariants}>
              <label htmlFor="email" className="block text-gray-800 font-medium mb-2 text-sm">
                Your Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Message Input */}
            <motion.div variants={formItemVariants}>
              <label htmlFor="message" className="block text-gray-800 font-medium mb-2 text-sm">
                Your Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <motion.textarea
                  whileFocus="focus"
                  variants={inputVariants}
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows="5"
                  style={{ resize: "none" }}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>

            {/* Enhanced Submit Button */}
            <motion.div variants={formItemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-xl flex items-center justify-center ${
                  isSubmitting
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contact;