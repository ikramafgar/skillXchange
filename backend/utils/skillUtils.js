import Skill from '../models/Skill.js';

/**
 * Find or create a skill by name
 * @param {String} skillName - Name of the skill
 * @returns {Promise<Object>} - Skill document
 */
export const findOrCreateSkill = async (skillName) => {
  try {
    // Try to find the skill by name
    let skill = await Skill.findOne({ name: skillName });
    
    // If skill doesn't exist, create it
    if (!skill) {
      skill = new Skill({
        name: skillName,
        category: 'Other', // Default category
        popularity: 1 // Start with popularity of 1
      });
      await skill.save();
    } else {
      // Increment popularity if skill exists
      skill.popularity += 1;
      await skill.save();
    }
    
    return skill;
  } catch (error) {
    console.error('Error finding or creating skill:', error);
    throw error;
  }
};

/**
 * Process an array of skill names into skill objects
 * @param {Array} skillNames - Array of skill names or skill objects
 * @param {String} level - Skill level (for skillsToLearn or skillsToTeach)
 * @returns {Promise<Array>} - Array of skill objects
 */
export const processSkillsArray = async (skillNames, level = 'beginner') => {
  try {
    console.log('Processing skills array:', skillNames, 'with level:', level);
    
    if (!skillNames) {
      console.log('No skill names provided, returning empty array');
      return [];
    }
    
    // Handle string input
    if (typeof skillNames === 'string') {
      skillNames = skillNames.split(',').map(s => s.trim()).filter(s => s);
    }
    
    // Ensure skillNames is an array
    if (!Array.isArray(skillNames)) {
      console.log('skillNames is not an array, returning empty array');
      return [];
    }
    
    // Check if we're dealing with existing skill objects (with ObjectIds)
    // This is the case when the frontend sends back the existing skills
    const hasExistingSkills = skillNames.some(item => 
      item && typeof item === 'object' && (item.skill || item._id)
    );
    
    if (hasExistingSkills) {
      console.log('Processing existing skill objects');
      // Return the existing skill objects as they are
      return skillNames.map(item => {
        // If it's already in the correct format, return it as is
        if (item && typeof item === 'object' && item.skill && item.level) {
          return item;
        }
        // If it has _id but not in the correct format, convert it
        if (item && typeof item === 'object' && item._id) {
          return {
            skill: item._id,
            level: item.level || level
          };
        }
        // If it has skill property but not in the correct format
        if (item && typeof item === 'object' && item.skill) {
          return {
            skill: item.skill,
            level: item.level || level
          };
        }
        return null;
      }).filter(Boolean);
    }
    
    // Filter out any non-string or empty items
    const validSkillNames = skillNames
      .map(item => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object' && item.name) return item.name.trim();
        return null;
      })
      .filter(Boolean);
    
    console.log('Valid skill names after filtering:', validSkillNames);
    
    if (validSkillNames.length === 0) {
      return [];
    }
    
    const skillObjects = await Promise.all(
      validSkillNames.map(async (skillName) => {
        try {
          const skill = await findOrCreateSkill(skillName);
          return {
            skill: skill._id,
            level
          };
        } catch (error) {
          console.error(`Error processing skill "${skillName}":`, error);
          return null;
        }
      })
    );
    
    // Filter out any null values from errors
    return skillObjects.filter(Boolean);
  } catch (error) {
    console.error('Error processing skills array:', error);
    return []; // Return empty array instead of throwing error
  }
};

export default {
  findOrCreateSkill,
  processSkillsArray
}; 