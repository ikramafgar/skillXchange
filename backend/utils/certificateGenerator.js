import { format } from 'date-fns';

/**
 * Generates a certificate PDF for a completed skill course
 * @param {Object} certificate - The certificate object with populated relations
 * @returns {Promise<string>} - The URL to the generated certificate
 */
export const generateCertificatePDF = async (certificate) => {
  try {
    console.log('Generating certificate PDF for:', certificate._id);
    
    // Do not use AWS S3 bucket URL here 
    // Return ONLY the API endpoint
    const certificateUrl = `api/certificates/${certificate._id}/download`;
    
    console.log('Generated certificate URL:', certificateUrl);
    return certificateUrl;
    
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
}; 