import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminPanel from '../components/AdminPanel';
import { Shield, Loader2 } from 'lucide-react';

const AdminPage = () => {
  const { isAuthenticated, isAdmin, isCheckingAuth, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/profile');
      }
    }
  }, [isAuthenticated, isAdmin, isCheckingAuth, navigate]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // This will be caught by the useEffect and redirected
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-indigo-100 p-3 rounded-xl mr-4">
                <Shield className="text-indigo-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">
                  Manage teacher verifications and platform statistics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Admin Access
              </span>
            </div>
          </div>
        </div>
        
        <AdminPanel />
      </div>
    </div>
  );
};

export default AdminPage; 