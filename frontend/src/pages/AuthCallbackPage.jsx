import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        
        if (error) {
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }
        
        if (!token) {
          toast.error('Invalid authentication response');
          navigate('/login');
          return;
        }
        
        // The token in the URL is just to identify this session
        // The actual auth token is in the cookies, so we just need to check auth
        await checkAuth();
        
        toast.success('Login successful!');
        navigate('/profile');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {loading ? 'Completing Authentication...' : 'Authentication Complete'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {loading ? 'Please wait while we log you in.' : 'You are now logged in.'}
          </p>
        </div>
        
        {loading && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallbackPage; 