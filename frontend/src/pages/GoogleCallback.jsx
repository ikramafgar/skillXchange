import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The JWT token is already set in the cookie by the backend
        // Just check authentication status to update the store
        await checkAuth();
        toast.success('Successfully logged in with Google!', { position: 'top-center' });
        navigate('/profile');
      } catch (error) {
        console.error('Error during Google authentication:', error);
        toast.error('Failed to authenticate with Google. Please try again.', { position: 'top-center' });
        navigate('/login');
      }
    };

    handleCallback();
  }, [checkAuth, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing Google Authentication...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default GoogleCallback; 