import User from '../models/User.js';
import Match from '../models/Match.js';
import Skill from '../models/Skill.js';

/**
 * Calculate similarity between two users based on their profiles and preferences
 * @param {Object} user1 - First user
 * @param {Object} user2 - Second user
 * @returns {Number} - Similarity score (0-1)
 */
export const calculateUserSimilarity = (user1, user2) => {
  let similarityScore = 0;
  let totalFactors = 0;
  
  // Compare skills
  if (user1.skills?.length && user2.skills?.length) {
    const user1Skills = new Set(user1.skills.map(s => s.toString()));
    const user2Skills = new Set(user2.skills.map(s => s.toString()));
    
    // Calculate Jaccard similarity for skills
    const intersection = new Set([...user1Skills].filter(x => user2Skills.has(x)));
    const union = new Set([...user1Skills, ...user2Skills]);
    
    similarityScore += intersection.size / union.size;
    totalFactors++;
  }
  
  // Compare preferred mode
  if (user1.preferredMode && user2.preferredMode) {
    if (user1.preferredMode === user2.preferredMode || 
        user1.preferredMode === 'both' || 
        user2.preferredMode === 'both') {
      similarityScore += 1;
    } else {
      similarityScore += 0;
    }
    totalFactors++;
  }
  
  // Compare location (if both have coordinates)
  if (user1.coordinates?.coordinates && user2.coordinates?.coordinates) {
    const [lon1, lat1] = user1.coordinates.coordinates;
    const [lon2, lat2] = user2.coordinates.coordinates;
    
    // Calculate distance (simplified)
    const distance = Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));
    
    // Convert distance to similarity (closer = more similar)
    // Assuming max relevant distance is 100 units
    const distanceSimilarity = Math.max(0, 1 - (distance / 100));
    
    similarityScore += distanceSimilarity;
    totalFactors++;
  }
  
  // Return average similarity
  return totalFactors > 0 ? similarityScore / totalFactors : 0;
};

/**
 * Get collaborative filtering recommendations based on similar users
 * @param {String} userId - User ID to get recommendations for
 * @param {Number} limit - Maximum number of recommendations to return
 * @returns {Array} - Array of recommended users
 */
