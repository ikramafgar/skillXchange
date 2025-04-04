import Skill from '../models/Skill.js';
import mongoose from 'mongoose';

// Get all skills
export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching skills'
    });
  }
};

// Get a single skill by ID
export const getSkillById = async (req, res) => {
  try {
    const { skillId } = req.params;
    
    // Validate skill ID
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format'
      });
    }
    
    // Find skill by ID
    const skill = await Skill.findById(skillId);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    res.status(200).json({
      success: true,
      skill
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching skill'
    });
  }
};

// Search skills by name, category, or description
export const searchSkills = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Search using MongoDB text index or regex
    const skills = await Skill.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subcategory: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ popularity: -1 });
    
    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    console.error('Error searching skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching skills'
    });
  }
};

// Create a new skill
export const createSkill = async (req, res) => {
  try {
    const { name, category, subcategory, description } = req.body;
    
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required fields'
      });
    }
    
    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'A skill with this name already exists'
      });
    }
    
    // Create new skill
    const skill = new Skill({
      name,
      category,
      subcategory: subcategory || '',
      description: description || '',
      popularity: 1
    });
    
    await skill.save();
    
    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating skill'
    });
  }
};

// Get trending skills based on popularity
export const getTrendingSkills = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get skills sorted by popularity
    const skills = await Skill.find()
      .sort({ popularity: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    console.error('Error fetching trending skills:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending skills'
    });
  }
}; 