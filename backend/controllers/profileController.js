import User from '../models/User.js';
import { processSkillsArray } from '../utils/skillUtils.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('skillsToLearn.skill')
      .populate('skillsToTeach.skill');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log('Updating profile with request body:', JSON.stringify(req.body));
    
    const { 
      role, 
      sessionsTaught, 
      points, 
      badges, 
      skillsToLearn, 
      skillsToTeach,
      ...updateData 
    } = req.body;
    
    // Process skills if provided
    const updateFields = { ...updateData };
    
    // Only include role if it's provided and valid
    if (role && ['teacher', 'learner', 'both'].includes(role)) {
      updateFields.role = role;
    }
    
    // Process skillsToLearn if provided
    if (skillsToLearn !== undefined) {
      try {
        // Check if we're dealing with an array of existing skill objects
        const isExistingSkills = Array.isArray(skillsToLearn) && 
          skillsToLearn.length > 0 && 
          typeof skillsToLearn[0] === 'object' &&
          (skillsToLearn[0].skill || skillsToLearn[0]._id);
          
        if (isExistingSkills) {
          console.log('Using existing skillsToLearn objects');
          updateFields.skillsToLearn = skillsToLearn;
        } else {
          updateFields.skillsToLearn = await processSkillsArray(
            skillsToLearn, 
            'beginner'
          );
        }
      } catch (error) {
        console.error('Error processing skillsToLearn:', error);
        // Don't include skillsToLearn in the update if there's an error
      }
    }
    
    // Process skillsToTeach if provided
    if (skillsToTeach !== undefined) {
      try {
        // Check if we're dealing with an array of existing skill objects
        const isExistingSkills = Array.isArray(skillsToTeach) && 
          skillsToTeach.length > 0 && 
          typeof skillsToTeach[0] === 'object' &&
          (skillsToTeach[0].skill || skillsToTeach[0]._id);
          
        if (isExistingSkills) {
          console.log('Using existing skillsToTeach objects');
          updateFields.skillsToTeach = skillsToTeach;
        } else {
          updateFields.skillsToTeach = await processSkillsArray(
            skillsToTeach, 
            'intermediate'
          );
        }
      } catch (error) {
        console.error('Error processing skillsToTeach:', error);
        // Don't include skillsToTeach in the update if there's an error
      }
    }
    
    console.log('Updating user with fields:', updateFields);
    
    // Update the user but don't return the updated document yet
    let user = await User.findByIdAndUpdate(
      req.userId, 
      updateFields
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.files && req.files.certificates) {
      user.certificates = req.files.certificates.map(file => file.path);
      user.verificationStatus = 'pending'; // Set status to pending on certificate upload
    }
    
    if (req.files && req.files.experienceCertificate) {
      user.experienceCertificate = req.files.experienceCertificate[0].path;
      user.verificationStatus = 'pending'; // Set status to pending on experience certificate upload
    }
    
    if (sessionsTaught !== undefined) {
      user.sessionsTaught = sessionsTaught;
    }
    
    if (points !== undefined) {
      user.points = points;
    }
    
    if (badges) {
      user.badges = badges;
    }
    
    await user.save();
    
    // Fetch the updated user with populated skills
    const updatedUser = await User.findById(req.userId)
      .populate('skillsToLearn.skill')
      .populate('skillsToTeach.skill');
      
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture: req.file.path },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};