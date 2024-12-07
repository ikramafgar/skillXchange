
import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../store/authStore";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login} = useAuthStore();
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    try {
      await login(email, password);
      toast.success("Login Successful!", { position: "top-center" } );
      navigate('/profile');
      // Redirect user or perform any other actions after successful login
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage, { position: "top-center" });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      window.location.href = "/auth/google"; // Redirect to Google OAuth endpoint
    } catch {
      toast.error("Google authentication failed. Try again.", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  // const handleGithubAuth = () => {
  //   try {
  //     window.location.href = "/auth/github"; // Redirect to GitHub OAuth endpoint
  //   } catch  {
  //     toast.error("GitHub authentication failed. Try again.", {
  //       position: toast.POSITION.TOP_CENTER,
  //     });
  //   }
  // };

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
          <div className='flex justify-end items-center mb-2'>
						<Link to='/forgot-password' className='text-sm text-gray-800 hover:underline'>
							Forgot password?
						</Link>
					</div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
          >
            Login
          </button>
        </form>
          {/* <button
            onClick={handleGithubAuth}
            className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
              alt="GitHub"
              className="w-5 h-5"
            />
            Continue with GitHub
          </button> */}
       
        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
