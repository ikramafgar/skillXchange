import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { 
  getAllSkills, 
  getSkillById,
  createSkill,
  searchSkills,
  getTrendingSkills
} from '../controllers/skillController.js';

const router = express.Router();

// Public routes
router.get('/trending', getTrendingSkills);

// Protected routes - require authentication
router.get('/', getAllSkills);
router.get('/search', verifyToken, searchSkills);
router.get('/:skillId', verifyToken, getSkillById);
router.post('/', verifyToken, createSkill);

export default router; 