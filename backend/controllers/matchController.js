import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Match from '../models/Match.js';
import mongoose from 'mongoose';
// Import the AI recommendations utility
import aiRecommendations from '../utils/aiRecommendations.js';
// Import the skill demand analysis utility
import { getTrendingSkills, getPersonalizedSkillRecommendations } from '../utils/skillDemandAnalysis.js';

/**
 * Calculate the distance between two coordinates in kilometers
 * @param {Array} coords1 - [longitude, latitude]
 * @param {Array} coords2 - [longitude, latitude]
 * @returns {Number} - Distance in kilometers
 */
const calculateDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return Infinity;
  
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  // Haversine formula
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
};

/**
 * Calculate availability overlap between two users
 * @param {Array} availability1 - First user's availability
 * @param {Array} availability2 - Second user's availability
 * @returns {Number} - Percentage of overlap (0-100)
 */
const calculateAvailabilityOverlap = (availability1, availability2) => {
  if (!availability1 || !availability2 || !availability1.length || !availability2.length) {
    return 0;
  }
  
  let totalOverlapMinutes = 0;
  const totalPossibleMinutes = 7 * 24 * 60; // 7 days * 24 hours * 60 minutes
  
  // For each day of the week
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
    // Get all time slots for this day for both users
    const user1Slots = availability1.filter(slot => slot.day === day);
    const user2Slots = availability2.filter(slot => slot.day === day);
    
    // For each pair of slots, calculate overlap
    user1Slots.forEach(slot1 => {
      user2Slots.forEach(slot2 => {
        // Convert time strings to minutes since midnight
        const start1 = timeToMinutes(slot1.startTime);
        const end1 = timeToMinutes(slot1.endTime);
        const start2 = timeToMinutes(slot2.startTime);
        const end2 = timeToMinutes(slot2.endTime);
        
        // Calculate overlap
        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);
        const overlapMinutes = Math.max(0, overlapEnd - overlapStart);
        
        totalOverlapMinutes += overlapMinutes;
      });
    });
  });
  
  // Calculate percentage of overlap
  return (totalOverlapMinutes / totalPossibleMinutes) * 100;
};

/**
 * Convert time string to minutes since midnight
 * @param {String} timeStr - Time string in format "HH:MM"
 * @returns {Number} - Minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if preferred modes are compatible
 * @param {String} mode1 - First user's preferred mode
 * @param {String} mode2 - Second user's preferred mode
 * @returns {Boolean} - True if modes are compatible
 */
const areModesCompatible = (mode1, mode2) => {
  if (mode1 === 'both' || mode2 === 'both') return true;
  return mode1 === mode2;
};

/**
 * Calculate match score between two users
 * @param {Object} user - Current user
 * @param {Object} potentialMatch - Potential match user
 * @param {Object} matchDetails - Details about the match
 * @returns {Object} - Score and score components
 */
const calculateMatchScore = (user, potentialMatch, matchDetails) => {
  const scoreComponents = {
    exactSkillMatch: 0,
    availabilityOverlap: 0,
    locationProximity: 0,
    preferredModeMatch: 0,
    userRating: 0
  };
  
  // 1. Exact Skill Match (50 points)
  if (matchDetails.matchType === 'direct') {
    scoreComponents.exactSkillMatch = 50;
  } else if (matchDetails.matchType === 'similar') {
    scoreComponents.exactSkillMatch = 30;
  } else if (matchDetails.matchType === 'alternative') {
    scoreComponents.exactSkillMatch = 25;
  } else if (matchDetails.matchType === 'group') {
    scoreComponents.exactSkillMatch = 20;
  }
  
  // 2. Availability Overlap (20 points max)
  const overlapPercentage = calculateAvailabilityOverlap(user.availability, potentialMatch.availability);
  scoreComponents.availabilityOverlap = Math.min(20, (overlapPercentage / 100) * 20);
  
  // 3. Location Proximity (15 points max)
  if (user.coordinates?.coordinates && potentialMatch.coordinates?.coordinates) {
    const distance = calculateDistance(user.coordinates.coordinates, potentialMatch.coordinates.coordinates);
    // Closer = higher score, max distance considered is 100km
    scoreComponents.locationProximity = Math.max(0, 15 - (distance / 100) * 15);
  }
  
  // 4. Preferred Mode Match (10 points)
  if (areModesCompatible(user.preferredMode, potentialMatch.preferredMode)) {
    scoreComponents.preferredModeMatch = 10;
  }
  
  // 5. User Rating & Experience (5 points max)
  scoreComponents.userRating = Math.min(5, potentialMatch.rating || 0);
  
  // Calculate total score
  const totalScore = Object.values(scoreComponents).reduce((sum, score) => sum + score, 0);
  
  return {
    score: totalScore,
    scoreComponents
  };
};

