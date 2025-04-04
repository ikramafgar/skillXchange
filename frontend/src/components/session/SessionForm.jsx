import { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/ProfileStore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// UI Components - using Tailwind CSS
const SessionForm = ({ onSuccess, matchDetails = null, teacherId = null, learnerId = null, skillId = null }) => {
  const { createSession, isLoading, error, clearError } = useSessionStore();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { profile } = useProfileStore();
  
  const [formStep, setFormStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [connections, setConnections] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mode: 'online', // Default to online for Zoom integration
    startDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Tomorrow
    startTime: '12:00',
    duration: '60', // 1 hour default
    location: '',
    isRecurring: false,
    frequency: 'weekly',
    interval: '1',
    endDate: '',
    selectedUserId: '',
    selectedSkillId: '',
    teachingRole: 'teacher' // Default role: 'teacher' or 'learner'
  });
  
  // Check authentication status when component mounts
  useEffect(() => {
    // Ensure the user is authenticated
    checkAuth().catch(error => {
      console.error('Authentication check failed:', error);
      toast.error('Please log in to schedule a session');
    });
  }, [checkAuth]);
  
  // Clear any errors when the component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
  
  // Set initial values if provided
  useEffect(() => {
    if (matchDetails) {
      // If match details are provided, prefill the form
      setFormData(prev => ({
        ...prev,
        title: `Session for ${matchDetails.skillToLearn?.name || 'Skill Exchange'}`,
        selectedSkillId: matchDetails.skillToLearn || '',
        selectedUserId: matchDetails.matchedUser || '',
        teachingRole: user?._id === matchDetails.user ? 'learner' : 'teacher'
      }));
    } else if (teacherId && learnerId) {
      setFormData(prev => ({
        ...prev,
        selectedUserId: user?._id === teacherId ? learnerId : teacherId,
        teachingRole: user?._id === teacherId ? 'teacher' : 'learner'
      }));
    }
    
    if (skillId) {
      setFormData(prev => ({
        ...prev,
        selectedSkillId: skillId
      }));
    }
    
    // Fetch skills and connections
    fetchSkills();
    fetchConnections();
  }, [matchDetails, teacherId, learnerId, skillId, user?._id, profile]);
  
  // Fetch skills from backend API
  const fetchSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const response = await fetch('/api/skills', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && Array.isArray(data.skills)) {
        setSkills(data.skills);
      } else {
        console.error('Failed to fetch skills:', data.message || 'Unknown error');
        setSkills([]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setIsLoadingSkills(false);
    }
  };
  
  // Fetch user's connections from backend API
  const fetchConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const response = await fetch('/api/users/connections', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && Array.isArray(data.connections)) {
        setConnections(data.connections);
      } else {
        console.error('Failed to fetch connections:', data.message || 'Unknown error');
        setConnections([]);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
    } finally {
      setIsLoadingConnections(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user changes it
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle role change
  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      teachingRole: role
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // First step validation
    if (formStep === 0) {
      if (!formData.selectedUserId) errors.selectedUserId = 'Please select a connection';
      if (!formData.selectedSkillId) errors.selectedSkillId = 'Please select a skill';
      if (!formData.title.trim()) errors.title = 'Title is required';
      if (!formData.description.trim()) errors.description = 'Description is required';
      if (formData.mode === 'in-person' && !formData.location.trim()) {
        errors.location = 'Location is required for in-person sessions';
      }
    }
    
    // Second step validation
    if (formStep === 1) {
      if (!formData.startDate) errors.startDate = 'Date is required';
      if (!formData.startTime) errors.startTime = 'Time is required';
      if (!formData.duration) errors.duration = 'Duration is required';
      
      if (formData.isRecurring) {
        if (!formData.frequency) errors.frequency = 'Frequency is required for recurring sessions';
        if (!formData.interval) errors.interval = 'Interval is required for recurring sessions';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form navigation
  const goToNextStep = () => {
    if (validateForm()) {
      setFormStep(current => current + 1);
    }
  };
  
  const goToPrevStep = () => {
    setFormStep(current => current - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if user is authenticated
    if (!user || !user._id) {
      toast.error('You must be logged in to create a session. Please log in and try again.');
      return;
    }
    
    try {
      // Combine date and time into a single Date object
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + Number(formData.duration) * 60000);
      
      // Determine roles based on selection
      let actualTeacherId, actualLearnerId;
      
      if (formData.teachingRole === 'teacher') {
        actualTeacherId = user._id;
        actualLearnerId = formData.selectedUserId;
      } else {
        actualTeacherId = formData.selectedUserId;
        actualLearnerId = user._id;
      }
      
      // Use selected skill or from match
      const actualSkillId = formData.selectedSkillId || (matchDetails ? matchDetails.skillToLearn : null);
      
      if (!actualSkillId) {
        toast.error('No skill specified for the session');
        return;
      }
      
      // Prepare session data
      const sessionData = {
        otherUserId: formData.selectedUserId,
        userRole: formData.teachingRole,
        skillId: actualSkillId,
        matchId: matchDetails?._id,
        title: formData.title,
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: Number(formData.duration),
        mode: formData.mode,
        location: formData.mode === 'in-person' ? formData.location : null,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.isRecurring ? {
          frequency: formData.frequency,
          interval: parseInt(formData.interval, 10),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
        } : null
      };
      
      // Create the session
      const result = await createSession(sessionData);
      
      if (!result) {
        toast.error('Failed to create session. Please try again.');
        return;
      }
      
      // Reset form and form step
      setFormData({
        title: '',
        description: '',
        mode: 'online',
        startDate: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        startTime: '12:00',
        duration: '60',
        location: '',
        isRecurring: false,
        frequency: 'weekly',
        interval: '1',
        endDate: '',
        selectedUserId: '',
        selectedSkillId: '',
        teachingRole: 'teacher'
      });
      setFormStep(0);
      
      // Call success callback
      if (onSuccess) onSuccess(result);
      
      toast.success('Session scheduled successfully!');
      
      // If Zoom meeting was created, show success message
      if (result.zoomMeeting) {
        toast.success('Zoom meeting link created successfully!');
      }
    } catch (err) {
      console.error('Session creation error:', err);
      
      // Handle specific error codes
      if (err.response) {
        if (err.response.status === 403) {
          toast.error('You don\'t have permission to create a session. Please log in again.');
        } else if (err.response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
        } else {
          toast.error(err.response.data?.message || 'Failed to schedule session');
        }
      } else {
        toast.error('Failed to schedule session. Please check your connection and try again.');
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto border border-gray-100">
        <div className="text-center py-8">
          <h2 className="text-2xl font-medium text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to schedule a session. Please log in or create an account.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-medium text-gray-800 mb-6">Schedule a Session</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 animate-fade-in-up">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {formStep === 0 && (
          <div className="space-y-5">
            {/* Connection selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session With
              </label>
              <div className="relative">
                {isLoadingConnections ? (
                  <div className="flex items-center p-2">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">Loading connections...</span>
                  </div>
                ) : (
                  <select
                    name="selectedUserId"
                    value={formData.selectedUserId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border ${formErrors.selectedUserId ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    disabled={!!matchDetails} // Disable if match details provided
                  >
                    <option value="">Select a connection</option>
                    {connections.map((connection) => (
                      <option key={connection._id} value={connection.user._id}>
                        {connection.user.name}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.selectedUserId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.selectedUserId}</p>
                )}
              </div>
            </div>
            
            {/* Your role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Role
              </label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div 
                  onClick={() => handleRoleChange('teacher')}
                  className={`flex-1 p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                    formData.teachingRole === 'teacher' 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="teachingRole" 
                      checked={formData.teachingRole === 'teacher'} 
                      onChange={() => {}} 
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800">Teacher</p>
                      <p className="text-xs text-gray-500">I will teach the session</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleRoleChange('learner')}
                  className={`flex-1 p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                    formData.teachingRole === 'learner' 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="teachingRole" 
                      checked={formData.teachingRole === 'learner'} 
                      onChange={() => {}} 
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800">Learner</p>
                      <p className="text-xs text-gray-500">I will learn in this session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skill selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill
              </label>
              <div className="relative">
                {isLoadingSkills ? (
                  <div className="flex items-center p-2">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-500">Loading skills...</span>
                  </div>
                ) : (
                  <select
                    name="selectedSkillId"
                    value={formData.selectedSkillId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border ${formErrors.selectedSkillId ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    disabled={!!matchDetails} // Disable if match details provided
                  >
                    <option value="">Select a skill</option>
                    {skills.map((skill) => (
                      <option key={skill._id} value={skill._id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.selectedSkillId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.selectedSkillId}</p>
                )}
              </div>
            </div>
            
            {/* Basic information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${formErrors.title ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                placeholder="e.g., Javascript Basics Introduction"
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2.5 border ${formErrors.description ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                placeholder="Briefly describe what will be covered in this session"
              ></textarea>
              {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${formErrors.mode ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              >
                <option value="online">Online (Zoom)</option>
                <option value="in-person">In-person</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {formErrors.mode && <p className="text-red-500 text-sm mt-1">{formErrors.mode}</p>}
            </div>
            
            {(formData.mode === 'in-person' || formData.mode === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border ${formErrors.location ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  placeholder="e.g., Coffee Shop, Library, etc."
                />
                {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Next
                <svg className="ml-2 -mr-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {formStep === 1 && (
          <div className="space-y-5">
            {/* Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border ${formErrors.startDate ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                {formErrors.startDate && <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border ${formErrors.startTime ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                />
                {formErrors.startTime && <p className="text-red-500 text-sm mt-1">{formErrors.startTime}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border ${formErrors.duration ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
              {formErrors.duration && <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                Recurring session
              </label>
            </div>
            
            {formData.isRecurring && (
              <div className="space-y-4 p-5 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border ${formErrors.frequency ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {formErrors.frequency && <p className="text-red-500 text-sm mt-1">{formErrors.frequency}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval
                  </label>
                  <select
                    name="interval"
                    value={formData.interval}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border ${formErrors.interval ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white`}
                  >
                    <option value="1">Every time (1)</option>
                    <option value="2">Every other time (2)</option>
                    <option value="3">Every 3 times</option>
                    <option value="4">Every 4 times</option>
                  </select>
                  {formErrors.interval && <p className="text-red-500 text-sm mt-1">{formErrors.interval}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            )}
            
            {(formData.mode === 'online' || formData.mode === 'hybrid') && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-700">
                  A Zoom meeting link will be automatically generated when you create this session.
                </p>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={goToPrevStep}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <svg className="mr-2 -ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scheduling...
                  </>
                ) : (
                  <>
                    Schedule Session
                    <svg className="ml-2 -mr-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SessionForm; 