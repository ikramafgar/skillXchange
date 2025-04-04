import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { useAuthStore } from '../store/authStore';
import { format, parseISO, differenceInMinutes, isBefore, isAfter } from 'date-fns';
import { toast } from 'react-hot-toast';

const SessionDetailPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const { fetchSessionById, currentSession, isLoading, error, changeSessionStatus, regenerateZoomLink, zoomMeetingDetails } = useSessionStore();
  const { user } = useAuthStore();
  
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isRefreshingZoom, setIsRefreshingZoom] = useState(false);
  
  // Fetch session data on component mount
  useEffect(() => {
    if (sessionId) {
      fetchSessionById(sessionId).catch(err => {
        console.error('Error fetching session details:', err);
        toast.error('Failed to load session details');
      });
    }
  }, [sessionId, fetchSessionById]);
  
  // Update time remaining for upcoming sessions
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'scheduled') return;
    
    const startTime = parseISO(currentSession.startTime);
    const now = new Date();
    
    // Only set timer for future sessions
    if (isBefore(now, startTime)) {
      const timer = setInterval(() => {
        const now = new Date();
        const mins = differenceInMinutes(startTime, now);
        
        if (mins <= 0) {
          clearInterval(timer);
          setTimeRemaining('Starting now');
        } else {
          const hours = Math.floor(mins / 60);
          const remainingMins = mins % 60;
          
          if (hours > 0) {
            setTimeRemaining(`Starts in ${hours}h ${remainingMins}m`);
          } else {
            setTimeRemaining(`Starts in ${remainingMins}m`);
          }
        }
      }, 60000); // Update every minute
      
      // Initial calculation
      const mins = differenceInMinutes(startTime, now);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      
      if (hours > 0) {
        setTimeRemaining(`Starts in ${hours}h ${remainingMins}m`);
      } else {
        setTimeRemaining(`Starts in ${remainingMins}m`);
      }
      
      return () => clearInterval(timer);
    } else if (isAfter(now, startTime) && isBefore(now, parseISO(currentSession.endTime))) {
      setTimeRemaining('In progress');
    } else {
      setTimeRemaining('Completed');
    }
  }, [currentSession]);
  
  // Handle cancel session
  const handleCancel = async () => {
    try {
      await changeSessionStatus(sessionId, 'cancelled', 'Cancelled by user');
      toast.success('Session cancelled successfully');
    } catch  {
      toast.error('Failed to cancel session');
    }
  };
  
  // Handle mark as complete
  const handleComplete = async () => {
    try {
      await changeSessionStatus(sessionId, 'completed', 'Marked as completed by user');
      toast.success('Session marked as completed');
    } catch  {
      toast.error('Failed to mark session as completed');
    }
  };
  
  // Handle zoom meeting launch
  const handleJoinZoom = () => {
    const meetingLink = currentSession?.meetingLink || zoomMeetingDetails?.joinUrl;
    
    if (!meetingLink) {
      toast.error('No Zoom meeting link available');
      return;
    }
    
    window.open(meetingLink, '_blank');
  };
  
  // Handle zoom link regeneration
  const handleRegenerateZoom = async () => {
    try {
      setIsRefreshingZoom(true);
      
      // Call the regenerate function
      const response = await regenerateZoomLink(sessionId);
      
      // If we get here, it was successful
      toast.success(`Zoom meeting link generated successfully!`, {
        duration: 4000,
        icon: '🎯'
      });
      
    } catch (error) {
      console.error('Error regenerating Zoom link:', error);
      
      // Extract the error message
      let errorMessage = 'Failed to generate Zoom meeting link';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 4000,
        icon: '❌'
      });
    } finally {
      setIsRefreshingZoom(false);
    }
  };
  
  // Determine if session is active (can join now)
  const isSessionActive = () => {
    if (!currentSession || currentSession.status !== 'scheduled') return false;
    
    // Always allow joining scheduled meetings with valid links
    return true;
    
    /* Original time-restricted code:
    const now = new Date();
    const startTime = parseISO(currentSession.startTime);
    const endTime = parseISO(currentSession.endTime);
    
    // Check if it's within 15 minutes of start time or already started but not ended
    const diffInMinutes = differenceInMinutes(startTime, now);
    return (diffInMinutes <= 15 && diffInMinutes > -currentSession.duration) || 
           (isAfter(now, startTime) && isBefore(now, endTime));
    */
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/sessions')} 
            className="text-red-700 underline mt-2"
          >
            Back to sessions
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Session not found</p>
          <button 
            onClick={() => navigate('/sessions')} 
            className="text-yellow-700 underline mt-2"
          >
            Back to sessions
          </button>
        </div>
      </div>
    );
  }
  
  // Determine if current user is teacher or learner
  const isTeacher = user?._id === currentSession.teacher._id;
  const isLearner = user?._id === currentSession.learner._id;
  
  // Format dates for display
  const formattedDate = format(parseISO(currentSession.startTime), 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(parseISO(currentSession.startTime), 'h:mm a');
  const formattedEndTime = format(parseISO(currentSession.endTime), 'h:mm a');
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'rescheduled':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };
  
  return (
    <div className="max-w-full mx-auto px-4 py-8 bg-gray-50 pt-16">
      <button 
        onClick={() => navigate('/sessions')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to sessions
      </button>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in-up">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-gray-800 mb-2 md:mb-0">{currentSession.title}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSession.status)}`}>
              {currentSession.status.charAt(0).toUpperCase() + currentSession.status.slice(1)}
              {timeRemaining && currentSession.status === 'scheduled' && (
                <span className="ml-2">• {timeRemaining}</span>
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Session Details</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Skill</p>
                    <p className="mt-1">{currentSession.skill?.name || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="mt-1">{formattedDate}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="mt-1">{formattedStartTime} - {formattedEndTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="mt-1">{currentSession.duration} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {currentSession.mode === 'online' ? (
                      <>
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </>
                    ) : currentSession.mode === 'in-person' ? (
                      <>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M15.5 3.8a9 9 0 0 1 4.7 4.7M4.8 15.5a9 9 0 0 1-2.6-2.5M3 12l3-3m15 9l-3-3m-8-8l-3-3m11 3l3 3"></path>
                      </>
                    )}
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mode</p>
                    <p className="mt-1">{currentSession.mode.charAt(0).toUpperCase() + currentSession.mode.slice(1)}</p>
                  </div>
                </div>
                
                {currentSession.mode === 'in-person' && currentSession.location && (
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="mt-1">{currentSession.location}</p>
                    </div>
                  </div>
                )}
                
                {currentSession.isRecurring && (
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4"></path>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                      <path d="M7 23l-4-4 4-4"></path>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Recurrence</p>
                      <p className="mt-1">
                        {currentSession.recurrencePattern?.frequency.charAt(0).toUpperCase() + 
                         currentSession.recurrencePattern?.frequency.slice(1)}
                        {currentSession.recurrencePattern?.interval > 1 && `, every ${currentSession.recurrencePattern.interval} times`}
                      </p>
                    </div>
                  </div>
                )}
                
                {(currentSession.mode === 'online' || currentSession.mode === 'hybrid') && (
                  <div className="mt-2 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-2">Zoom Meeting</p>
                    <div className="mt-1">
                      {currentSession.meetingLink || zoomMeetingDetails?.joinUrl ? (
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <a 
                              href={currentSession.meetingLink || zoomMeetingDetails?.joinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                            >
                              View Zoom Meeting Link
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(currentSession.meetingLink || zoomMeetingDetails?.joinUrl);
                                toast.success('Zoom link copied to clipboard!');
                              }}
                              className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200 transition-colors duration-200"
                            >
                              Copy Link
                            </button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={handleJoinZoom}
                              className="flex items-center text-sm px-3 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Join Zoom Meeting
                            </button>

                            <button
                              onClick={handleRegenerateZoom}
                              disabled={isRefreshingZoom || currentSession.status !== 'scheduled'}
                              className={`
                                flex items-center text-sm px-3 py-2 rounded-lg font-medium transition-colors duration-200
                                ${currentSession.status === 'scheduled' && !isRefreshingZoom
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                  : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                                }
                              `}
                            >
                              {isRefreshingZoom ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Regenerating...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Regenerate Link
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No Zoom link available
                          </div>
                          <button
                            onClick={handleRegenerateZoom}
                            disabled={isRefreshingZoom || currentSession.status !== 'scheduled'}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm self-start flex items-center hover:bg-blue-700 transition-colors duration-200"
                          >
                            {isRefreshingZoom ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Generate Zoom Link
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Participants</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Teacher</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 overflow-hidden border border-gray-200">
                      {currentSession.teacher?.profilePic ? (
                        <img 
                          src={currentSession.teacher.profilePic} 
                          alt={currentSession.teacher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{currentSession.teacher?.name?.charAt(0) || 'T'}</span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{currentSession.teacher?.name || 'Unknown'}</p>
                      {isTeacher && <span className="text-xs text-blue-600">(You)</span>}
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Learner</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 overflow-hidden border border-gray-200">
                      {currentSession.learner?.profilePic ? (
                        <img 
                          src={currentSession.learner.profilePic} 
                          alt={currentSession.learner.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{currentSession.learner?.name?.charAt(0) || 'L'}</span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{currentSession.learner?.name || 'Unknown'}</p>
                      {isLearner && <span className="text-xs text-blue-600">(You)</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              {currentSession.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Description</h2>
                  <p className="text-gray-600 whitespace-pre-line">{currentSession.description}</p>
                </div>
              )}
              
              {currentSession.status === 'scheduled' && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Cancel Session
                  </button>
                  
                  {currentSession.status === 'scheduled' && (currentSession.mode === 'online' || currentSession.mode === 'hybrid') && (currentSession.meetingLink || zoomMeetingDetails?.joinUrl) && (
                    <button
                      onClick={handleJoinZoom}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Zoom Meeting
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Session History/Activity Log */}
          {currentSession.history && currentSession.history.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Session History</h2>
              <div className="space-y-4">
                {currentSession.history.map((entry, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                        {entry.action === 'created' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                        {entry.action === 'updated' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                        {entry.action === 'cancelled' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {entry.action === 'completed' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {entry.action === 'rescheduled' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">
                          {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                        </span>
                      </p>
                      {entry.details && (
                        <p className="text-sm text-gray-600">{entry.details}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {entry.timestamp ? format(parseISO(entry.timestamp), 'MMM d, yyyy h:mm a') : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage; 