/**
 * Find direct one-to-one matches
 * @param {Object} userProfile - User profile to find matches for
 * @returns {Array} - Array of match objects
 */
const findDirectMatches = async (userProfile) => {
  const matches = [];
  
  // Skip if user has no skills to learn or teach
  if (!userProfile.skillsToLearn?.length || !userProfile.skillsToTeach?.length) {
    console.log('User has no skills to learn or teach, skipping direct matches');
    return matches;
  }
  
  try {
    console.log(`Finding direct matches for user profile ${userProfile._id}`);
    
    // Safely extract skill IDs
    const skillsToLearnIds = userProfile.skillsToLearn
      .filter(s => s.skill && mongoose.Types.ObjectId.isValid(s.skill._id))
      .map(s => s.skill._id);
    
    const skillsToTeachIds = userProfile.skillsToTeach
      .filter(s => s.skill && mongoose.Types.ObjectId.isValid(s.skill._id))
      .map(s => s.skill._id);
    
    if (skillsToLearnIds.length === 0 || skillsToTeachIds.length === 0) {
      console.log('No valid skill IDs found for matching');
      return matches;
    }
    
    // Get all users with profiles who have skills to teach that match user's skills to learn
    // and have skills to learn that match user's skills to teach
    const potentialMatches = await User.find({
      _id: { $ne: userProfile.user },
      profile: { $exists: true }
    }).populate({
      path: 'profile',
      populate: [
        { path: 'skillsToLearn.skill' },
        { path: 'skillsToTeach.skill' }
      ]
    });
    
    console.log(`Found ${potentialMatches.length} potential users for direct matches`);
    
    // Filter users whose profiles have matching skills
    const filteredMatches = potentialMatches.filter(user => {
      if (!user.profile) return false;
      
      const profile = user.profile;
      
      // Check if this profile has any skills that match our user's skills
      const hasMatchingTeachSkills = profile.skillsToTeach?.some(s => 
        s.skill && skillsToLearnIds.some(id => id.equals(s.skill._id))
      );
      
      const hasMatchingLearnSkills = profile.skillsToLearn?.some(s => 
        s.skill && skillsToTeachIds.some(id => id.equals(s.skill._id))
      );
      
      return hasMatchingTeachSkills || hasMatchingLearnSkills;
    });
    
    console.log(`Filtered to ${filteredMatches.length} potential direct matches with matching skills`);
    
    // For each potential match, calculate match score
    for (const matchedUser of filteredMatches) {
      try {
        const matchProfile = matchedUser.profile;
        
        // Find matching skills
        const userWantsToLearn = userProfile.skillsToLearn
          .filter(s => s.skill && s.skill._id)
          .map(s => s.skill._id.toString());
        
        const userCanTeach = userProfile.skillsToTeach
          .filter(s => s.skill && s.skill._id)
          .map(s => s.skill._id.toString());
        
        const matchCanTeach = matchProfile.skillsToTeach
          ?.filter(s => s.skill && s.skill._id)
          .map(s => s.skill._id.toString()) || [];
        
        const matchWantsToLearn = matchProfile.skillsToLearn
          ?.filter(s => s.skill && s.skill._id)
          .map(s => s.skill._id.toString()) || [];
        
        // Check for direct match (user learns what match teaches AND user teaches what match learns)
        const skillsUserCanLearn = userWantsToLearn.filter(skill => matchCanTeach.includes(skill));
        const skillsUserCanTeach = userCanTeach.filter(skill => matchWantsToLearn.includes(skill));
        
        if (skillsUserCanLearn.length > 0 && skillsUserCanTeach.length > 0) {
          // For each pair of matching skills, create a match
          for (const learnSkill of skillsUserCanLearn) {
            for (const teachSkill of skillsUserCanTeach) {
              const matchDetails = {
                matchType: 'direct',
                skillToLearn: learnSkill,
                skillToTeach: teachSkill
              };
              
              const { score, scoreComponents } = calculateMatchScore(userProfile, matchProfile, matchDetails);
              
              matches.push({
                user: userProfile.user,
                matchedUser: matchedUser._id,
                matchType: 'direct',
                skillToLearn: learnSkill,
                skillToTeach: teachSkill,
                score,
                scoreComponents
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing potential match ${matchedUser._id}:`, error);
        // Continue with next potential match
      }
    }
    
    console.log(`Created ${matches.length} direct matches`);
    return matches;
  } catch (error) {
    console.error('Error in findDirectMatches:', error);
    return matches;
  }
};

/**
 * Find alternative single-direction matches
 * @param {Object} userProfile - User profile to find matches for
 * @returns {Array} - Array of match objects
 */
const findAlternativeMatches = async (userProfile) => {
  const matches = [];
  
  try {
    console.log(`Finding alternative matches for user profile ${userProfile._id}`);
    
    // For users who want to learn
    // Safely extract skill IDs for learning
    const skillsToLearnIds = userProfile.skillsToLearn
      ?.filter(s => s.skill && mongoose.Types.ObjectId.isValid(s.skill._id))
      .map(s => s.skill._id) || [];
    
    // Safely extract skill IDs for teaching
    const skillsToTeachIds = userProfile.skillsToTeach
      ?.filter(s => s.skill && mongoose.Types.ObjectId.isValid(s.skill._id))
      .map(s => s.skill._id) || [];
    
    // Get all users with profiles
    const potentialMatches = await User.find({
      _id: { $ne: userProfile.user },
      profile: { $exists: true }
    }).populate({
      path: 'profile',
      populate: [
        { path: 'skillsToLearn.skill' },
        { path: 'skillsToTeach.skill' }
      ]
    });
    
    console.log(`Found ${potentialMatches.length} potential users for alternative matches`);
    
    // Process matches for learning (user wants to learn, others can teach)
    if (skillsToLearnIds.length > 0) {
      // Filter users whose profiles have skills that match our user's learning needs
      const teacherMatches = potentialMatches.filter(user => {
        if (!user.profile || !user.profile.skillsToTeach?.length) return false;
        
        return user.profile.skillsToTeach.some(s => 
          s.skill && skillsToLearnIds.some(id => id.equals(s.skill._id))
        );
      });
      
      console.log(`Found ${teacherMatches.length} teacher matches for alternative matching`);
      
      for (const teacher of teacherMatches) {
        try {
          const teacherProfile = teacher.profile;
          
          const userWantsToLearn = userProfile.skillsToLearn
            .filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString());
          
          const teacherCanTeach = teacherProfile.skillsToTeach
            ?.filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString()) || [];
          
          // Find skills that match
          const matchingSkills = userWantsToLearn.filter(skill => teacherCanTeach.includes(skill));
          
          for (const skill of matchingSkills) {
            const matchDetails = {
              matchType: 'alternative',
              skillToLearn: skill
            };
            
            const { score, scoreComponents } = calculateMatchScore(userProfile, teacherProfile, matchDetails);
            
            matches.push({
              user: userProfile.user,
              matchedUser: teacher._id,
              matchType: 'alternative',
              skillToLearn: skill,
              score,
              scoreComponents
            });
          }
        } catch (error) {
          console.error(`Error processing teacher match ${teacher._id}:`, error);
        }
      }
    }
    
    // Process matches for teaching (user wants to teach, others want to learn)
    if (skillsToTeachIds.length > 0) {
      // Filter users whose profiles have learning needs that match our user's teaching skills
      const learnerMatches = potentialMatches.filter(user => {
        if (!user.profile || !user.profile.skillsToLearn?.length) return false;
        
        return user.profile.skillsToLearn.some(s => 
          s.skill && skillsToTeachIds.some(id => id.equals(s.skill._id))
        );
      });
      
      console.log(`Found ${learnerMatches.length} learner matches for alternative matching`);
      
      for (const learner of learnerMatches) {
        try {
          const learnerProfile = learner.profile;
          
          const userCanTeach = userProfile.skillsToTeach
            .filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString());
          
          const learnerWantsToLearn = learnerProfile.skillsToLearn
            ?.filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString()) || [];
          
          // Find skills that match
          const matchingSkills = userCanTeach.filter(skill => learnerWantsToLearn.includes(skill));
          
          for (const skill of matchingSkills) {
            const matchDetails = {
              matchType: 'alternative',
              skillToTeach: skill
            };
            
            const { score, scoreComponents } = calculateMatchScore(userProfile, learnerProfile, matchDetails);
            
            matches.push({
              user: userProfile.user,
              matchedUser: learner._id,
              matchType: 'alternative',
              skillToTeach: skill,
              score,
              scoreComponents
            });
          }
        } catch (error) {
          console.error(`Error processing learner match ${learner._id}:`, error);
        }
      }
    }
    
    console.log(`Created ${matches.length} alternative matches`);
    return matches;
  } catch (error) {
    console.error('Error in findAlternativeMatches:', error);
    return matches;
  }
};

/**
 * Find similar skill matches
 * @param {Object} user - User to find matches for
 * @returns {Array} - Array of match objects
 */
const findSimilarSkillMatches = async (user) => {
  const matches = [];
  
  // Get all skills the user wants to learn
  const userSkillsToLearn = user.skillsToLearn.map(s => s.skill);
  
  // For each skill, find related skills
  for (const skillId of userSkillsToLearn) {
    const skill = await Skill.findById(skillId).populate('relatedSkills');
    
    if (!skill || !skill.relatedSkills?.length) continue;
    
    // Get related skill IDs
    const relatedSkillIds = skill.relatedSkills.map(s => s._id);
    
    // Find users who can teach these related skills
    const teachersWithRelatedSkills = await User.find({
      _id: { $ne: user._id },
      role: { $in: ['teacher', 'both'] },
      'skillsToTeach.skill': { $in: relatedSkillIds }
    }).populate('skillsToTeach.skill');
    
    for (const teacher of teachersWithRelatedSkills) {
      const teacherSkills = teacher.skillsToTeach.map(s => s.skill.toString());
      
      // Find which related skills this teacher can teach
      const matchingRelatedSkills = relatedSkillIds
        .filter(id => teacherSkills.includes(id.toString()))
        .map(id => id.toString());
      
      for (const relatedSkill of matchingRelatedSkills) {
        const matchDetails = {
          matchType: 'similar',
          skillToLearn: relatedSkill,
          skillToTeach: null
        };
        
        const { score, scoreComponents } = calculateMatchScore(user, teacher, matchDetails);
        
        matches.push({
          user: user._id,
          matchedUser: teacher._id,
          matchType: 'similar',
          skillToLearn: relatedSkill,
          skillToTeach: null,
          score,
          scoreComponents
        });
      }
    }
  }
  
  return matches;
};

/**
 * Find group matches (multi-user exchange)
 * @param {Object} user - User to find matches for
 * @returns {Array} - Array of match objects
 */
const findGroupMatches = async (user) => {
  const matches = [];
  const maxChainLength = 3; // Maximum length of the exchange chain
  
  // Skip if user has no skills to learn or teach
  if (!user.skillsToLearn?.length || !user.skillsToTeach?.length) {
    return matches;
  }
  
  // Get all users except the current user
  const allUsers = await User.find({
    _id: { $ne: user._id }
  }).populate('skillsToLearn.skill skillsToTeach.skill');
  
  // Build a graph of skill exchanges
  const graph = {};
  
  // Add current user to the graph
  graph[user._id.toString()] = {
    user: user,
    canTeach: user.skillsToTeach.map(s => ({
      skill: s.skill,
      users: []
    })),
    wantsToLearn: user.skillsToLearn.map(s => ({
      skill: s.skill,
      users: []
    }))
  };
  
  // Add all other users to the graph
  for (const otherUser of allUsers) {
    graph[otherUser._id.toString()] = {
      user: otherUser,
      canTeach: otherUser.skillsToTeach.map(s => ({
        skill: s.skill,
        users: []
      })),
      wantsToLearn: otherUser.skillsToLearn.map(s => ({
        skill: s.skill,
        users: []
      }))
    };
  }
  
  // Build connections in the graph
  for (const userId in graph) {
    const userNode = graph[userId];
    
    // For each skill this user can teach
    for (const teachSkill of userNode.canTeach) {
      // Find users who want to learn this skill
      for (const otherUserId in graph) {
        if (otherUserId === userId) continue;
        
        const otherUserNode = graph[otherUserId];
        const otherUserWantsToLearn = otherUserNode.wantsToLearn.map(s => s.skill.toString());
        
        if (otherUserWantsToLearn.includes(teachSkill.skill.toString())) {
          teachSkill.users.push(otherUserId);
        }
      }
    }
    
    // For each skill this user wants to learn
    for (const learnSkill of userNode.wantsToLearn) {
      // Find users who can teach this skill
      for (const otherUserId in graph) {
        if (otherUserId === userId) continue;
        
        const otherUserNode = graph[otherUserId];
        const otherUserCanTeach = otherUserNode.canTeach.map(s => s.skill.toString());
        
        if (otherUserCanTeach.includes(learnSkill.skill.toString())) {
          learnSkill.users.push(otherUserId);
        }
      }
    }
  }
  
  // Find cycles in the graph (skill exchange chains)
  const findCycles = (startUserId, currentUserId, visited = new Set(), path = []) => {
    // Add current user to path and visited set
    path.push(currentUserId);
    visited.add(currentUserId);
    
    // Get current user node
    const currentUserNode = graph[currentUserId];
    
    // For each skill this user wants to learn
    for (const learnSkill of currentUserNode.wantsToLearn) {
      // For each user who can teach this skill
      for (const teacherUserId of learnSkill.users) {
        // If we've found a cycle back to the start user
        if (teacherUserId === startUserId && path.length >= 2) {
          // We've found a cycle, create a group match
          const cycle = [...path, startUserId];
          
          if (cycle.length <= maxChainLength + 1) { // +1 because we include the start user twice
            const matchDetails = {
              matchType: 'group',
              groupChain: cycle.map(id => mongoose.Types.ObjectId(id))
            };
            
            // Calculate score (average of all pairwise scores in the chain)
            let totalScore = 0;
            let totalComponents = {
              exactSkillMatch: 0,
              availabilityOverlap: 0,
              locationProximity: 0,
              preferredModeMatch: 0,
              userRating: 0
            };
            
            for (let i = 0; i < cycle.length - 1; i++) {
              const user1 = graph[cycle[i]].user;
              const user2 = graph[cycle[i + 1]].user;
              
              const { score, scoreComponents } = calculateMatchScore(user1, user2, { matchType: 'group' });
              totalScore += score;
              
              for (const component in scoreComponents) {
                totalComponents[component] += scoreComponents[component];
              }
            }
            
            const avgScore = totalScore / (cycle.length - 1);
            const avgComponents = {};
            for (const component in totalComponents) {
              avgComponents[component] = totalComponents[component] / (cycle.length - 1);
            }
            
            matches.push({
              user: user._id,
              matchedUser: graph[cycle[1]].user._id, // The next user in the chain
              matchType: 'group',
              groupChain: cycle.map(id => mongoose.Types.ObjectId(id)),
              score: avgScore,
              scoreComponents: avgComponents
            });
          }
        }
        // If we haven't visited this user yet and our path isn't too long
        else if (!visited.has(teacherUserId) && path.length < maxChainLength) {
          // Continue DFS
          findCycles(startUserId, teacherUserId, new Set(visited), [...path]);
        }
      }
    }
  };
  
  // Start DFS from the current user
  findCycles(user._id.toString(), user._id.toString());
  
  return matches;
};

/**
 * Generate matches for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const generateMatches = async (req, res) => {
  try {
    // Get userId from params or from the authenticated user
    let { userId } = req.params;
    
    // If userId is not provided in params, use the authenticated user's ID
    if (!userId && req.userId) {
      userId = req.userId;
      console.log(`Using authenticated user ID: ${userId}`);
    }
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    console.log(`Generating matches for user: ${userId}`);
    
    // Get user with profile populated
    const user = await User.findById(userId)
      .populate({
        path: 'profile',
        populate: [
          { path: 'skillsToLearn.skill' },
          { path: 'skillsToTeach.skill' }
        ]
      });
    
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has a profile
    if (!user.profile) {
      return res.status(400).json({ message: 'User profile not found. Please complete your profile before generating matches.' });
    }
    
    console.log(`User found: ${user.name}, Profile ID: ${user.profile._id}`);
    console.log(`Skills to learn: ${user.profile.skillsToLearn?.length}, Skills to teach: ${user.profile.skillsToTeach?.length}`);
    
    // Check if user has skills to learn or teach
    if (!user.profile.skillsToLearn?.length && !user.profile.skillsToTeach?.length) {
      return res.status(400).json({ 
        message: 'User has no skills to learn or teach. Please update your profile with skills before generating matches.' 
      });
    }
    
    // Delete existing matches for this user
    await Match.deleteMany({ user: userId });
    
    // Generate different types of matches
    let matches = [];
    
    // Use the profile for matching instead of the user directly
    const userProfile = user.profile;
    
    try {
      // 1. Try AI-based recommendations first (if user has successful matches)
      const aiMatches = await aiRecommendations.getAIRecommendations(userId);
      console.log(`AI matches found: ${aiMatches.length}`);
      
      if (aiMatches.length > 0) {
        // Convert AI matches to match objects
        for (const aiMatch of aiMatches) {
          const matchedUser = aiMatch.user;
          
          // Make sure the matched user has a profile
          if (!matchedUser.profile) continue;
          
          // Find matching skills
          const userWantsToLearn = userProfile.skillsToLearn
            .filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString());
          
          const userCanTeach = userProfile.skillsToTeach
            .filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString());
          
          const matchCanTeach = matchedUser.profile.skillsToTeach
            ?.filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString()) || [];
          
          const matchWantsToLearn = matchedUser.profile.skillsToLearn
            ?.filter(s => s.skill && s.skill._id)
            .map(s => s.skill._id.toString()) || [];
          
          // Check for direct match
          const skillsUserCanLearn = userWantsToLearn.filter(skill => matchCanTeach.includes(skill));
          const skillsUserCanTeach = userCanTeach.filter(skill => matchWantsToLearn.includes(skill));
          
          if (skillsUserCanLearn.length > 0 && skillsUserCanTeach.length > 0) {
            // For each pair of matching skills, create a match
            for (const learnSkill of skillsUserCanLearn) {
              for (const teachSkill of skillsUserCanTeach) {
                const matchDetails = {
                  matchType: 'direct',
                  skillToLearn: learnSkill,
                  skillToTeach: teachSkill
                };
                
                const { score, scoreComponents } = calculateMatchScore(userProfile, matchedUser.profile, matchDetails);
                
                // Boost score with AI similarity
                const boostedScore = score * (1 + (aiMatch.similarityScore / 200));
                
                matches.push({
                  user: user._id,
                  matchedUser: matchedUser._id,
                  matchType: 'direct',
                  skillToLearn: learnSkill,
                  skillToTeach: teachSkill,
                  score: boostedScore,
                  scoreComponents: {
                    ...scoreComponents,
                    aiRecommendation: aiMatch.similarityScore / 2 // Add AI component to score
                  }
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      // Continue with other matching methods
    }
    
    // 2. Find direct matches
    try {
      const directMatches = await findDirectMatches(userProfile);
      console.log(`Direct matches found: ${directMatches.length}`);
      matches = [...matches, ...directMatches];
    } catch (error) {
      console.error('Error finding direct matches:', error);
    }
    
    // 3. Find alternative matches
    try {
      const alternativeMatches = await findAlternativeMatches(userProfile);
      console.log(`Alternative matches found: ${alternativeMatches.length}`);
      matches = [...matches, ...alternativeMatches];
    } catch (error) {
      console.error('Error finding alternative matches:', error);
    }
    
    // 4. Find similar skill matches
    try {
      const similarMatches = await findSimilarSkillMatches(userProfile);
      console.log(`Similar matches found: ${similarMatches.length}`);
      matches = [...matches, ...similarMatches];
    } catch (error) {
      console.error('Error finding similar matches:', error);
    }
    
    // 5. Find group matches
    try {
      const groupMatches = await findGroupMatches(userProfile);
      console.log(`Group matches found: ${groupMatches.length}`);
      matches = [...matches, ...groupMatches];
    } catch (error) {
      console.error('Error finding group matches:', error);
    }
    
    console.log(`Total matches before filtering: ${matches.length}`);
    
    // 6. Apply location-based filtering based on user preference
    // Temporarily disable location filtering if it's causing issues
    let locationFilteredMatches = matches;
    if (userProfile.matchingMode === 'local' && userProfile.coordinates?.coordinates) {
      try {
        locationFilteredMatches = matches.filter(match => {
          // Get matched user
          const matchedUser = match.matchedUser;
          
          // Skip if matched user has no coordinates
          if (!matchedUser.profile?.coordinates?.coordinates) return false;
          
          // Calculate distance
          const distance = calculateDistance(
            userProfile.coordinates.coordinates,
            matchedUser.profile.coordinates.coordinates
          );
          
          // Check if within max distance
          return distance <= (userProfile.maxDistance || 50);
        });
        
        console.log(`Matches after location filtering: ${locationFilteredMatches.length}`);
        
        // If location filtering removed all matches, use the original matches
        if (locationFilteredMatches.length === 0 && matches.length > 0) {
          console.log('Location filtering removed all matches, using original matches');
          locationFilteredMatches = matches;
        }
      } catch (error) {
        console.error('Error applying location filtering:', error);
        locationFilteredMatches = matches; // Use original matches if filtering fails
      }
    }
    
    // Remove duplicates (same user, different skills)
    const uniqueMatches = [];
    const matchedUserIds = new Set();
    
    for (const match of locationFilteredMatches) {
      if (!matchedUserIds.has(match.matchedUser.toString())) {
        uniqueMatches.push(match);
        matchedUserIds.add(match.matchedUser.toString());
      }
    }
    
    console.log(`Unique matches: ${uniqueMatches.length}`);
    
    // Save matches to database
    if (uniqueMatches.length > 0) {
      try {
        await Match.insertMany(uniqueMatches);
        console.log(`Saved ${uniqueMatches.length} matches to database`);
      } catch (error) {
        console.error('Error saving matches to database:', error);
        // If there's an error with bulk insert, try inserting one by one
        for (const match of uniqueMatches) {
          try {
            await Match.create(match);
          } catch (innerError) {
            console.error(`Error saving match: ${innerError.message}`);
          }
        }
      }
    }
    
    // Get saved matches with populated fields
    const savedMatches = await Match.find({ user: userId })
      .populate({
        path: 'matchedUser',
        select: 'name email',
        populate: {
          path: 'profile',
          select: 'profilePic title location work preferredMode rating'
        }
      })
      .populate('skillToLearn skillToTeach')
      .populate({
        path: 'groupChain',
        select: 'name',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      });
    
    console.log(`Retrieved ${savedMatches.length} saved matches`);
    
    // Return matches
    return res.status(200).json({
      matches: savedMatches,
      count: savedMatches.length
    });
  } catch (error) {
    console.error('Error generating matches:', error);
    return res.status(500).json({ message: 'Error generating matches', error: error.message });
  }
};

/**
 * Get matches for a user
 * @param {String} userId - User ID to get matches for
 * @returns {Array} - Array of match objects
 */
export const getMatches = async (req, res) => {
  try {
    // Get userId from params or from the authenticated user
    let { userId } = req.params;
    
    // If userId is not provided in params, use the authenticated user's ID
    if (!userId && req.userId) {
      userId = req.userId;
      console.log(`Using authenticated user ID: ${userId}`);
    }
    
    console.log(`Getting matches for user: ${userId}`);
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get matches for user, sorted by score
    const matches = await Match.find({ user: userId })
      .sort({ score: -1 })
      .populate({
        path: 'matchedUser',
        select: 'name email',
        populate: {
          path: 'profile',
          select: 'profilePic title location work preferredMode rating role verificationStatus'
        }
      })
      .populate('skillToLearn skillToTeach')
      .populate({
        path: 'groupChain',
        select: 'name',
        populate: {
          path: 'profile',
          select: 'profilePic'
        }
      });
    
    console.log(`Found ${matches.length} matches for user ${userId}`);
    
    // If no matches found, try to generate matches
    if (matches.length === 0) {
      console.log(`No matches found for user ${userId}, suggesting to generate matches`);
      return res.status(200).json([]);
    }
    
    return res.status(200).json(matches);
  } catch (error) {
    console.error('Error getting matches:', error);
    return res.status(500).json({ message: 'Error getting matches', error: error.message });
  }
};

/**
 * Update match status
 * @param {String} matchId - Match ID to update
 * @param {String} status - New status
 * @returns {Object} - Updated match
 */
export const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status } = req.body;
    
    // Validate match ID
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    // Validate status
    if (!['pending', 'connected', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Update match
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { status },
      { new: true }
    );
    
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    return res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Error updating match status:', error);
    return res.status(500).json({ message: 'Error updating match status' });
  }
};

/**
 * Submit feedback for a match
 * @param {String} matchId - Match ID to submit feedback for
 * @param {Object} feedback - Feedback object
 * @returns {Object} - Updated match
 */
export const submitMatchFeedback = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { rating, comment } = req.body;
    
    // Validate match ID
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ message: 'Invalid match ID' });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Update match
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      { 
        feedback: {
          rating,
          comment,
          submittedAt: new Date()
        },
        isSuccessful: rating >= 3 // Consider successful if rating is 3 or higher
      },
      { new: true }
    );
    
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // If match was successful, update user ratings and successful matches
    if (updatedMatch.isSuccessful) {
      // Get both users
      const user = await User.findById(updatedMatch.user);
      const matchedUser = await User.findById(updatedMatch.matchedUser);
      
      if (user && matchedUser) {
        // Update user's successful matches
        if (!user.successfulMatches.includes(matchedUser._id)) {
          user.successfulMatches.push(matchedUser._id);
          await user.save();
        }
        
        // Update matched user's successful matches
        if (!matchedUser.successfulMatches.includes(user._id)) {
          matchedUser.successfulMatches.push(user._id);
          await matchedUser.save();
        }
        
        // Update matched user's rating
        const existingRating = matchedUser.rating || 0;
        const newRating = (existingRating + rating) / 2; // Simple average
        matchedUser.rating = newRating;
        await matchedUser.save();
      }
    }
    
    return res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Error submitting match feedback:', error);
    return res.status(500).json({ message: 'Error submitting match feedback' });
  }
};

/**
 * Get learning path for a skill
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getLearningPath = async (req, res) => {
  try {
    const { skillId } = req.params;
    
    // Validate skill ID
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }
    
    // Get learning path
    const learningPath = await aiRecommendations.getLearningPathRecommendations(skillId);
    
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    
    return res.status(200).json(learningPath);
  } catch (error) {
    console.error('Error getting learning path:', error);
    return res.status(500).json({ message: 'Error getting learning path' });
  }
};

/**
 * Get trending skills
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getTrendingSkillsEndpoint = async (req, res) => {
  try {
    const { limit } = req.query;
    
    // Get trending skills
    const trendingSkills = await getTrendingSkills(limit ? parseInt(limit) : 10);
    
    return res.status(200).json(trendingSkills);
  } catch (error) {
    console.error('Error getting trending skills:', error);
    return res.status(500).json({ message: 'Error getting trending skills' });
  }
};

/**
 * Get personalized skill recommendations
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get personalized recommendations
    const recommendations = await getPersonalizedSkillRecommendations(
      userId,
      limit ? parseInt(limit) : 5
    );
    
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return res.status(500).json({ message: 'Error getting personalized recommendations' });
  }
};

/**
 * Auto-recommend new matches when they become available
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const subscribeToMatchUpdates = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user to receive match notifications
    await User.findByIdAndUpdate(userId, {
      $set: { receiveMatchNotifications: true }
    });
    
    return res.status(200).json({ message: 'Successfully subscribed to match updates' });
  } catch (error) {
    console.error('Error subscribing to match updates:', error);
    return res.status(500).json({ message: 'Error subscribing to match updates' });
  }
};

/**
 * Unsubscribe from match updates
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const unsubscribeFromMatchUpdates = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Update user to not receive match notifications
    await User.findByIdAndUpdate(userId, {
      $set: { receiveMatchNotifications: false }
    });
    
    return res.status(200).json({ message: 'Successfully unsubscribed from match updates' });
  } catch (error) {
    console.error('Error unsubscribing from match updates:', error);
    return res.status(500).json({ message: 'Error unsubscribing from match updates' });
  }
};

export default {
  generateMatches,
  getMatches,
  updateMatchStatus,
  submitMatchFeedback,
  getLearningPath,
  getTrendingSkillsEndpoint,
  getPersonalizedRecommendations,
  subscribeToMatchUpdates,
  unsubscribeFromMatchUpdates
}; 