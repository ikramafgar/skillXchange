import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AlertTriangle, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 transition-all">
      <div className="bg-gray-50 rounded-xl w-full max-w-md shadow-2xl transform transition-all">
        <div className="p-5 md:p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-5 text-red-500 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Delete Account</h2>
          </div>
          
          <div className="mb-6 space-y-3">
            <p className="text-gray-800  text-sm">
              Warning: This action cannot be undone. All your data will be permanently deleted, including:
            </p>
            <ul className="space-y-1 text-sm text-gray-600 ">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                Your profile information
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                Your skills and learning paths
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                Your connections and matches
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                All session history
              </li>
            </ul>
            <p className="text-gray-700  text-sm font-medium mt-2">
              Are you sure you want to delete your account?
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700  text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50  border border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200 transition-all"
                placeholder="Enter your password"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">
                For security, please enter your password to confirm deletion.
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700  text-sm font-medium mb-1.5">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50  border border-blue-400  rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-gray-200 transition-all"
                placeholder="DELETE"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-400 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg transition-colors ${
                  confirmText === 'DELETE' && !isLoading 
                    ? 'hover:bg-red-600' 
                    : 'opacity-50 cursor-not-allowed'
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

export default DeleteAccountModal; 