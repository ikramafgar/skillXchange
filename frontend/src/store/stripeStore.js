import { create } from 'zustand';
import customAxios from '../utils/axios';

const initialState = {
  paymentIntent: null,
  clientSecret: null,
  isLoading: false,
  error: null,
  paymentSuccess: false,
};

export const useStripeStore = create((set) => ({
  ...initialState,
  
  // Create a payment intent for a session
  createPaymentIntent: async (sessionId) => {
    console.log('[StripeStore] Creating payment intent for session:', sessionId);
    set({ isLoading: true, error: null, paymentSuccess: false });
    try {
      const response = await customAxios.post(`/api/payments/create-intent`, {
        sessionId
      });
      
      console.log('[StripeStore] Payment intent created:', {
        id: response.data.paymentIntent?.id,
        amount: response.data.paymentIntent?.amount,
        status: response.data.paymentIntent?.status
      });
      
      set({
        paymentIntent: response.data.paymentIntent,
        clientSecret: response.data.clientSecret,
        isLoading: false
      });
      
      return response.data;
    } catch (error) {
      console.error('[StripeStore] Error creating payment intent:', error);
      console.error('[StripeStore] Error details:', error.response?.data);
      set({
        error: error.response?.data?.message || 'Failed to create payment intent',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Confirm payment success
  confirmPaymentSuccess: async (sessionId, paymentIntentId) => {
    console.log('[StripeStore] Confirming payment success for session:', { sessionId, paymentIntentId });
    set({ isLoading: true, error: null });
    try {
      const response = await customAxios.post(`/api/payments/confirm`, {
        sessionId,
        paymentIntentId
      });
      
      console.log('[StripeStore] Payment confirmed successfully:', response.data);
      
      set({
        paymentSuccess: true,
        isLoading: false
      });
      
      return response.data;
    } catch (error) {
      console.error('[StripeStore] Error confirming payment:', error);
      console.error('[StripeStore] Error details:', error.response?.data);
      set({
        error: error.response?.data?.message || 'Failed to confirm payment',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Reset the payment state
  resetPaymentState: () => {
    console.log('[StripeStore] Resetting payment state');
    set(initialState);
  },
  
  // Clear error
  clearError: () => {
    console.log('[StripeStore] Clearing errors');
    set({ error: null });
  }
})); 