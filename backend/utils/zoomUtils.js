import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Make sure environment variables are loaded
dotenv.config();

/**
 * Create a mock Zoom meeting link for development/testing
 * @returns {Object} Mock meeting details
 */
export const createMockZoomMeeting = () => {
  const mockMeetingId = Math.floor(Math.random() * 1000000000);
  return {
    meetingId: mockMeetingId,
    meetingPassword: 'mock123',
    joinUrl: `https://zoom.us/j/${mockMeetingId}?pwd=mock123`,
    startUrl: `https://zoom.us/s/${mockMeetingId}?pwd=mock123`
  };
};

/**
 * Generate access token for Zoom API using Server-to-Server OAuth
 * @returns {Promise<string>} Access token
 */
export const generateZoomToken = async () => {
  console.log('Generating Zoom access token using Server-to-Server OAuth');
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_API_KEY;
  const clientSecret = process.env.ZOOM_API_SECRET;
  
  if (!clientId || !clientSecret || !accountId) {
    console.error('Zoom API credentials missing');
    throw new Error('Zoom API credentials missing');
  }
  
  try {
    // Create Base64 encoded auth string
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    // Request access token
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      'grant_type=account_credentials&account_id=' + accountId,
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('DEBUG - Successfully retrieved Zoom access token');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error.message);
    if (error.response) {
      console.error('Zoom token response error:', error.response.status, error.response.data);
    }
    throw new Error(`Failed to get Zoom access token: ${error.message}`);
  }
};

/**
 * Create a Zoom meeting using the Zoom API
 * @param {string} topic Meeting topic
 * @param {string} startTime ISO string of meeting start time
 * @param {number} duration Meeting duration in minutes
 * @param {string} teacherName Name of the teacher
 * @param {string} learnerName Name of the learner
 * @returns {Promise<Object>} Meeting details
 */
export const createZoomMeeting = async (topic, startTime, duration, teacherName, learnerName) => {
  // If explicitly configured to use mock Zoom meetings
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_ZOOM === 'true') {
    console.log('DEBUG - Using mock Zoom meeting (MOCK_ZOOM=true)');
    return createMockZoomMeeting();
  }
  
  // Log environment details
  console.log('DEBUG - Zoom Credentials Check:');
  console.log('Account ID available:', !!process.env.ZOOM_ACCOUNT_ID);
  console.log('API Key available:', !!process.env.ZOOM_API_KEY);
  console.log('API Secret available:', !!process.env.ZOOM_API_SECRET);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  try {
    // Get access token using Server-to-Server OAuth
    const accessToken = await generateZoomToken();
    console.log('DEBUG - Successfully obtained Zoom access token');
    
    // Call Zoom API to create meeting
    console.log('DEBUG - Calling Zoom API to create meeting');
    
    // Set timeout for the request to avoid hanging
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: duration,
        timezone: 'UTC',
        agenda: `Skill Exchange Session between ${teacherName} (Teacher) and ${learnerName} (Learner)`,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: true,
          waiting_room: false,
          audio: 'both',
          auto_recording: 'none'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('DEBUG - Zoom API response received:', response.status);
    
    if (!response.data || !response.data.join_url) {
      console.error('DEBUG - Invalid Zoom API response:', response.data);
      throw new Error('Invalid response from Zoom API');
    }
    
    console.log('DEBUG - Zoom meeting created successfully:', response.data.join_url);
    
    return {
      meetingId: response.data.id,
      meetingPassword: response.data.password,
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url
    };
  } catch (error) {
    console.error('Failed to create Zoom meeting:', error.message);
    if (error.response) {
      console.error('Zoom API error details:', error.response.status, error.response.data);
    }
    throw new Error(`Failed to create Zoom meeting: ${error.message}`);
  }
}; 