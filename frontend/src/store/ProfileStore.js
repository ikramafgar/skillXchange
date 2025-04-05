import {create} from 'zustand';
import customAxios from '../utils/axios';

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
    hourlyRate: 0, // Add hourlyRate to initial state
    learningBudget: 0, // Add learningBudget to initial state
};

const actions = (set, get) => ({
    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log('Fetching profile from: /api/profile/me');
            
            const response = await customAxios.get('/api/profile/me', {
                timeout: 10000 // 10 second timeout
            });
            
            console.log('Profile data received:', response.data);
            set({ profile: response.data, role: response.data.role, isLoading: false });
        } catch (error) {
            console.error('Error fetching profile:', error);
            let errorMessage = 'Failed to load profile';
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                errorMessage = error.message;
            }
            
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    updateProfile: async (updatedProfile) => {
        set({ isLoading: true, error: null }); // Reset error state
        try {
            console.log('Sending profile update with data:', JSON.stringify(updatedProfile));
            
            // Create a regular JSON request
            const response = await customAxios.put('/api/profile/update', updatedProfile);
            
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
        set({ isLoading: true, error: null });
        try {
            console.log('Uploading profile picture:', file.name, 'Size:', file.size);
            
            // Validate file
            if (!file || file.size === 0) {
                throw new Error('Invalid file selected');
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size exceeds 5MB limit');
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Only image files are allowed');
            }
            
            // Get the current profile state to preserve role
            const currentState = get();
            const currentRole = currentState.profile?.role || 'teacher';
            console.log('Current role before profile picture upload:', currentRole);
            
            const formData = new FormData();
            formData.append('profilePicture', file);
            
            // Explicitly add the current role to ensure it's preserved
            formData.append('role', currentRole);
            
            const response = await customAxios.put('/api/profile/update-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                // Add timeout and show upload progress
                timeout: 30000,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            });
            
            console.log('Profile picture upload response:', response.data);
            
            // Make sure we preserve the role if it's missing in the response
            const updatedProfileData = {
                ...response.data,
                role: response.data.role || currentRole
            };
            
            set({ 
                profile: updatedProfileData, 
                role: updatedProfileData.role, 
                isLoading: false 
            });
            
            return updatedProfileData; // Return the response data for promise chaining
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile picture';
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for promise chaining
        }
    },

    uploadCertificates: async (files) => {
        set({ isLoading: true, error: null });
        try {
            console.log(`Uploading ${files.length} certificates`);
            
            // Validate files
            if (!files || files.length === 0) {
                throw new Error('No files selected');
            }
            
            // Get the current profile state to preserve role
            const currentState = get();
            const currentProfile = currentState.profile;
            const currentRole = currentProfile?.role || 'teacher';
            
            console.log('Current role before upload:', currentRole);
            
            const formData = new FormData();
            
            // Explicitly add the current role to ensure it's preserved
            if (currentRole) {
                formData.append('role', currentRole);
            }
            
            // Add all certificate files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`File ${file.name} exceeds 5MB limit`);
                }
                
                // Check file type
                if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                    throw new Error(`File ${file.name} is not an image or PDF`);
                }
                
                console.log(`Adding certificate: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
                formData.append('certificates', file);
            }
            
            const response = await customAxios.put('/api/profile/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                // Add timeout and show upload progress
                timeout: 60000,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            });
            
            console.log('Certificates upload response:', response.data);
            
            // Check if the role was changed in the response
            if (response.data.role !== currentRole) {
                console.log(`Role changed from ${currentRole} to ${response.data.role}. Fixing...`);
                
                // Make a separate API call to update just the role
                const roleUpdateResponse = await customAxios.put('/api/profile/update', {
                    role: currentRole
                });
                
                console.log('Role update response:', roleUpdateResponse.data);
                
                // Use the updated profile data with the correct role
                const updatedProfileData = roleUpdateResponse.data;
                
                set({ 
                    profile: updatedProfileData, 
                    role: updatedProfileData.role, 
                    isLoading: false 
                });
                
                return updatedProfileData;
            } else {
                // Role was preserved, use the response data directly
                set({ 
                    profile: response.data, 
                    role: response.data.role, 
                    isLoading: false 
                });
                
                return response.data;
            }
        } catch (error) {
            console.error('Error uploading certificates:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload certificates';
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for promise chaining
        }
    },
    
    uploadExperienceCertificate: async (file) => {
        set({ isLoading: true, error: null });
        try {
            console.log('Uploading experience certificate:', file.name, 'Size:', file.size);
            
            // Validate file
            if (!file || file.size === 0) {
                throw new Error('Invalid file selected');
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size exceeds 5MB limit');
            }
            
            // Check file type
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                throw new Error('Only image or PDF files are allowed');
            }
            
            // Get the current profile state to preserve role
            const currentState = get();
            const currentProfile = currentState.profile;
            const currentRole = currentProfile?.role || 'teacher';
            
            console.log('Current role before upload:', currentRole);
            
            const formData = new FormData();
            formData.append('experienceCertificate', file);
            
            // Explicitly add the current role to ensure it's preserved
            if (currentRole) {
                formData.append('role', currentRole);
            }
            
            const response = await customAxios.put('/api/profile/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                // Add timeout and show upload progress
                timeout: 30000,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            });
            
            console.log('Experience certificate upload response:', response.data);
            
            // Check if the role was changed in the response
            if (response.data.role !== currentRole) {
                console.log(`Role changed from ${currentRole} to ${response.data.role}. Fixing...`);
                
                // Make a separate API call to update just the role
                const roleUpdateResponse = await customAxios.put('/api/profile/update', {
                    role: currentRole
                });
                
                console.log('Role update response:', roleUpdateResponse.data);
                
                // Use the updated profile data with the correct role
                const updatedProfileData = roleUpdateResponse.data;
                
                set({ 
                    profile: updatedProfileData, 
                    role: updatedProfileData.role, 
                    isLoading: false 
                });
                
                return updatedProfileData;
            } else {
                // Role was preserved, use the response data directly
                set({ 
                    profile: response.data, 
                    role: response.data.role, 
                    isLoading: false 
                });
                
                return response.data;
            }
        } catch (error) {
            console.error('Error uploading experience certificate:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload experience certificate';
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for promise chaining
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