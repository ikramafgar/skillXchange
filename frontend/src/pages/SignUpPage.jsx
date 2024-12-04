
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { signup} = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
     return  toast.error("All fields are required!", { position: "top-center" });
    
    }

    try {
     
      await signup(name, email, password);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
    // Handle signup logic
    toast.success("Signup Successful!", { position: "top-center" });
    // console.log("Name:", name);
    // console.log("Email:", email);
    // console.log("Password:", password);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>

      {/* Signup Form */}
      <div className="relative w-full max-w-md p-8 rounded-xl mt-11 ">
        {/* Toast Notification Container */}
        <ToastContainer />

        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Create Account
        </h1>
        <p className="text-gray-500 text-center mt-2">
          Sign up to start using our platform
        </p>
        <form className="mt-6" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
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

          {/* Password Field */}
          <div className="mb-4">
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
          >
            Sign Up
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
