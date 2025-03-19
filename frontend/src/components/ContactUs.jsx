import { useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
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

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-lg p-6 rounded-2xl mt-20 shadow-lg border border-gray-100/50 transform hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-gray-900 text-center tracking-tight">
          Get in Touch
        </h1>
        <p className="text-gray-600 text-center mt-3 text-lg leading-relaxed">
          Questions or need assistance? Reach out, and we'll respond promptly.
        </p>

        {/* Status Message */}
        <AnimatePresence>
          {submitStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-4 rounded-xl ${
                submitStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              } flex items-center`}
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

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-gray-800 font-medium mb-2 text-sm"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-gray-800 font-medium mb-2 text-sm"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Message Input */}
          <div>
            <label
              htmlFor="message"
              className="block text-gray-800 font-medium mb-2 text-sm"
            >
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows="5"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                resize: "none",
              }}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg flex items-center justify-center ${
              isSubmitting 
                ? "bg-blue-400 text-white cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300/50"
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
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;