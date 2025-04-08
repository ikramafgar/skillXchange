import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStripeStore } from '../store/stripeStore';
import { useSessionStore } from '../store/sessionStore';
import { useAuthStore } from '../store/authStore';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../components/payment/PaymentForm';
import { toast } from 'react-hot-toast';

// Preload the Stripe promise
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  
  const { createPaymentIntent, isLoading: stripeLoading, error: stripeError, resetPaymentState } = useStripeStore();
  const { fetchSessionById } = useSessionStore();
  const { isAuthenticated, user } = useAuthStore();
  
  // Check authentication status first
  useEffect(() => {
    // If not authenticated, the ProtectedRoute component will handle redirection
    if (!isAuthenticated || !user) {
      console.log("[PaymentPage] User not authenticated");
      return;
    }
    
    console.log("[PaymentPage] User authenticated:", user._id);
  }, [isAuthenticated, user]);
  
  // Debug log the sessionId from URL params
  useEffect(() => {
    console.log("[PaymentPage] Session ID from URL:", sessionId);
    console.log("[PaymentPage] Session ID from localStorage:", localStorage.getItem('current_payment_session'));
    
    // If no sessionId in URL but available in localStorage, use that
    if (!sessionId && localStorage.getItem('current_payment_session')) {
      const storedSessionId = localStorage.getItem('current_payment_session');
      console.log("[PaymentPage] Redirecting to use stored session ID:", storedSessionId);
      navigate(`/payment/${storedSessionId}`);
    }
  }, [sessionId, navigate]);
  
  useEffect(() => {
    if (!sessionId || !isAuthenticated) return;
    
    // Reset payment state when component mounts
    resetPaymentState();
    
    // Fetch the session details
    const getSessionDetails = async () => {
      try {
        console.log("[PaymentPage] Fetching session details for ID:", sessionId);
        const sessionData = await fetchSessionById(sessionId);
        console.log("[PaymentPage] Session data received:", sessionData);
        
        // Check if session is valid for payment
        if (sessionData.status !== 'scheduled') {
          console.error("[PaymentPage] Invalid session status:", sessionData.status);
          toast.error('This session is not available for payment.');
          navigate('/sessions');
          return;
        }
        
        if (sessionData.isPaid) {
          console.log("[PaymentPage] Session is already paid");
          toast.success('This session is already paid for.');
          navigate(`/sessions/${sessionId}`);
          return;
        }
        
        if (sessionData.price <= 0) {
          console.error("[PaymentPage] Session price is zero or negative:", sessionData.price);
          toast.error('This is a free session and does not require payment.');
          navigate(`/sessions/${sessionId}`);
          return;
        }
        
        setSessionDetails(sessionData);
        
        // Create a payment intent
        console.log("[PaymentPage] Creating payment intent for session:", sessionId);
        const paymentData = await createPaymentIntent(sessionId);
        console.log("[PaymentPage] Payment intent created:", paymentData);
        setClientSecret(paymentData.clientSecret);
        
      } catch (error) {
        console.error('[PaymentPage] Error fetching session or creating payment intent:', error);
        toast.error('Failed to initialize payment. Please try again.');
        navigate('/sessions');
      }
    };
    
    getSessionDetails();
  }, [sessionId, fetchSessionById, createPaymentIntent, navigate, resetPaymentState, isAuthenticated]);
  
  // Handle errors
  useEffect(() => {
    if (stripeError) {
      console.error("[PaymentPage] Stripe error:", stripeError);
      toast.error(stripeError);
    }
  }, [stripeError]);
  
  // Show loading state
  if (stripeLoading || !sessionDetails || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4 "></div>
          <p className="text-gray-600">Preparing payment...</p>
        </div>
      </div>
    );
  }
  
  // Debug log the session details
  console.log("[PaymentPage] Ready to display payment form with session:", sessionDetails);
  
  // Stripe appearance customization
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4f46e5',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };
  
  // Stripe Element options
  const options = {
    clientSecret,
    appearance,
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Session Payment</h1>
          <p className="text-gray-600">
            {sessionDetails.title} with {sessionDetails.teacher?.name}
          </p>
        </div>
        
        {clientSecret && (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm 
              sessionId={sessionId} 
              amount={sessionDetails.price} 
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PaymentPage; 