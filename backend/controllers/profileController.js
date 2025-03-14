import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { processSkillsArray } from '../utils/skillUtils.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUtil.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create the profile
    let profile = null;
    if (user.profile) {
      // If user has a profile, get it with populated skills
      profile = await Profile.findById(user.profile)
        .populate('skillsToLearn.skill')
        .populate('skillsToTeach.skill');
    } else {
      // If user doesn't have a profile, create one
      profile = new Profile({
        user: user._id,
        name: user.name,
        email: user.email
      });
      await profile.save();

      // Update user with profile reference
      user.profile = profile._id;
      await user.save();
    }

    // Return combined user and profile data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      ...profile.toObject()
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    console.log('Updating profile with request body:', JSON.stringify(req.body));
    console.log('Files in request:', req.files ? Object.keys(req.files) : 'No files');
    
    const { 
      role, 
      sessionsTaught, 
      points, 
      badges, 
      skillsToLearn, 
      skillsToTeach,
      ...updateData 
    } = req.body;
    
    // Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create the profile
    let profile = null;
    if (user.profile) {
      profile = await Profile.findById(user.profile);
    } else {
      profile = new Profile({
        user: user._id,
      });
      // Save the profile and update the user
      await profile.save();
      user.profile = profile._id;
      await user.save();
    }
    
    // Process skills if provided
    const updateFields = { ...updateData };
    
    // Only include role if it's provided and valid
    // If we're uploading files, preserve the existing role unless explicitly changed
    const isFileUpload = req.files && Object.keys(req.files).length > 0;
    if (role && ['teacher', 'learner', 'both'].includes(role)) {
      updateFields.role = role;
    } else if (isFileUpload && profile.role) {
      // For file uploads, preserve the existing role if not explicitly provided
      console.log('Preserving existing role during file upload:', profile.role);
      updateFields.role = profile.role;
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
    
    console.log('Updating profile with fields:', updateFields);
    
    // Update the profile
    Object.assign(profile, updateFields);
    
    // Handle file uploads if any
    if (req.files) {
      console.log('Processing file uploads');
      
      // Handle certificates
      if (req.files.certificates && req.files.certificates.length > 0) {
        console.log(`Processing ${req.files.certificates.length} certificates`);
        const certificateUrls = [];
        
        for (const file of req.files.certificates) {
          console.log(`Uploading certificate: ${file.originalname}`);
          console.log('Certificate buffer size:', file.buffer.length);
          
          try {
            // Check if the file buffer is valid
            if (!file.buffer || file.buffer.length === 0) {
              console.error('Invalid certificate file buffer');
              continue;
            }
            
            const result = await uploadBufferToCloudinary(
              file.buffer,
              'skillxchange/certificates'
            );
            
            if (!result || !result.secure_url) {
              console.error('Failed to get secure URL from Cloudinary for certificate');
              continue;
            }
            
            console.log('Certificate upload result:', result.secure_url);
            certificateUrls.push(result.secure_url);
          } catch (error) {
            console.error('Error uploading certificate:', error);
          }
        }
        
        if (certificateUrls.length > 0) {
          profile.certificates = certificateUrls;
          profile.verificationStatus = 'pending'; // Set status to pending on certificate upload
        }
      }
      
      // Handle experience certificate
      if (req.files.experienceCertificate && req.files.experienceCertificate.length > 0) {
        console.log('Processing experience certificate');
        const file = req.files.experienceCertificate[0];
        console.log(`Uploading experience certificate: ${file.originalname}`);
        console.log('Experience certificate buffer size:', file.buffer.length);
        
        try {
          // Check if the file buffer is valid
          if (!file.buffer || file.buffer.length === 0) {
            console.error('Invalid experience certificate file buffer');
          } else {
            const result = await uploadBufferToCloudinary(
              file.buffer,
              'skillxchange/experience_certificates'
            );
            
            if (!result || !result.secure_url) {
              console.error('Failed to get secure URL from Cloudinary for experience certificate');
            } else {
              console.log('Experience certificate upload result:', result.secure_url);
              
              // Add to verified skills
              if (!profile.verifiedSkills) {
                profile.verifiedSkills = [];
              }
              
              profile.verifiedSkills.push({
                verificationMethod: 'certificate',
                verificationProof: result.secure_url,
                verificationStatus: 'pending'
              });
              
              profile.verificationStatus = 'pending';
            }
          }
        } catch (error) {
          console.error('Error uploading experience certificate:', error);
        }
      }
    }
    
    // Update other fields if provided
    if (sessionsTaught !== undefined) {
      profile.sessionsTaught = sessionsTaught;
    }
    
    if (points !== undefined) {
      profile.points = points;
    }
    
    if (badges) {
      profile.badges = badges;
    }
    
    // Save the updated profile
    await profile.save();
    
    // Fetch the updated profile with populated skills
    const updatedProfile = await Profile.findById(profile._id)
      .populate('skillsToLearn.skill')
      .populate('skillsToTeach.skill');
      
    // Return combined user and profile data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      ...updatedProfile.toObject()
    };
      
    res.json(userData);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack
    });
  }
};

// Update profile picture
export const updateProfilePicture = async (req, res) => {
  try {
    console.log('Updating profile picture');
    console.log('File in request:', req.file ? req.file.originalname : 'No file');
    console.log('Body in request:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find or create the profile
    let profile = null;
    if (user.profile) {
      profile = await Profile.findById(user.profile);
    } else {
      profile = new Profile({
        user: user._id,
      });
      // Save the profile and update the user
      await profile.save();
      user.profile = profile._id;
      await user.save();
    }
    
    // Preserve the role if it's provided in the request body
    const { role } = req.body;
    if (role && ['teacher', 'learner', 'both'].includes(role)) {
      console.log('Preserving role from request body:', role);
      profile.role = role;
    } else if (profile.role) {
      console.log('Preserving existing role during profile picture upload:', profile.role);
      // Role is already set in the profile, no need to update
    }
    
    // Upload the profile picture to Cloudinary
    try {
      console.log(`Uploading profile picture: ${req.file.originalname}`);
      console.log('File buffer size:', req.file.buffer.length);
      
      // Check if the file buffer is valid
      if (!req.file.buffer || req.file.buffer.length === 0) {
        throw new Error('Invalid file buffer');
      }
      
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        'skillxchange/profile_pictures'
      );
      console.log('Profile picture upload result:', result);
      
      if (!result || !result.secure_url) {
        throw new Error('Failed to get secure URL from Cloudinary');
      }
      
      // Update the profile with the Cloudinary URL
      profile.profilePic = result.secure_url;
      await profile.save();
      
      // Return combined user and profile data
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        ...profile.toObject()
      };
      
      res.json(userData);
    } catch (error) {
      console.error('Error uploading profile picture to Cloudinary:', error);
      return res.status(500).json({ 
        message: 'Error uploading profile picture', 
        error: error.message,
        stack: error.stack
      });
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack
    });
  }
};