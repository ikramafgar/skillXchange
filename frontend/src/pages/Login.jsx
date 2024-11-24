// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  const handleGoogleAuth = () => {
    console.log("Google Authentication");
    // Implement Google Authentication Logic
  };

  const handleGithubAuth = () => {
    console.log("GitHub Authentication");
    // Implement GitHub Authentication Logic
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
       <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-400 opacity-20 blur-2xl rounded-full"></div>
      </div>
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Login to your account
        </p>
        <form className="mt-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>
        {/* Divider */}
        <div className="mt-6 flex items-center justify-center">
          <div className="w-1/4 border-b border-gray-300"></div>
          <span className="mx-2 text-sm text-gray-500">or</span>
          <div className="w-1/4 border-b border-gray-300"></div>
        </div>
        {/* Social Buttons */}
        <div className="mt-6 flex flex-col gap-4">
          <button
            onClick={handleGoogleAuth}
            className="flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-100 transition duration-200"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
          <button
            onClick={handleGithubAuth}
            className="flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-100 transition duration-200"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
              alt="GitHub"
              className="w-5 h-5"
            />
            Continue with GitHub
          </button>
        </div>
        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
