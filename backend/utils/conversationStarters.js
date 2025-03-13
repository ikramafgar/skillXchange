import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Match from '../models/Match.js';

/**
 * Generate conversation starters based on user profiles and match context
 * @param {String} userId - First user ID
 * @param {String} otherUserId - Second user ID
 * @param {String} matchId - Optional match ID for context
 * @returns {Array} - Array of conversation starter suggestions
 */
export const generateConversationStarters = async (userId, otherUserId, matchId = null) => {
  // Get user profiles
  const user = await User.findById(userId)
    .populate('skillsToLearn.skill skillsToTeach.skill');
  
  const otherUser = await User.findById(otherUserId)
    .populate('skillsToLearn.skill skillsToTeach.skill');
  
  if (!user || !otherUser) {
    return [];
  }
  
  const starters = [];
  
  // Get match details if provided
  let match = null;
  if (matchId) {
    match = await Match.findById(matchId)
      .populate('skillToLearn skillToTeach');
  }
  
  // 1. Skill-based starters
  if (match) {
    // If there's a specific match context
    if (match.matchType === 'direct') {
      // Direct match (both teaching and learning)
      const skillToLearn = match.skillToLearn?.name;
      const skillToTeach = match.skillToTeach?.name;
      
      if (skillToLearn) {
        starters.push(
          `I'm excited to learn ${skillToLearn} from you! What's your approach to teaching it?`,
          `What do you think is the best way for a beginner to start learning ${skillToLearn}?`,
          `How did you first get started with ${skillToLearn}?`
        );
      }
      
      if (skillToTeach) {
        starters.push(
          `I'd be happy to help you learn ${skillToTeach}. What specific aspects are you most interested in?`,
          `What's your current experience level with ${skillToTeach}?`,
          `Do you have any specific goals you want to achieve with ${skillToTeach}?`
        );
      }
    } else if (match.matchType === 'alternative') {
      // One-way match
      const skillToLearn = match.skillToLearn?.name;
      const skillToTeach = match.skillToTeach?.name;
      
      if (skillToLearn) {
        starters.push(
          `I'm looking forward to learning ${skillToLearn} from you. How long have you been practicing it?`,
          `What resources would you recommend for someone starting to learn ${skillToLearn}?`,
          `What's the most challenging aspect of ${skillToLearn} in your experience?`
        );
      }
      
      if (skillToTeach) {
        starters.push(
          `I noticed you're interested in learning ${skillToTeach}. What made you want to pick up this skill?`,
          `I'd be happy to share my knowledge of ${skillToTeach}. What's your learning style?`,
          `What aspects of ${skillToTeach} are you most curious about?`
        );
      }
    } else if (match.matchType === 'similar') {
      // Similar skill match
      const skillToLearn = match.skillToLearn?.name;
      
      if (skillToLearn) {
        starters.push(
          `I see you're skilled in ${skillToLearn}, which is similar to what I want to learn. How do these skills complement each other?`,
          `How transferable do you find your knowledge of ${skillToLearn} to related fields?`,
          `What's your favorite aspect of working with ${skillToLearn}?`
        );
      }
    } else if (match.matchType === 'group') {
      // Group exchange
      starters.push(
        "I'm excited about our skill exchange group! What are you most looking forward to learning?",
        "How do you think we can best organize our group learning sessions?",
        "What times generally work best for you for our skill exchange sessions?"
      );
    }
  } else {
    // General skill-based starters without specific match context
    const userTeachingSkills = user.skillsToTeach?.map(s => s.skill.name) || [];
    const userLearningSkills = user.skillsToLearn?.map(s => s.skill.name) || [];
    const otherTeachingSkills = otherUser.skillsToTeach?.map(s => s.skill.name) || [];
    const otherLearningSkills = otherUser.skillsToLearn?.map(s => s.skill.name) || [];
    
    // Find overlaps
    const userCanTeachOtherWantsToLearn = userTeachingSkills.filter(skill => 
      otherLearningSkills.includes(skill)
    );
    
    const userWantsToLearnOtherCanTeach = userLearningSkills.filter(skill => 
      otherTeachingSkills.includes(skill)
    );
    
    if (userCanTeachOtherWantsToLearn.length > 0) {
      const skill = userCanTeachOtherWantsToLearn[0];
      starters.push(
        `I noticed you're interested in learning ${skill}. I'd be happy to share my knowledge!`,
        `What aspects of ${skill} are you most interested in exploring?`,
        `How much experience do you already have with ${skill}?`
      );
    }
    
    if (userWantsToLearnOtherCanTeach.length > 0) {
      const skill = userWantsToLearnOtherCanTeach[0];
      starters.push(
        `I'm really interested in learning ${skill} from you. How did you become proficient in it?`,
        `What do you think is the most important concept to understand when learning ${skill}?`,
        `Would you be open to sharing some resources that helped you learn ${skill}?`
      );
    }
  }
  
  // 2. Location-based starters
  if (user.location && otherUser.location) {
    if (user.location === otherUser.location) {
      starters.push(
        `I see we're both in ${user.location}! Do you have any favorite spots to work or study?`,
        `Since we're both in ${user.location}, would you prefer meeting in person for our skill exchange?`,
        `Any good cafes or coworking spaces in ${user.location} you'd recommend for our sessions?`
      );
    } else {
      starters.push(
        `I'm in ${user.location} and noticed you're in ${otherUser.location}. How's the learning community there?`,
        `Since we're in different locations, what online tools do you prefer for remote collaboration?`,
        `What's the tech/learning scene like in ${otherUser.location}?`
      );
    }
  }
  
  // 3. Experience-based starters
  if (otherUser.work) {
    starters.push(
      `I noticed you work in ${otherUser.work}. How does that relate to the skills you're teaching?`,
      `Your experience in ${otherUser.work} sounds interesting! How did you get started in that field?`,
      `Does your work in ${otherUser.work} give you a unique perspective on the skills you're sharing?`
    );
  }
  
  // 4. Learning style starters
  starters.push(
    "What's your preferred learning style? Do you learn better with visual aids, hands-on practice, or discussions?",
    "How much time do you typically have available for our skill exchange sessions?",
    "Do you prefer structured learning with specific goals or a more exploratory approach?"
  );
  
  // 5. Scheduling starters
  starters.push(
    "When would be a good time for our first learning session?",
    "Would you prefer regular scheduled sessions or a more flexible arrangement?",
    "How long do you think would be ideal for our learning sessions?"
  );
  
  // 6. Goal-oriented starters
  starters.push(
    "What specific goals are you hoping to achieve through our skill exchange?",
    "Is there a particular project you're working on that these skills would help with?",
    "What timeline are you thinking about for achieving your learning objectives?"
  );
  
  // Shuffle and return a subset of starters
  return shuffleArray(starters).slice(0, 5);
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default {
  generateConversationStarters
}; 