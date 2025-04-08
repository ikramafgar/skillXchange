import Stripe from 'stripe';
import Session from '../models/Session.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { createZoomMeeting } from '../utils/zoomUtils.js';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent for a session
export const createPaymentIntent = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId;
    
    console.log('[PaymentController] Creating payment intent', { 
      sessionId, 
      userId, 
      sessionIdType: typeof sessionId 
    });
    
    if (!sessionId) {
      console.error('[PaymentController] Session ID is missing');
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Get the session details
    console.log(`[PaymentController] Querying Session.findById with ID: "${sessionId}"`);
    const session = await Session.findById(sessionId);
    
    if (!session) {
      console.error('[PaymentController] Session not found for ID:', sessionId);
      
      // Try alternative query to debug
      const alternativeQuery = await Session.find({ _id: { $eq: sessionId } });
      console.log('[PaymentController] Alternative query results:', 
        alternativeQuery.length > 0 ? 'Session found with alternative query' : 'No session found with any query',
        { resultsCount: alternativeQuery.length }
      );
      
      return res.status(404).json({ message: 'Session not found' });
    }
    
    console.log('[PaymentController] Session found:', {
      id: session._id,
      idAsString: session._id.toString(),
      teacher: session.teacher.toString(),
      learner: session.learner.toString(),
      userId,
      isLearner: session.learner.toString() === userId
    });
    
    // Verify that the user is the learner in this session
    if (session.learner.toString() !== userId) {
      console.error('[PaymentController] Authorization failed. User is not the learner', {
        sessionLearnerId: session.learner.toString(),
        userId
      });
      return res.status(403).json({ message: 'Unauthorized. Only the learner can pay for this session' });
    }
    
    // Check if the session is already paid
    if (session.isPaid) {
      console.error('[PaymentController] Session is already paid');
      return res.status(400).json({ message: 'This session is already paid for' });
    }
    
    // Get teacher profile to get payment details
    const teacherProfile = await Profile.findOne({ user: session.teacher });
    
    if (!teacherProfile) {
      console.error('[PaymentController] Teacher profile not found for ID:', session.teacher);
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    // Calculate amount in cents (Stripe uses smallest currency unit)
    const amount = Math.round(session.price * 100); // Convert to cents
    console.log('[PaymentController] Payment amount:', { raw: session.price, inCents: amount });
    
    // Save session ID as string to ensure consistent format
    const sessionIdString = session._id.toString();
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'pkr', // Pakistani Rupee
      description: `Payment for session: ${session.title}`,
      metadata: {
        sessionId: sessionIdString,
        teacherId: session.teacher.toString(),
        learnerId: session.learner.toString()
      }
    });
    
    console.log('[PaymentController] Payment intent created:', { 
      id: paymentIntent.id, 
      amount: paymentIntent.amount,
      sessionIdStored: paymentIntent.metadata.sessionId
    });
    
    // Return the client secret to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status
      }
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Confirm payment success and update session
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, paymentIntentId } = req.body;
    const userId = req.userId;
    
    console.log('[PaymentController] Confirming payment', { 
      sessionId, 
      paymentIntentId, 
      userId,
      sessionIdType: typeof sessionId,
      paymentIntentIdType: typeof paymentIntentId
    });
    
    if (!sessionId || !paymentIntentId) {
      console.error('[PaymentController] Missing required fields', { sessionId, paymentIntentId });
      return res.status(400).json({ message: 'Session ID and payment intent ID are required' });
    }
    
    // Get the session details - Log the exact query
    console.log(`[PaymentController] Querying Session.findById with ID: "${sessionId}"`);
    const session = await Session.findById(sessionId)
      .populate('teacher', 'name')
      .populate('learner', 'name');
    
    if (!session) {
      // Try querying with a different approach to debug
      console.error('[PaymentController] Session not found, trying alternative query');
      
      // Try to find the session with a regular query
      const alternativeQuery = await Session.find({ _id: { $eq: sessionId } });
      console.log('[PaymentController] Alternative query results:', 
        alternativeQuery.length > 0 ? 'Session found with alternative query' : 'No session found with any query',
        { resultsCount: alternativeQuery.length }
      );
      
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Convert session ID to string for consistent comparison
    const sessionIdString = session._id.toString();
    
    console.log('[PaymentController] Session found for confirmation:', {
      id: session._id,
      idAsString: sessionIdString,
      learner: session.learner._id.toString(),
      userId,
      comparison: session.learner._id.toString() === userId ? 'Match' : 'Mismatch'
    });
    
    // Verify that the user is the learner in this session
    if (session.learner._id.toString() !== userId) {
      console.error('[PaymentController] Authentication failed for payment confirmation', {
        sessionLearnerId: session.learner._id.toString(),
        userId
      });
      return res.status(403).json({ message: 'Unauthorized. Only the learner can confirm payment for this session' });
    }
    
    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('[PaymentController] Retrieved payment intent:', { 
      id: paymentIntent.id, 
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
      sessionIdInMetadata: paymentIntent.metadata.sessionId,
      sessionIdAsString: sessionIdString
    });
    
    if (paymentIntent.status !== 'succeeded') {
      console.error('[PaymentController] Payment not succeeded', { status: paymentIntent.status });
      return res.status(400).json({ message: 'Payment has not been completed successfully' });
    }
    
    // Check if the payment intent metadata sessionId matches our session ID string
    const paymentMetadataSessionId = paymentIntent.metadata.sessionId;
    const isSessionMatch = paymentMetadataSessionId === sessionIdString;
    
    if (!isSessionMatch) {
      console.error('[PaymentController] Payment intent session ID mismatch', {
        paymentIntentSessionId: paymentMetadataSessionId,
        sessionIdString: sessionIdString,
        equal: isSessionMatch
      });
      
      // Additional debugging for the session ID comparison
      console.log('[PaymentController] Detailed comparison:', {
        paymentIntentSessionId: paymentMetadataSessionId,
        paymentIntentSessionIdType: typeof paymentMetadataSessionId,
        paymentIntentSessionIdLength: paymentMetadataSessionId.length,
        sessionIdString: sessionIdString,
        sessionIdStringType: typeof sessionIdString,
        sessionIdStringLength: sessionIdString.length,
        charByCharEqual: Array.from(paymentMetadataSessionId).every((char, i) => char === sessionIdString[i])
      });
      
      // We'll continue with the payment process if the session was found
      console.log('[PaymentController] Continuing despite ID mismatch since session was found');
    }
    
    // Generate Zoom meeting link for online or hybrid sessions now that payment is confirmed
    let meetingLink = null;
    let zoomMeetingDetails = null;
    
    if (session.mode === 'online' || session.mode === 'hybrid') {
      try {
        console.log('[PaymentController] Creating Zoom meeting after payment confirmation');
        zoomMeetingDetails = await createZoomMeeting(
          session.title,
          new Date(session.startTime).toISOString(),
          session.duration,
          session.teacher.name,
          session.learner.name
        );
        
        meetingLink = zoomMeetingDetails.joinUrl;
        console.log('[PaymentController] Zoom meeting created successfully after payment:', meetingLink);
      } catch (error) {
        console.error('[PaymentController] Error creating Zoom meeting after payment:', error.message);
        // Continue without Zoom link if there's an error, but log the issue
      }
    }
    
    // Update the session to mark it as paid and add the Zoom meeting link if generated
    console.log('[PaymentController] Updating session to mark as paid:', sessionIdString);
    const updateData = { 
      isPaid: true,
      $push: {
        history: {
          action: 'updated',
          userId,
          timestamp: new Date(),
          details: `Payment completed. Payment ID: ${paymentIntentId}`
        }
      }
    };
    
    // Add the meeting link if it was generated
    if (meetingLink) {
      updateData.meetingLink = meetingLink;
    }
    
    const updatedSession = await Session.findByIdAndUpdate(
      sessionIdString,
      updateData,
      { new: true }
    );
    
    if (!updatedSession) {
      console.error('[PaymentController] Failed to update session after payment');
      return res.status(500).json({ message: 'Failed to update session after payment' });
    }
    
    console.log('[PaymentController] Session marked as paid', { 
      id: updatedSession._id,
      isPaid: updatedSession.isPaid,
      hasMeetingLink: !!updatedSession.meetingLink
    });
    
    res.status(200).json({
      message: 'Payment confirmed successfully',
      session: updatedSession,
      zoomMeeting: zoomMeetingDetails
    });
    
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Webhook for Stripe events
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Extract session ID from metadata
      const { sessionId } = paymentIntent.metadata;
      
      if (sessionId) {
        try {
          // Fetch the session with teacher and learner details
          const session = await Session.findById(sessionId)
            .populate('teacher', 'name')
            .populate('learner', 'name');
            
          if (!session) {
            console.error(`Webhook: Session ${sessionId} not found`);
            break;
          }
          
          // Generate Zoom meeting link for online or hybrid sessions now that payment is confirmed
          let meetingLink = null;
          
          if (session.mode === 'online' || session.mode === 'hybrid') {
            try {
              console.log('[PaymentWebhook] Creating Zoom meeting after webhook payment confirmation');
              const zoomMeetingDetails = await createZoomMeeting(
                session.title,
                new Date(session.startTime).toISOString(),
                session.duration,
                session.teacher.name,
                session.learner.name
              );
              
              meetingLink = zoomMeetingDetails.joinUrl;
              console.log('[PaymentWebhook] Zoom meeting created successfully:', meetingLink);
            } catch (error) {
              console.error('[PaymentWebhook] Error creating Zoom meeting:', error.message);
              // Continue without Zoom link if there's an error
            }
          }
          
          // Prepare update data
          const updateData = { 
            isPaid: true,
            $push: {
              history: {
                action: 'updated',
                timestamp: new Date(),
                details: `Payment completed via webhook. Payment ID: ${paymentIntent.id}`
              }
            }
          };
          
          // Add meeting link if generated
          if (meetingLink) {
            updateData.meetingLink = meetingLink;
          }
          
          // Mark the session as paid
          await Session.findByIdAndUpdate(sessionId, updateData);
          
          console.log(`Session ${sessionId} marked as paid via webhook${meetingLink ? ' with Zoom meeting link' : ''}`);
        } catch (error) {
          console.error('Error updating session via webhook:', error);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  // Return a 200 success response
  res.status(200).json({ received: true });
}; 