export const getCollaborativeFilteringRecommendations = async (userId, limit = 5) => {
  // Get the user
  const user = await User.findById(userId)
    .populate('skillsToLearn.skill skillsToTeach.skill skills successfulMatches');
  
  if (!user) return [];
  
  // Get all users who have had successful matches
  const usersWithSuccessfulMatches = await User.find({
    _id: { $ne: userId },
    successfulMatches: { $exists: true, $not: { $size: 0 } }
  }).populate('skillsToLearn.skill skillsToTeach.skill skills successfulMatches');
  
  // Calculate similarity with each user
  const userSimilarities = usersWithSuccessfulMatches.map(otherUser => ({
    user: otherUser,
    similarity: calculateUserSimilarity(user, otherUser)
  }));
  
  // Sort by similarity (descending)
  userSimilarities.sort((a, b) => b.similarity - a.similarity);
  
  // Get top similar users
  const topSimilarUsers = userSimilarities.slice(0, 10);
  
  // Get recommendations from similar users' successful matches
  const recommendations = new Map();
  
  for (const { user: similarUser, similarity } of topSimilarUsers) {
    // Get successful matches of similar user
    for (const matchedUserId of similarUser.successfulMatches) {
      const matchedUserIdStr = matchedUserId.toString();
      
      // Skip if it's the original user or already in recommendations
      if (matchedUserIdStr === userId || recommendations.has(matchedUserIdStr)) {
        continue;
      }
      
      // Get the matched user
      const matchedUser = await User.findById(matchedUserId);
      
      if (!matchedUser) continue;
      
      // Calculate a recommendation score based on similarity and matched user's rating
      const recommendationScore = similarity * (matchedUser.rating || 3) / 5;
      
      recommendations.set(matchedUserIdStr, {
        user: matchedUser,
        score: recommendationScore
      });
    }
  }
  
  // Convert to array and sort by score
  const sortedRecommendations = Array.from(recommendations.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return sortedRecommendations.map(rec => rec.user);
};

/**
 * Get content-based recommendations based on user's skills and preferences
 * @param {String} userId - User ID to get recommendations for
 * @param {Number} limit - Maximum number of recommendations to return
 * @returns {Array} - Array of recommended users
 */
export const getContentBasedRecommendations = async (userId, limit = 5) => {
  // Get the user
  const user = await User.findById(userId)
    .populate('skillsToLearn.skill skillsToTeach.skill skills');
  
  if (!user) return [];
  
  // Get skills the user wants to learn
  const skillsToLearn = user.skillsToLearn.map(s => s.skill._id);
  
  // Find users who can teach these skills
  const potentialTeachers = await User.find({
    _id: { $ne: userId },
    'skillsToTeach.skill': { $in: skillsToLearn }
  }).populate('skillsToTeach.skill');
  
  // Calculate a match score for each potential teacher
  const teacherScores = [];
  
  for (const teacher of potentialTeachers) {
    let matchScore = 0;
    
    // Check which skills the teacher can teach that the user wants to learn
    const teacherSkills = teacher.skillsToTeach.map(s => s.skill._id.toString());
    const matchingSkills = skillsToLearn.filter(skill => 
      teacherSkills.includes(skill.toString())
    );
    
    // Base score on number of matching skills
    matchScore += matchingSkills.length * 2;
    
    // Bonus for teacher's rating
    matchScore += (teacher.rating || 3) / 5 * 3;
    
    // Bonus for teacher's experience
    const avgExperience = teacher.skillsToTeach.reduce((sum, s) => 
      sum + (s.yearsOfExperience || 0), 0) / teacher.skillsToTeach.length;
    
    matchScore += Math.min(avgExperience, 5) / 5 * 2;
    
    // Bonus for preferred mode match
    if (user.preferredMode === teacher.preferredMode || 
        user.preferredMode === 'both' || 
        teacher.preferredMode === 'both') {
      matchScore += 1;
    }
    
    // Bonus for location proximity (if both have coordinates)
    if (user.coordinates?.coordinates && teacher.coordinates?.coordinates) {
      const [lon1, lat1] = user.coordinates.coordinates;
      const [lon2, lat2] = teacher.coordinates.coordinates;
      
      // Calculate distance (simplified)
      const distance = Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));
      
      // Closer = higher score (max 2 points)
      const proximityScore = Math.max(0, 2 - (distance / 50));
      matchScore += proximityScore;
    }
    
    teacherScores.push({
      user: teacher,
      score: matchScore
    });
  }
  
  // Sort by score (descending)
  teacherScores.sort((a, b) => b.score - a.score);
  
  // Return top recommendations
  return teacherScores.slice(0, limit).map(ts => ts.user);
};

/**
 * Get hybrid recommendations combining collaborative filtering and content-based approaches
 * @param {String} userId - User ID to get recommendations for
 * @param {Number} limit - Maximum number of recommendations to return
 * @returns {Array} - Array of recommended users
 */
