import { create } from 'zustand';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

export const useMatchStore = create((set, get) => ({
  matches: [],
  isLoading: false,
  error: null,
  
  // Get matches for the current user
  getMatches: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      // If userId is provided, use it in the URL, otherwise use the authenticated user endpoint
      const url = userId ? `/api/matches/user/${userId}` : '/api/matches/user';
      
      const response = await axios.get(url);
      
      set({ 
        matches: response.data,
        isLoading: false 
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      
      set({ 
        error: error.response?.data?.message || 'Failed to fetch matches',
        isLoading: false 
      });
      
      toast.error(error.response?.data?.message || 'Failed to fetch matches', {
        position: 'top-center',
        duration: 3000
      });
      
      return [];
    }
  },
  
  // Generate matches for the current user
  generateMatches: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      // If userId is provided, use it in the URL, otherwise use the authenticated user endpoint
      const url = userId ? `/api/matches/generate/${userId}` : '/api/matches/generate';
      
      // Make the API call
      const response = await axios.post(url);
      
      // Check if matches were returned
      if (response.data && response.data.matches) {
        set({ 
          matches: response.data.matches,
          isLoading: false 
        });
        
        return response.data.matches;
      } else {
        // If no matches property in response
        set({ 
          matches: [],
          isLoading: false,
          error: 'No matches found'
        });
        
        return [];
      }
    } catch (error) {
      console.error('Error generating matches:', error);
      
      // Set error state
      set({ 
        error: error.response?.data?.message || 'Failed to generate matches',
        isLoading: false,
        matches: []
      });
      
      // Rethrow the error so the component can handle it
      throw error;
    }
  },
  
  // Update match status
  updateMatchStatus: async (matchId, status) => {
    try {
      const response = await axios.put(`/api/matches/status/${matchId}`, { status });
      
      // Update the match in the store
      set(state => ({
        matches: state.matches.map(match => 
          match._id === matchId ? response.data : match
        )
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error updating match status:', error);
      
      toast.error(error.response?.data?.message || 'Failed to update match status', {
        position: 'top-center',
        duration: 3000
      });
      
      return null;
    }
  },
  
  // Submit feedback for a match
  submitMatchFeedback: async (matchId, feedback) => {
    try {
      const response = await axios.post(`/api/matches/feedback/${matchId}`, feedback);
      
      // Update the match in the store
      set(state => ({
        matches: state.matches.map(match => 
          match._id === matchId ? response.data : match
        )
      }));
      
      toast.success('Feedback submitted successfully!', {
        position: 'top-center',
        duration: 3000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting match feedback:', error);
      
      toast.error(error.response?.data?.message || 'Failed to submit feedback', {
        position: 'top-center',
        duration: 3000
      });
      
      return null;
    }
  },
  
  // Filter matches by type
  filterMatchesByType: (type) => {
    const { matches } = get();
    
    if (!type || type === 'all') {
      return matches;
    }
    
    return matches.filter(match => match.matchType === type);
  },
  
  // Get top matches (highest score)
  getTopMatches: (limit = 5) => {
    const { matches } = get();
    
    return [...matches]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
  
  // Clear matches
  clearMatches: () => {
    set({ matches: [], error: null });
  }
})); 