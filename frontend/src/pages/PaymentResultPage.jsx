import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStripeStore } from '../store/stripeStore';
import { useSessionStore } from '../store/sessionStore';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

// Preload the Stripe promise
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, failure, unknown
  const [sessionId, setSessionId] = useState(null);
  
  const { confirmPaymentSuccess } = useStripeStore();
  const { fetchSessions } = useSessionStore();
  
  useEffect(() => {
    const verifyPayment = async () => {
      // Get payment_intent and payment_intent_client_secret from URL
      const paymentIntentId = searchParams.get('payment_intent');
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
      const redirectStatus = searchParams.get('redirect_status');
      
      console.log('[PaymentResultPage] URL Parameters:', { 
        paymentIntentId, 
        redirectStatus 
      });
      
      // Get session ID from localStorage (stored during payment initiation)
      const storedSessionId = localStorage.getItem('current_payment_session');
      console.log('[PaymentResultPage] Session ID from localStorage:', storedSessionId);
      setSessionId(storedSessionId);
      
      if (!paymentIntentId || !paymentIntentClientSecret) {
        console.error('[PaymentResultPage] Missing payment parameters');
        setStatus('unknown');
        toast.error('Invalid payment information');
        return;
      }
      
      if (redirectStatus !== 'succeeded') {
        console.error('[PaymentResultPage] Payment not successful, status:', redirectStatus);
        setStatus('failure');
        toast.error('Payment was not successful');
        return;
      }
      
      try {
        if (storedSessionId) {
          console.log('[PaymentResultPage] Confirming payment with backend', { 
            sessionId: storedSessionId, 
            paymentIntentId 
          });
          
          // Confirm the payment with our backend
          await confirmPaymentSuccess(storedSessionId, paymentIntentId);
          
          // Refresh sessions data
          await fetchSessions();
          
          setStatus('success');
          toast.success('Payment successful!');
          
          // Clear the stored session ID
          localStorage.removeItem('current_payment_session');
          console.log('[PaymentResultPage] Payment confirmed and session ID cleared from localStorage');
        } else {
          console.error('[PaymentResultPage] No session ID found in localStorage');
          setStatus('unknown');
          toast.error('Session information not found');
        }
      } catch (error) {
        console.error('[PaymentResultPage] Error confirming payment:', error);
        setStatus('failure');
        toast.error('Failed to confirm payment with server');
      }
    };
    
    verifyPayment();
  }, [searchParams, confirmPaymentSuccess, fetchSessions]);
  
  const handleBackToSession = () => {
    if (sessionId) {
      console.log('[PaymentResultPage] Navigating to session detail:', sessionId);
      navigate(`/sessions/${sessionId}`);
    } else {
      console.log('[PaymentResultPage] No session ID, navigating to sessions list');
      navigate('/sessions');
    }
  };
  
  const handleBackToSessions = () => {
    console.log('[PaymentResultPage] Navigating to sessions list');
    navigate('/sessions');
  };
  
  console.log('[PaymentResultPage] Current payment status:', status);
  
  // Render based on payment status
  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h3>
            <p className="text-gray-600 mb-6">Please wait while we verify your payment...</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">Your session payment has been processed.</p>
            <button
              onClick={handleBackToSession}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Session Details
            </button>
          </div>
        );
        
      case 'failure':
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">Your payment could not be processed. Please try again.</p>
            <div className="flex gap-4">
              <button
                onClick={handleBackToSession}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToSessions}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Sessions
              </button>
            </div>
          </div>
        );
        
      case 'unknown':
      default:
        return (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Status Unknown</h3>
            <p className="text-gray-600 mb-6">We couldn&apos;t determine the status of your payment.</p>
            <div className="flex gap-4">
              <button
                onClick={handleBackToSessions}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View All Sessions
              </button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex justify-start">
          <button 
            onClick={handleBackToSessions}
            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sessions
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage; 