import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Match from '../models/Match.js';

/**
 * Calculate demand score for a skill
 * @param {String} skillId - Skill ID
 * @returns {Object} - Demand metrics
 */
export const calculateSkillDemand = async (skillId) => {
  // Count learners wanting this skill
  const learnersCount = await User.countDocuments({
    'skillsToLearn.skill': skillId
  });
  
  // Count teachers offering this skill
  const teachersCount = await User.countDocuments({
    'skillsToTeach.skill': skillId
  });
  
  // Calculate demand ratio (learners / teachers)
  const demandRatio = teachersCount > 0 ? learnersCount / teachersCount : learnersCount;
  
  // Count successful matches involving this skill
  const successfulMatches = await Match.countDocuments({
    $or: [
      { skillToLearn: skillId, isSuccessful: true },
      { skillToTeach: skillId, isSuccessful: true }
    ]
  });
  
  // Calculate success rate
  const totalMatches = await Match.countDocuments({
    $or: [
      { skillToLearn: skillId },
      { skillToTeach: skillId }
    ]
  });
  
  const successRate = totalMatches > 0 ? successfulMatches / totalMatches : 0;
  
  // Calculate overall demand score
  // Higher when: many learners, few teachers, high success rate
  const demandScore = (
    (learnersCount * 0.5) + 
    (demandRatio * 0.3) + 
    (successRate * 0.2)
  );
  
  return {
    skillId,
    learnersCount,
    teachersCount,
    demandRatio,
    successfulMatches,
    successRate,
    demandScore
  };
};

/**
 * Get trending skills based on demand and growth
 * @param {Number} limit - Maximum number of skills to return
 * @returns {Array} - Array of trending skills with demand metrics
 */
export const getTrendingSkills = async (limit = 10) => {
  // Get all skills
  const skills = await Skill.find();
  
  // Calculate demand for each skill
  const skillDemands = await Promise.all(
    skills.map(skill => calculateSkillDemand(skill._id))
  );
  
  // Sort by demand score (descending)
  skillDemands.sort((a, b) => b.demandScore - a.demandScore);
  
  // Get top trending skills
  const trendingSkills = skillDemands.slice(0, limit);
  
  // Populate skill details
  for (const trendingSkill of trendingSkills) {
    trendingSkill.skill = await Skill.findById(trendingSkill.skillId);
  }
  
  return trendingSkills;
};

/**
 * Get skills with high teacher demand
 * @param {Number} limit - Maximum number of skills to return
 * @returns {Array} - Array of skills needing more teachers
 */
export const getSkillsNeedingTeachers = async (limit = 10) => {
  // Get all skills
  const skills = await Skill.find();
  
  // Calculate demand for each skill
  const skillDemands = await Promise.all(
    skills.map(skill => calculateSkillDemand(skill._id))
  );
  
  // Filter for skills with high demand ratio (more learners than teachers)
  const highDemandSkills = skillDemands
    .filter(demand => demand.demandRatio > 1)
    .sort((a, b) => b.demandRatio - a.demandRatio)
    .slice(0, limit);
  
  // Populate skill details
  for (const demandSkill of highDemandSkills) {
    demandSkill.skill = await Skill.findById(demandSkill.skillId);
  }
  
  return highDemandSkills;
};

/**
 * Get skills with high success rate
 * @param {Number} limit - Maximum number of skills to return
 * @returns {Array} - Array of skills with high success rate
 */
export const getHighSuccessRateSkills = async (limit = 10) => {
  // Get all skills
  const skills = await Skill.find();
  
  // Calculate demand for each skill
  const skillDemands = await Promise.all(
    skills.map(skill => calculateSkillDemand(skill._id))
  );
  
  // Filter for skills with matches and sort by success rate
  const successfulSkills = skillDemands
    .filter(demand => demand.totalMatches > 5) // Minimum number of matches for reliability
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, limit);
  
  // Populate skill details
  for (const successSkill of successfulSkills) {
    successSkill.skill = await Skill.findById(successSkill.skillId);
  }
  
  return successfulSkills;
};

/**
 * Get personalized skill recommendations for a user
 * @param {String} userId - User ID
 * @param {Number} limit - Maximum number of skills to recommend
 * @returns {Array} - Array of recommended skills
 */
export const getPersonalizedSkillRecommendations = async (userId, limit = 5) => {
  // Get the user
  const user = await User.findById(userId)
    .populate('skills skillsToLearn.skill skillsToTeach.skill');
  
  if (!user) return [];
  
  // Get trending skills
  const trendingSkills = await getTrendingSkills(20);
  
  // Calculate relevance score for each trending skill
  const relevantSkills = [];
  
  for (const trendingSkill of trendingSkills) {
    const skill = trendingSkill.skill;
    
    // Skip if user already has this skill
    const userSkillIds = user.skills?.map(s => s.toString()) || [];
    const userLearningSkillIds = user.skillsToLearn?.map(s => s.skill.toString()) || [];
    const userTeachingSkillIds = user.skillsToTeach?.map(s => s.skill.toString()) || [];
    
    if (
      userSkillIds.includes(skill._id.toString()) ||
      userLearningSkillIds.includes(skill._id.toString()) ||
      userTeachingSkillIds.includes(skill._id.toString())
    ) {
      continue;
    }
    
    // Calculate relevance based on related skills
    let relevanceScore = trendingSkill.demandScore;
    
    // Boost score if skill is related to user's existing skills
    if (skill.relatedSkills?.length) {
      const relatedSkillIds = skill.relatedSkills.map(s => s.toString());
      
      // Check overlap with user's skills
      const userRelatedSkillsCount = userSkillIds.filter(id => 
        relatedSkillIds.includes(id)
      ).length;
      
      relevanceScore += userRelatedSkillsCount * 2;
    }
    
    relevantSkills.push({
      skill,
      relevanceScore,
      demandMetrics: trendingSkill
    });
  }
  
  // Sort by relevance score
  relevantSkills.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return relevantSkills.slice(0, limit);
};

/**
 * Get top teachers for a specific skill
 * @param {String} skillId - Skill ID
 * @param {Number} limit - Maximum number of teachers to return
 * @returns {Array} - Array of top teachers
 */
export const getTopTeachersForSkill = async (skillId, limit = 5) => {
  // Find users who teach this skill
  const teachers = await User.find({
    'skillsToTeach.skill': skillId
  }).populate('skillsToTeach.skill');
  
  // Calculate a score for each teacher
  const teacherScores = [];
  
  for (const teacher of teachers) {
    let score = 0;
    
    // Base score on rating
    score += (teacher.rating || 3) * 2;
    
    // Bonus for experience
    const skillTeaching = teacher.skillsToTeach.find(s => 
      s.skill._id.toString() === skillId.toString()
    );
    
    if (skillTeaching?.yearsOfExperience) {
      score += Math.min(skillTeaching.yearsOfExperience, 10);
    }
    
    // Bonus for successful matches
    score += teacher.successfulMatches?.length || 0;
    
    // Bonus for certifications
    score += teacher.certificates?.length || 0;
    
    teacherScores.push({
      teacher,
      score
    });
  }
  
  // Sort by score
  teacherScores.sort((a, b) => b.score - a.score);
  
  return teacherScores.slice(0, limit).map(ts => ts.teacher);
};

export default {
  calculateSkillDemand,
  getTrendingSkills,
  getSkillsNeedingTeachers,
  getHighSuccessRateSkills,
  getPersonalizedSkillRecommendations,
  getTopTeachersForSkill
}; 