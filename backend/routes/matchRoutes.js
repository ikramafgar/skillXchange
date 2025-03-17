import express from 'express';
import { 
  generateMatches, 
  getMatches, 
  updateMatchStatus, 
  submitMatchFeedback,
  getLearningPath,
  getTrendingSkillsEndpoint,
  getPersonalizedRecommendations,
  subscribeToMatchUpdates,
  unsubscribeFromMatchUpdates
} from '../controllers/matchController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Generate matches for a user
router.post('/generate/:userId', verifyToken, generateMatches);

// Generate matches for the authenticated user
router.post('/generate', verifyToken, generateMatches);

// Get matches for a user
router.get('/user/:userId', verifyToken, getMatches);

// Get matches for the authenticated user
router.get('/user', verifyToken, getMatches);

// Update match status
router.put('/status/:matchId', verifyToken, updateMatchStatus);

// Submit feedback for a match
router.post('/feedback/:matchId', verifyToken, submitMatchFeedback);

// Get learning path for a skill
router.get('/learning-path/:skillId', verifyToken, getLearningPath);

// Get trending skills
router.get('/trending-skills', getTrendingSkillsEndpoint);

// Get personalized skill recommendations
router.get('/recommendations/:userId', verifyToken, getPersonalizedRecommendations);

// Subscribe to match updates
router.post('/subscribe/:userId', verifyToken, subscribeToMatchUpdates);

// Unsubscribe from match updates
router.delete('/subscribe/:userId', verifyToken, unsubscribeFromMatchUpdates);

export default router; 