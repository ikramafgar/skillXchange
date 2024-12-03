// eslint-disable-next-line no-unused-vars
import React from "react";
import {
  Navigate,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import Navbar from "./components/Navbar"; // Import Navbar

// Pages
import HomePage from "./pages/HomePage"; // Home page
import AboutPage from "./pages/AboutPage"; // About page
import LoginPage from "./pages/LoginPage"; // Login page
import SignUpPage from "./pages/SignUpPage"; // Signup page
import SkillsPage from "./pages/SkillsPage"; // Skills page
import ProfilePage from "./pages/ProfilePage"; // Profile page
import DashboardPage from "./pages/DashboardPage"; // Dashboard page
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Navbar /> {/* Navbar is used here */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* <Route path="/login" element={<LoginPage/>} /> */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
         
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
