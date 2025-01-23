import {create} from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
};

const actions = (set) => ({
    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/profile`, {
                withCredentials: true, // Include credentials (cookies) in the request
            });
            set({ profile: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.response ? error.response.data.message : error.message, isLoading: false });
        }
    },

    updateProfile: async (updatedProfile) => {
        set({ isLoading: true });
        try {
            const response = await axios.put(`${API_URL}/profile`, updatedProfile, {
                withCredentials: true, // Include credentials (cookies) in the request
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
});

export const useProfileStore = create((set, get) => ({
    ...initialState,
    ...actions(set, get),
}));