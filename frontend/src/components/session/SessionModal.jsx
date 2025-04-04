import React, { useEffect } from 'react';
import SessionForm from './SessionForm';

const SessionModal = ({ isOpen, onClose, matchDetails = null, teacherId = null, learnerId = null, skillId = null }) => {
  // Disable scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle successful session creation
  const handleSuccess = (sessionData) => {
    onClose(sessionData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
        
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all animate-fade-in-up">
          <div className="absolute top-0 right-0 p-4 z-10">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <SessionForm 
              onSuccess={handleSuccess} 
              matchDetails={matchDetails}
              teacherId={teacherId}
              learnerId={learnerId}
              skillId={skillId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal; 