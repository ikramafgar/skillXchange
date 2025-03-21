import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../store/authStore";
import { Loader } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, googleLogin,isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const credential = urlParams.get('credential');
      
      if (credential) {
        try {
          await googleLogin(credential);
          toast.success("Login Successful!", { position: "top-center" });
          navigate("/profile");
        } catch (error) {
          console.error("Google login error:", error);
          // Check if this is an existing account error
          if (error.response?.data?.existingAccount) {
            // Redirect to error page with the message
            navigate(`/error?message=${encodeURIComponent(error.response.data.message)}`);
          } else {
            toast.error("Google login failed. Please try again.", {
              position: "top-center",
            });
          }
        }
      }
    };

    handleGoogleCallback();
  }, [googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields", { position: "top-center" });
      return;
    }

    try {
      await login(email, password);
      toast.success("Login Successful!", { position: "top-center" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage, { position: "top-center" });
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };
  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4  overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>

      {/* Login Form */}
      <div className="relative w-full max-w-md p-8 rounded-xl mt-20">
        {/* Toast Notification Container */}
        <ToastContainer />

        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center mt-2">
          Login to access your account
        </p>
        {/* Social Login Buttons */}
        <div className="mt-6 space-y-4">
          <button
            onClick={handleGoogleAuth}
            className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>
        {/* Divider */}
        <div className="flex items-center mt-6">
          <div className="w-full border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        <form className="mt-6" onSubmit={handleSubmit}>
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
          <div className="flex justify-end items-center mb-2">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md flex items-center justify-center  focus:outline-none  focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? (
                <Loader className="size-6 animate-spin mx-auto" />
              ) 
            : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
