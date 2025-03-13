import {create} from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
    role: null, // Add role to initial state
    sessionsTaught: 0, // Add sessionsTaught to initial state
    points: 0, // Add points to initial state
    badges: [], // Add badges to initial state
    coursesEnrolled: 0, // Add coursesEnrolled to initial state
    achievements: [], // Add achievements to initial state
};

const actions = (set) => ({
    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/profile/me`, {
                withCredentials: true, // Include credentials (cookies) in the request
            });
            set({ profile: response.data, role: response.data.role, isLoading: false });
        } catch (error) {
            set({ error: error.response ? error.response.data.message : error.message, isLoading: false });
        }
    },

    updateProfile: async (updatedProfile) => {
        set({ isLoading: true, error: null }); // Reset error state
        try {
            console.log('Sending profile update with data:', JSON.stringify(updatedProfile));
            
            // Create a regular JSON request
            const response = await axios.put(`${API_URL}/profile/update`, updatedProfile, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Profile update response:', response.data);
            
            // Make sure we're storing the complete profile data
            const updatedProfileData = response.data;
            
            // Set the updated profile in the store
            set({ 
                profile: updatedProfileData, 
                role: updatedProfileData.role, 
                isLoading: false 
            });
            
            return updatedProfileData;
        } catch (error) {
            console.error('Error updating profile:', error);
            console.error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    updateProfilePicture: async (file) => {
        set({ isLoading: true });
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            
            const response = await axios.put(`${API_URL}/profile/update-picture`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            set({ profile: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.response ? error.response.data.message : error.message, isLoading: false });
        }
    },

    uploadCertificates: async (files) => {
        set({ isLoading: true });
        try {
            const formData = new FormData();
            
            // Add all certificate files
            for (let i = 0; i < files.length; i++) {
                formData.append('certificates', files[i]);
            }
            
            const response = await axios.put(`${API_URL}/profile/update`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            set({ profile: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.response ? error.response.data.message : error.message, isLoading: false });
        }
    },
    
    uploadExperienceCertificate: async (file) => {
        set({ isLoading: true });
        try {
            const formData = new FormData();
            formData.append('experienceCertificate', file);
            
            const response = await axios.put(`${API_URL}/profile/update`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            set({ profile: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.response ? error.response.data.message : error.message, isLoading: false });
        }
    },

    // Add other actions here
    setEditMode: (editMode) => {
      set({ editMode }); // Action to set editMode
  },

  toggleEditMode: () => {
      set((state) => ({ editMode: !state.editMode })); // Action to toggle editMode
  },

  setRole: (role) => {
      set({ role }); // Action to set role
  },
});

export const useProfileStore = create((set, get) => ({
    ...initialState,
    ...actions(set, get),
}));