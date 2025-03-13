import { processSkillsArray } from '../utils/skillUtils.js';

/**
 * Middleware to validate and process skills in request body
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validateSkills = async (req, res, next) => {
  try {
    console.log('Validating skills with request body:', JSON.stringify(req.body));
    
    const { skillsToLearn, skillsToTeach } = req.body;
    
    // Initialize with empty arrays by default
    req.body.skillsToLearn = [];
    req.body.skillsToTeach = [];
    
    // Process skillsToLearn if provided
    if (skillsToLearn) {
      try {
        // Handle different formats (string, array of strings, array of objects)
        if (typeof skillsToLearn === 'string' && skillsToLearn.trim() !== '') {
          // Convert comma-separated string to array
          req.body.skillsToLearn = await processSkillsArray(
            skillsToLearn.split(',').map(s => s.trim()).filter(s => s), 
            'beginner'
          );
        } else if (Array.isArray(skillsToLearn)) {
          if (skillsToLearn.length > 0) {
            if (typeof skillsToLearn[0] === 'string') {
              // Array of strings
              req.body.skillsToLearn = await processSkillsArray(
                skillsToLearn.filter(s => s && s.trim()), 
                'beginner'
              );
            } else if (typeof skillsToLearn[0] === 'object' && skillsToLearn[0] !== null) {
              if (!skillsToLearn[0].skill) {
                // Array of objects without proper structure
                req.body.skillsToLearn = await processSkillsArray(
                  skillsToLearn.map(s => (s && (s.name || s.toString()))).filter(s => s && s.trim()), 
                  'beginner'
                );
              } else {
                // If it's already in the correct format (array of objects with skill field), use it
                req.body.skillsToLearn = skillsToLearn;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing skillsToLearn:', error);
        // Continue without failing the request
      }
    }
    
    // Process skillsToTeach if provided
    if (skillsToTeach) {
      try {
        // Handle different formats (string, array of strings, array of objects)
        if (typeof skillsToTeach === 'string' && skillsToTeach.trim() !== '') {
          // Convert comma-separated string to array
          req.body.skillsToTeach = await processSkillsArray(
            skillsToTeach.split(',').map(s => s.trim()).filter(s => s), 
            'intermediate'
          );
        } else if (Array.isArray(skillsToTeach)) {
          if (skillsToTeach.length > 0) {
            if (typeof skillsToTeach[0] === 'string') {
              // Array of strings
              req.body.skillsToTeach = await processSkillsArray(
                skillsToTeach.filter(s => s && s.trim()), 
                'intermediate'
              );
            } else if (typeof skillsToTeach[0] === 'object' && skillsToTeach[0] !== null) {
              if (!skillsToTeach[0].skill) {
                // Array of objects without proper structure
                req.body.skillsToTeach = await processSkillsArray(
                  skillsToTeach.map(s => (s && (s.name || s.toString()))).filter(s => s && s.trim()), 
                  'intermediate'
                );
              } else {
                // If it's already in the correct format (array of objects with skill field), use it
                req.body.skillsToTeach = skillsToTeach;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing skillsToTeach:', error);
        // Continue without failing the request
      }
    }
    
    console.log('Skills validation complete. Processed skills:', {
      skillsToLearn: req.body.skillsToLearn,
      skillsToTeach: req.body.skillsToTeach
    });
    
    next();
  } catch (error) {
    console.error('Skill validation error:', error);
    // Don't fail the request, just log the error and continue
    next();
  }
}; 