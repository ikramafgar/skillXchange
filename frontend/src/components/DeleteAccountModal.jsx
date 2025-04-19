import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuthStore } from '../store/authStore';
import { 
  AlertCircle, 
  X, 
  Lock, 
  User, 
  Trash2, 
  Key, 
  Shield, 
  BookOpen, 
  Users, 
  Clock 
} from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const { deleteAccount, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check confirmation text
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    try {
      await deleteAccount(password);
      // No need to do anything here as the deleteAccount function will redirect
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl w-full max-w-[92vw] sm:max-w-md shadow-2xl transform transition-all overflow-hidden max-h-[90vh] sm:max-h-[85vh]"
        style={{ maxHeight: 'min(620px, 90vh)' }}
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold">Delete Account</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 70px)' }}>
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-red-700 text-sm font-medium">
              This action cannot be undone. Your account will be permanently deleted.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-blue-800 text-sm font-medium mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Data that will be deleted:
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-2.5 text-blue-700 text-sm">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>Profile information and preferences</span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-700 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Skills and learning paths</span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-700 text-sm">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Connections and matches</span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-700 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Session history and activity logs</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 inline-flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-gray-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 focus:border-red-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <Key className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                  confirmText === 'DELETE' 
                    ? 'border-red-500 text-red-600 focus:ring-red-200 bg-red-50' 
                    : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200'
                }`}
                placeholder="DELETE"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all ${
                  confirmText === 'DELETE' && !isLoading 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg' 
                    : 'bg-red-400 opacity-60 cursor-not-allowed'
                }`}
                disabled={isLoading || confirmText !== 'DELETE'}
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add PropTypes validation
DeleteAccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default DeleteAccountModal; 