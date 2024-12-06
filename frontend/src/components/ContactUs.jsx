import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic
    console.log("Form submitted", formData);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4  overflow-hidden">
    {/* Overlay Effects */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-40 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
    </div>

      {/* Content */}
      <div className="relative w-full max-w-md p-8 rounded-xl mt-20">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Contact Us
        </h1>
        <p className="text-gray-500 text-center mt-2">
          Have questions or need help? Get in touch with us, and we’ll get back
          to you as soon as possible.
        </p>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6"
        >
          {/* Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
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
              className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
          >
            Send Message
          </button>
        </form>
      </div>
      </div>
  );
};

export default Contact;