export const getHybridRecommendations = async (userId, limit = 10) => {
  // Get recommendations from both approaches
  const collaborativeRecs = await getCollaborativeFilteringRecommendations(userId, limit);
  const contentBasedRecs = await getContentBasedRecommendations(userId, limit);
  
  // Combine recommendations
  const recommendations = new Map();
  
  // Add collaborative filtering recommendations with weight 0.6
  for (const [index, user] of collaborativeRecs.entries()) {
    const score = (limit - index) / limit * 0.6;
    recommendations.set(user._id.toString(), {
      user,
      score
    });
  }
  
  // Add content-based recommendations with weight 0.4
  for (const [index, user] of contentBasedRecs.entries()) {
    const userIdStr = user._id.toString();
    const score = (limit - index) / limit * 0.4;
    
    if (recommendations.has(userIdStr)) {
      // If already in recommendations, add to score
      recommendations.get(userIdStr).score += score;
    } else {
      recommendations.set(userIdStr, {
        user,
        score
      });
    }
  }
  
  // Convert to array and sort by score
  const sortedRecommendations = Array.from(recommendations.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return sortedRecommendations.map(rec => rec.user);
};

/**
 * Predict match success probability
 * @param {Object} user1 - First user
 * @param {Object} user2 - Second user
 * @returns {Number} - Success probability (0-1)
 */
export const predictMatchSuccess = async (user1, user2) => {
  // Calculate base similarity
  const similarity = calculateUserSimilarity(user1, user2);
  
  // Get past successful matches for both users
  const user1SuccessRate = user1.successfulMatches?.length / 
    (await Match.countDocuments({ user: user1._id })) || 0;
  
  const user2SuccessRate = user2.successfulMatches?.length / 
    (await Match.countDocuments({ user: user2._id })) || 0;
  
  // Calculate success probability
  const successProbability = (
    similarity * 0.5 + 
    user1SuccessRate * 0.25 + 
    user2SuccessRate * 0.25
  );
  
  return Math.min(1, Math.max(0, successProbability));
};

/**
 * Generate AI-based recommendations for a user based on past successful exchanges
 * @param {String} userId - User ID
 * @param {Number} limit - Maximum number of recommendations to return
 * @returns {Array} - Array of recommended matches
 */
export const getAIRecommendations = async (userId, limit = 10) => {
  try {
    // Get the user
    const user = await User.findById(userId)
      .populate('skillsToLearn.skill skillsToTeach.skill successfulMatches');
    
    if (!user) return [];
    
    // Get user's successful matches
    const successfulMatchesData = await Match.find({
      user: userId,
      isSuccessful: true
    }).populate('matchedUser skillToLearn skillToTeach');
    
    // If user has no successful matches, fall back to regular matching
    if (successfulMatchesData.length === 0) {
      return [];
    }
    
    // Extract features from successful matches
    const successFeatures = extractSuccessFeatures(user, successfulMatchesData);
    
    // Find potential matches
    const potentialMatches = await findPotentialMatches(user);
    
    // Score each potential match based on similarity to successful matches
    const scoredMatches = [];
    
    for (const potentialMatch of potentialMatches) {
      // Calculate similarity score
      const similarityScore = calculateSimilarityScore(user, potentialMatch, successFeatures);
      
      // Add to scored matches
      scoredMatches.push({
        user: potentialMatch,
        similarityScore
      });
    }
    
    // Sort by similarity score (descending)
    scoredMatches.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Return top matches
    return scoredMatches.slice(0, limit);
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return [];
  }
};

/**
 * Extract features from successful matches
 * @param {Object} user - User object
 * @param {Array} successfulMatches - Array of successful match objects
 * @returns {Object} - Features extracted from successful matches
 */
const extractSuccessFeatures = (user, successfulMatches) => {
  // Initialize feature counters
  const features = {
    preferredSkillCategories: {},
    preferredTeacherLevels: {},
    preferredLearnerLevels: {},
    preferredLocations: {},
    preferredModes: {},
    averageRating: 0,
    totalRatings: 0
  };
  
  // Process each successful match
  for (const match of successfulMatches) {
    // Skill categories
    if (match.skillToLearn?.category) {
      features.preferredSkillCategories[match.skillToLearn.category] = 
        (features.preferredSkillCategories[match.skillToLearn.category] || 0) + 1;
    }
    
    if (match.skillToTeach?.category) {
      features.preferredSkillCategories[match.skillToTeach.category] = 
        (features.preferredSkillCategories[match.skillToTeach.category] || 0) + 1;
    }
    
    // Teacher levels
    const teacherSkill = match.matchedUser?.skillsToTeach?.find(s => 
      s.skill.toString() === match.skillToTeach?._id.toString()
    );
    
    if (teacherSkill?.level) {
      features.preferredTeacherLevels[teacherSkill.level] = 
        (features.preferredTeacherLevels[teacherSkill.level] || 0) + 1;
    }
    
    // Learner levels
    const learnerSkill = match.matchedUser?.skillsToLearn?.find(s => 
      s.skill.toString() === match.skillToLearn?._id.toString()
    );
    
    if (learnerSkill?.level) {
      features.preferredLearnerLevels[learnerSkill.level] = 
        (features.preferredLearnerLevels[learnerSkill.level] || 0) + 1;
    }
    
    // Locations
    if (match.matchedUser?.location) {
      features.preferredLocations[match.matchedUser.location] = 
        (features.preferredLocations[match.matchedUser.location] || 0) + 1;
    }
    
    // Modes
    if (match.matchedUser?.preferredMode) {
      features.preferredModes[match.matchedUser.preferredMode] = 
        (features.preferredModes[match.matchedUser.preferredMode] || 0) + 1;
    }
    
    // Ratings
    if (match.feedback?.rating) {
      features.averageRating += match.feedback.rating;
      features.totalRatings++;
    }
  }
  
  // Calculate average rating
  if (features.totalRatings > 0) {
    features.averageRating /= features.totalRatings;
  }
  
  return features;
};

/**
 * Find potential matches for a user
 * @param {Object} user - User object
 * @returns {Array} - Array of potential match users
 */
const findPotentialMatches = async (user) => {
  // Find users who have skills to teach that match user's skills to learn
  // or have skills to learn that match user's skills to teach
  const potentialMatches = await User.find({
    _id: { $ne: user._id },
    $or: [
      // For learner role
      {
        role: { $in: ['teacher', 'both'] },
        'skillsToTeach.skill': { 
          $in: user.skillsToLearn?.map(s => s.skill._id) || [] 
        }
      },
      // For teacher role
      {
        role: { $in: ['learner', 'both'] },
        'skillsToLearn.skill': { 
          $in: user.skillsToTeach?.map(s => s.skill._id) || [] 
        }
      }
    ]
  }).populate('skillsToLearn.skill skillsToTeach.skill');
  
  return potentialMatches;
};

/**
 * Calculate similarity score between a user and a potential match
 * @param {Object} user - User object
 * @param {Object} potentialMatch - Potential match user object
 * @param {Object} successFeatures - Features extracted from successful matches
 * @returns {Number} - Similarity score
 */
const calculateSimilarityScore = (user, potentialMatch, successFeatures) => {
  let score = 0;
  
  // 1. Skill category match (30 points max)
  const userSkillCategories = new Set([
    ...user.skillsToLearn?.map(s => s.skill.category) || [],
    ...user.skillsToTeach?.map(s => s.skill.category) || []
  ]);
  
  const matchSkillCategories = new Set([
    ...potentialMatch.skillsToLearn?.map(s => s.skill.category) || [],
    ...potentialMatch.skillsToTeach?.map(s => s.skill.category) || []
  ]);
  
  // Check if categories match preferred categories from successful matches
  for (const category of matchSkillCategories) {
    if (successFeatures.preferredSkillCategories[category]) {
      score += 10 * (successFeatures.preferredSkillCategories[category] / 
        Object.values(successFeatures.preferredSkillCategories).reduce((a, b) => a + b, 0));
    }
  }
  
  // 2. Skill level match (20 points max)
  // Check teacher levels
  for (const teachSkill of potentialMatch.skillsToTeach || []) {
    if (successFeatures.preferredTeacherLevels[teachSkill.level]) {
      score += 10 * (successFeatures.preferredTeacherLevels[teachSkill.level] / 
        Object.values(successFeatures.preferredTeacherLevels).reduce((a, b) => a + b, 0));
    }
  }
  
  // Check learner levels
  for (const learnSkill of potentialMatch.skillsToLearn || []) {
    if (successFeatures.preferredLearnerLevels[learnSkill.level]) {
      score += 10 * (successFeatures.preferredLearnerLevels[learnSkill.level] / 
        Object.values(successFeatures.preferredLearnerLevels).reduce((a, b) => a + b, 0));
    }
  }
  
  // 3. Location match (15 points)
  if (potentialMatch.location && 
      successFeatures.preferredLocations[potentialMatch.location]) {
    score += 15 * (successFeatures.preferredLocations[potentialMatch.location] / 
      Object.values(successFeatures.preferredLocations).reduce((a, b) => a + b, 0));
  }
  
  // 4. Preferred mode match (15 points)
  if (potentialMatch.preferredMode && 
      successFeatures.preferredModes[potentialMatch.preferredMode]) {
    score += 15 * (successFeatures.preferredModes[potentialMatch.preferredMode] / 
      Object.values(successFeatures.preferredModes).reduce((a, b) => a + b, 0));
  }
  
  // 5. Rating match (20 points)
  if (successFeatures.averageRating > 0 && potentialMatch.rating > 0) {
    // Closer rating to successful matches = higher score
    const ratingDifference = Math.abs(successFeatures.averageRating - potentialMatch.rating);
    score += 20 * (1 - (ratingDifference / 5)); // 5 is max rating difference
  }
  
  return score;
};

/**
 * Get learning path recommendations for a skill
 * @param {String} skillId - Skill ID
 * @returns {Object} - Learning path recommendations
 */
export const getLearningPathRecommendations = async (skillId) => {
  try {
    // Get the skill
    const skill = await Skill.findById(skillId).populate('relatedSkills');
    
    if (!skill) return null;
    
    // Get successful matches involving this skill
    const successfulMatches = await Match.find({
      $or: [
        { skillToLearn: skillId, isSuccessful: true },
        { skillToTeach: skillId, isSuccessful: true }
      ]
    }).populate('user matchedUser skillToLearn skillToTeach');
    
    // If no successful matches, return basic path
    if (successfulMatches.length === 0) {
      return {
        skill: skill,
        prerequisites: [],
        nextSteps: skill.relatedSkills || [],
        resources: []
      };
    }
    
    // Analyze successful learners' skill progression
    const prerequisites = new Map();
    const nextSteps = new Map();
    const resources = [];
    
    for (const match of successfulMatches) {
      const learner = match.skillToLearn?._id.toString() === skillId.toString() 
        ? match.user 
        : match.matchedUser;
      
      // Get learner's other skills
      const learnerData = await User.findById(learner)
        .populate('skills skillsToLearn.skill skillsToTeach.skill');
      
      if (!learnerData) continue;
      
      // Find skills that were likely prerequisites
      for (const userSkill of learnerData.skills || []) {
        // Skip the target skill
        if (userSkill._id.toString() === skillId.toString()) continue;
        
        // Check if this skill is related to the target skill
        const isRelated = skill.relatedSkills?.some(s => 
          s._id.toString() === userSkill._id.toString()
        );
        
        if (isRelated) {
          prerequisites.set(
            userSkill._id.toString(), 
            (prerequisites.get(userSkill._id.toString()) || 0) + 1
          );
        }
      }
      
      // Find skills that were learned after
      for (const learnSkill of learnerData.skillsToLearn || []) {
        // Skip the target skill
        if (learnSkill.skill._id.toString() === skillId.toString()) continue;
        
        // Check if this skill is related to the target skill
        const isRelated = skill.relatedSkills?.some(s => 
          s._id.toString() === learnSkill.skill._id.toString()
        );
        
        if (isRelated) {
          nextSteps.set(
            learnSkill.skill._id.toString(), 
            (nextSteps.get(learnSkill.skill._id.toString()) || 0) + 1
          );
        }
      }
      
      // Collect feedback comments as potential resources
      if (match.feedback?.comment) {
        resources.push(match.feedback.comment);
      }
    }
    
    // Sort prerequisites and next steps by frequency
    const sortedPrerequisites = Array.from(prerequisites.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(async ([id, count]) => {
        return await Skill.findById(id);
      });
    
    const sortedNextSteps = Array.from(nextSteps.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(async ([id, count]) => {
        return await Skill.findById(id);
      });
    
    // Resolve promises
    const prerequisiteSkills = await Promise.all(sortedPrerequisites);
    const nextStepSkills = await Promise.all(sortedNextSteps);
    
    return {
      skill: skill,
      prerequisites: prerequisiteSkills.filter(Boolean),
      nextSteps: nextStepSkills.filter(Boolean),
      resources: resources.slice(0, 5)
    };
  } catch (error) {
    console.error('Error generating learning path:', error);
    return null;
  }
};

export default {
  calculateUserSimilarity,
  getCollaborativeFilteringRecommendations,
  getContentBasedRecommendations,
  getHybridRecommendations,
  predictMatchSuccess,
  getAIRecommendations,
  getLearningPathRecommendations
}; 