import { create } from 'zustand';
import customAxios from '../utils/axios';

const initialState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  zoomMeetingDetails: null
};

export const useSessionStore = create((set, get) => ({
  ...initialState,
  
  // Fetch all sessions for the logged-in user
  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await customAxios.get('/api/sessions');
      
      // Store the sessions data
      set({ 
        sessions: response.data, 
        isLoading: false 
      });
      
      // If there's a currentSession, update its zoom meeting details
      if (get().currentSession) {
        const matchingSession = response.data.find(session => session._id === get().currentSession._id);
        if (matchingSession && matchingSession.meetingLink) {
          set({ 
            zoomMeetingDetails: { joinUrl: matchingSession.meetingLink } 
          });
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch sessions', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Get a specific session by ID
  fetchSessionById: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customAxios.get(`/api/sessions/${sessionId}`);
      // Store the meeting link from the session model
      set({ 
        currentSession: response.data,
        zoomMeetingDetails: response.data.meetingLink ? { joinUrl: response.data.meetingLink } : null,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching session:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch session', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Create a new session
  createSession: async (sessionData) => {
    set({ isLoading: true, error: null });
    try {
    
      
      // Try both endpoints to see which works
      let response;
      try {
        response = await customAxios.post('/api/sessions', sessionData);
      } catch  {
        response = await customAxios.post('/api/sessions/create', sessionData);
      }
      
      console.log('Session creation response:', response.data);
      
      const sessionObj = response.data.session;
      let zoomDetails = response.data.zoomMeeting;
      
      // If no zoom details but the session has a meeting link, create a simple object
      if (!zoomDetails && sessionObj && sessionObj.meetingLink) {
        zoomDetails = { joinUrl: sessionObj.meetingLink };
      }
      
      // Add the new session to the sessions array
      set(state => ({ 
        sessions: [...state.sessions, sessionObj], 
        currentSession: sessionObj,
        zoomMeetingDetails: zoomDetails,
        isLoading: false 
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      set({ 
        error: error.response?.data?.message || 'Failed to create session', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Update an existing session
  updateSession: async (sessionId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customAxios.put(`/api/sessions/${sessionId}`, updateData);
      
      // Check if the updated session has a meeting link
      const updatedSession = response.data;
      const meetingLink = updatedSession.meetingLink;
      
      // Update the session in the sessions array
      set(state => {
        // If the session has a meeting link, update zoomMeetingDetails
        const newZoomDetails = meetingLink ? 
          { joinUrl: meetingLink } : 
          state.currentSession?._id === sessionId ? state.zoomMeetingDetails : null;
        
        return {
          sessions: state.sessions.map(session => 
            session._id === sessionId ? updatedSession : session
          ),
          currentSession: updatedSession,
          zoomMeetingDetails: newZoomDetails,
          isLoading: false
        };
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update session', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Change session status (e.g., cancel, complete, reschedule)
  changeSessionStatus: async (sessionId, status, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customAxios.put(`/api/sessions/${sessionId}/status`, { status, reason });
      
      // Check if the updated session has a meeting link
      const updatedSession = response.data;
      const meetingLink = updatedSession.meetingLink;
      
      // Update the session in the sessions array
      set(state => {
        // Preserve zoom meeting details if they exist, or create new ones from meeting link
        const newZoomDetails = meetingLink ? 
          { joinUrl: meetingLink } : 
          (state.currentSession?._id === sessionId ? state.zoomMeetingDetails : null);
          
        return {
          sessions: state.sessions.map(session => 
            session._id === sessionId ? updatedSession : session
          ),
          currentSession: state.currentSession?._id === sessionId ? updatedSession : state.currentSession,
          zoomMeetingDetails: newZoomDetails,
          isLoading: false
        };
      });
      
      return response.data;
    } catch (error) {
      console.error('Error changing session status:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to change session status', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Submit feedback for a session
  submitFeedback: async (sessionId, feedbackData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customAxios.post(`/api/sessions/${sessionId}/feedback`, feedbackData);
      
      // Check if the updated session has a meeting link
      const updatedSession = response.data;
      const meetingLink = updatedSession.meetingLink;
      
      // Update the session in the sessions array
      set(state => {
        // Preserve zoom meeting details if they exist, or create new ones from meeting link
        const newZoomDetails = meetingLink ? 
          { joinUrl: meetingLink } : 
          (state.currentSession?._id === sessionId ? state.zoomMeetingDetails : null);
          
        return {
          sessions: state.sessions.map(session => 
            session._id === sessionId ? updatedSession : session
          ),
          currentSession: state.currentSession?._id === sessionId ? updatedSession : state.currentSession,
          zoomMeetingDetails: newZoomDetails,
          isLoading: false
        };
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to submit feedback', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Generate a new Zoom meeting link for a session
  regenerateZoomLink: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customAxios.post(`/api/sessions/${sessionId}/regenerate-zoom`);
      
      // Update the session with the new meeting link
      set(state => ({
        sessions: state.sessions.map(session => 
          session._id === sessionId ? response.data.session : session
        ),
        currentSession: state.currentSession?._id === sessionId ? response.data.session : state.currentSession,
        zoomMeetingDetails: response.data.zoomMeeting || (response.data.session.meetingLink ? { joinUrl: response.data.session.meetingLink } : null),
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error regenerating Zoom link:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to regenerate Zoom link', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Clear current session
  clearCurrentSession: () => {
    set({ currentSession: null });
  },
  
  // Clear errors
  clearError: () => {
    set({ error: null });
  },
  
  // Reset the store to initial state
  resetStore: () => {
    set(initialState);
  }
})); 