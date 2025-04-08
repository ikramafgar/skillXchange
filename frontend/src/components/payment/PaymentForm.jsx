import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripeStore } from '../../store/stripeStore';
import { useSessionStore } from '../../store/sessionStore';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
import { CreditCard, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { 
  PaymentElement, 
  useStripe, 
  useElements,
  LinkAuthenticationElement
} from '@stripe/react-stripe-js';

const PaymentForm = ({ sessionId, amount }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('initial'); // initial, processing, success, error

  const { confirmPaymentSuccess, isLoading, error } = useStripeStore();
  const { fetchSessions } = useSessionStore();
  
  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsSubmitting(true);
    setPaymentStatus('processing');
    
    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-result`,
          receipt_email: email,
        },
        redirect: 'if_required'
      });
      
      if (submitError) {
        console.error('Payment error:', submitError);
        toast.error(submitError.message || 'Payment failed. Please try again.');
        setPaymentStatus('error');
        return;
      }
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm the payment with our backend
        await confirmPaymentSuccess(sessionId, paymentIntent.id);
        
        // Refresh sessions data
        await fetchSessions();
        
        setPaymentStatus('success');
        toast.success('Payment successful!');
        
        // Redirect after a moment
        setTimeout(() => {
          navigate(`/sessions/${sessionId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('An error occurred during payment processing. Please try again.');
      setPaymentStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle backend errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  // If payment is successful, show success message
  if (paymentStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-6">Your session payment has been processed.</p>
        <button
          onClick={() => navigate(`/sessions/${sessionId}`)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Session Details
        </button>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate(`/sessions/${sessionId}`)}
          className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to session
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Complete your payment</h2>
          <p className="text-gray-600 text-sm">Secure payment processed by Stripe</p>
        </div>
        
        <div className="p-5">
          <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="font-medium text-gray-800 flex items-center">
              <CreditCard className="w-4 h-4 text-blue-500 mr-2" />
              <span>Amount: <span className="text-blue-600">{amount} PKR</span></span>
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <LinkAuthenticationElement 
              onChange={(e) => setEmail(e.value.email)}
              className="mb-4"
            />
            
            <PaymentElement 
              className="mb-6"
              options={{
                layout: {
                  type: 'tabs',
                  defaultCollapsed: false,
                }
              }}
            />
            
            <button
              type="submit"
              disabled={!stripe || isSubmitting || isLoading}
              className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {amount} PKR
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>Your payment is secure and encrypted</p>
      </div>
    </div>
  );
};

PaymentForm.propTypes = {
  sessionId: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired
};

export default PaymentForm; 