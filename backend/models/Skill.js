import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    aliases: [{
      type: String,
      trim: true
    }],
    category: {
      type: String,
      required: true,
      trim: true
    },
    subcategory: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    relatedSkills: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }],
    popularity: {
      type: Number,
      default: 0
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  { timestamps: true }
);

// Create text index for search
skillSchema.index({ name: 'text', aliases: 'text', category: 'text', subcategory: 'text', description: 'text' });

const Skill = mongoose.model("Skill", skillSchema);
export default Skill; 