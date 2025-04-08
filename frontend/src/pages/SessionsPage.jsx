import  { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/ProfileStore';
import SessionList from '../components/session/SessionList';
import SessionModal from '../components/session/SessionModal';
import { Lock, Plus } from 'lucide-react';

const SessionsPage = () => {
  const {  isAuthenticated } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check if user can schedule (has role of teacher or both)
  const canSchedule = profile?.role === 'teacher' || profile?.role === 'both';
  
  // Fetch profile data when component mounts
  useEffect(() => {
    if (isAuthenticated && !profile) {
      fetchProfile();
    }
  }, [isAuthenticated, profile, fetchProfile]);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 mt-11">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-md w-full">
        <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-medium text-gray-800 mb-3">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view and manage sessions.</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 mt-11">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-medium text-gray-800">Sessions</h1>
          {canSchedule && (
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Schedule Session
            </button>
          )}
        </div>
        
        <SessionList />
        
        <SessionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default SessionsPage; 