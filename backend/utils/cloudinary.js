import dotenv from 'dotenv';
import pkg from 'cloudinary';
const { v2: cloudinary } = pkg;

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Path to the file to upload
 * @param {string} folder - Folder in Cloudinary to store the file
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'skillxchange') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} folder - Folder in Cloudinary to store the file
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadBufferToCloudinary = async (fileBuffer, folder = 'skillxchange') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading buffer to Cloudinary:', error);
    throw new Error('Failed to upload file buffer to Cloudinary');
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

export default cloudinary; 