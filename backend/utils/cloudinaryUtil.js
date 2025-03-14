import dotenv from 'dotenv';
import pkg from 'cloudinary';
const { v2: cloudinaryV2 } = pkg;
import { Readable } from 'stream';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} folder - Folder in Cloudinary to store the file
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadBufferToCloudinary = async (fileBuffer, folder = 'skillxchange') => {
  try {
    // Convert buffer to base64 string for Cloudinary
    const base64String = fileBuffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64String}`;
    
    // Upload to Cloudinary
    const result = await cloudinaryV2.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto'
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export default cloudinaryV2; 