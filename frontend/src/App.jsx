import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import PropTypes from "prop-types"; // Import PropTypes
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { authenticateSocket } from "./socket";
import { Toaster } from "react-hot-toast"; // Import Toaster component

import Navbar from "./components/Navbar"; // Navbar component
import Contact from "./components/ContactUs";
// import MouseTracker from "./components/MouseTracker";

// Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage"; // New Profile Page
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import HelpPage from "./pages/HelpPage";
import AuthCallbackPage from "./pages/AuthCallbackPage"; // Import the Auth callback component
import AdminPage from "./pages/AdminPage"; // Import the Admin page component
import Main from "./pages/MainPage";
import ErrorPage from "./pages/ErrorPage"; // Import the Error page component
import NotFoundPage from "./pages/NotFoundPage"; // Import the NotFound page component
import ChatPage from "./pages/ChatPage"; // Import the Chat page component
import SessionsPage from "./pages/SessionsPage"; // Import the Sessions page component
import SessionDetailPage from "./pages/SessionDetailPage"; // Import the Session Detail page component
import PaymentPage from "./pages/PaymentPage"; // Import the Payment page component
import PaymentResultPage from "./pages/PaymentResultPage"; // Import the Payment Result page component

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Admin route protection
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user && user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

RedirectAuthenticatedUser.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  // Check authentication status when app loads
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      authenticateSocket(user._id);
    }
  }, [isAuthenticated, user]);

  return (
    <Router>
       {/* <MouseTracker /> */}
      <Navbar /> {/* Navbar is used here */}
      {/* Add Toaster component for toast notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} /> {/* New Profile Page */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/error" element={<ErrorPage />} /> {/* New Error Page */}
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth-callback" element={<AuthCallbackPage />} /> 
        <Route path="/main"
        element={
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:userId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        {/* Session routes */}
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <SessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:sessionId"
          element={
            <ProtectedRoute>
              <SessionDetailPage />
            </ProtectedRoute>
          }
        />
        {/* Payment routes */}
        <Route
          path="/payment/:sessionId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-result"
          element={
            <ProtectedRoute>
              <PaymentResultPage />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
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
        {/* Catch-all route for 404 errors */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
