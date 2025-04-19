import { create } from "zustand";
import customAxios from "../utils/axios";

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	isAdmin: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,
	token: null,


	signup: async (name, email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await customAxios.post(`/api/auth/signup`, { name, email, password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
			throw error;
		}
	},
	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await customAxios.post(`/api/auth/login`, { email, password });
			set({ 
				user: response.data.user, 
				isAuthenticated: true,
				isAdmin: response.data.user.isAdmin || false,
				isLoading: false,
				error: null
			});
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error logging in", 
				isLoading: false 
			});
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await customAxios.post(`/api/auth/logout`);
			set({ user: null, isAuthenticated: false, isAdmin: false, error: null, isLoading: false, token: null });
			window.location.href = "/";
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},

	updateName: async (name) => {
		set({ isLoading: true, error: null });
		try {
			const response = await customAxios.put(`/api/auth/update-name`, { name });
			set({ 
				user: response.data.user, 
				isLoading: false,
				error: null
			});
			return response.data;
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error updating name", 
				isLoading: false 
			});
			throw error;
		}
	},

	deleteAccount: async (password) => {
		set({ isLoading: true, error: null });
		try {
			await customAxios.delete('/api/auth/delete-account', { 
				data: { password } 
			});
			
			// Clear auth state
			set({ 
				user: null, 
				isAuthenticated: false, 
				isAdmin: false, 
				error: null, 
				isLoading: false, 
				token: null 
			});
			
			// Redirect to home page with success message
			window.location.href = "/?accountDeleted=true";
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error deleting account", 
				isLoading: false 
			});
			throw error;
		}
	},

	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await customAxios.post(`/api/auth/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
		  const response = await customAxios.get(`/api/auth/check-auth`);
		  if (response.data && response.data.user) {
		    set({
			  user: response.data.user,
			  isAuthenticated: true,
			  isAdmin: response.data.user.isAdmin || false,
			  token: response.data.token || null,
			  isCheckingAuth: false,
			  error: null
		    });
		    return response.data.user;
		  } else {
		    throw new Error('Invalid response from server');
		  }
		} catch (error) {
		  console.error('Check auth error:', error);
		  set({
			isAuthenticated: false,
			isAdmin: false,
			user: null,
			token: null,
			isCheckingAuth: false,
			error: error.message || 'Authentication check failed'
		  });
		  throw error;
		}
	},
	
	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await customAxios.post(`/api/auth/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await customAxios.post(`/api/auth/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
	googleLogin: async (credential) => {
		set({ isLoading: true, error: null });
		try {
			const response = await customAxios.post(`/api/auth/google-login`, { credential });
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error logging in with Google", 
				isLoading: false 
			});
			throw error;
		}
	},
}));