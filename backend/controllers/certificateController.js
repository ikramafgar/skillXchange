import Certificate from '../models/Certificate.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';
import { generateCertificatePDF } from '../utils/certificateGenerator.js';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for the current module (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a simple certificate ID without using uuid
const generateCertificateId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}${randomStr}`;
};

// Check if a user is eligible for a certificate
export const checkEligibility = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`[Certificate] Checking eligibility for user: ${userId}`);
    
    // Log the search criteria
    console.log(`[Certificate] Searching for sessions with learner=${userId} and status='completed'`);
    
    // Find completed sessions where the user was a learner
    const completedSessions = await Session.find({
      learner: userId,
      status: 'completed'
    }).populate('skill').populate('teacher', 'name');
    
    console.log(`[Certificate] Found ${completedSessions.length} completed sessions for user`);
    
    // Log the session IDs and related data for debugging
    if (completedSessions.length > 0) {
      console.log('[Certificate] Session details:');
      completedSessions.forEach((session, index) => {
        console.log(`[Certificate] Session ${index + 1}:`, {
          id: session._id,
          skillId: session.skill?._id,
          skillName: session.skill?.name,
          teacherId: session.teacher?._id,
          teacherName: session.teacher?.name,
          status: session.status,
          startTime: session.startTime
        });
      });
    } else {
      // No sessions found - check if there are any sessions at all for this user
      console.log('[Certificate] No completed sessions found. Checking for any sessions...');
      const anyUserSessions = await Session.countDocuments({ learner: userId });
      console.log(`[Certificate] Total sessions for user (any status): ${anyUserSessions}`);
      
      if (anyUserSessions > 0) {
        // Check different session statuses
        const sessionsByStatus = await Session.aggregate([
          { $match: { learner: userId } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        console.log('[Certificate] Sessions by status:', sessionsByStatus);
      }
    }
    
    // Group sessions by skill
    const sessionsBySkill = {};
    
    completedSessions.forEach(session => {
      if (!session.skill) {
        console.log(`[Certificate] Warning: Session ${session._id} has no skill data`);
        return;
      }
      
      const skillId = session.skill._id.toString();
      if (!sessionsBySkill[skillId]) {
        sessionsBySkill[skillId] = {
          skillId,
          skillName: session.skill.name,
          sessions: [],
          teacherId: session.teacher?._id,
          teacherName: session.teacher?.name
        };
      }
      sessionsBySkill[skillId].sessions.push(session);
    });
    
    console.log(`[Certificate] Grouped sessions into ${Object.keys(sessionsBySkill).length} skills`);
    
    // Log skills and session counts
    Object.entries(sessionsBySkill).forEach(([skillId, data]) => {
      console.log(`[Certificate] Skill ${skillId} (${data.skillName}): ${data.sessions.length} sessions`);
    });
    
    // Filter skills where user has completed at least 3 sessions
    const eligibleSkills = Object.values(sessionsBySkill).filter(
      skill => skill.sessions.length >= 3
    );
    
    console.log(`[Certificate] Found ${eligibleSkills.length} skills with at least 3 sessions`);
    
    // Check if user already has certificates or pending requests
    const existingCertificates = await Certificate.find({ 
      user: userId 
    }).populate('skill', 'name');
    
    console.log(`[Certificate] User has ${existingCertificates.length} existing certificates or requests`);
    
    // Add certificate status to eligible skills
    const eligibleSkillsWithStatus = eligibleSkills.map(skill => {
      const existingCert = existingCertificates.find(
        cert => cert.skill && cert.skill._id && cert.skill._id.toString() === skill.skillId
      );
      
      return {
        ...skill,
        certificateStatus: existingCert ? existingCert.status : null,
        certificateId: existingCert ? existingCert._id : null,
        certificateUrl: existingCert ? existingCert.certificateUrl : null
      };
    });
    
    const response = {
      eligible: eligibleSkillsWithStatus.length > 0,
      eligibleSkills: eligibleSkillsWithStatus,
      existingCertificates
    };
    
    console.log(`[Certificate] Eligibility response: eligible=${response.eligible}, eligibleSkills=${response.eligibleSkills.length}`);
    
    res.json(response);
  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request a certificate
export const requestCertificate = async (req, res) => {
  try {
    const userId = req.userId;
    const { skillId, teacherId } = req.body;
    
    if (!skillId || !teacherId) {
      return res.status(400).json({ message: 'Skill ID and Teacher ID are required' });
    }
    
    // Check if user already has a certificate for this skill
    const existingCertificate = await Certificate.findOne({
      user: userId,
      skill: skillId
    });
    
    if (existingCertificate) {
      return res.status(400).json({ 
        message: 'You already have a certificate or pending request for this skill',
        certificate: existingCertificate
      });
    }
    
    // Find completed sessions for this skill and teacher
    const completedSessions = await Session.find({
      learner: userId,
      teacher: teacherId,
      skill: skillId,
      status: 'completed'
    }).sort({ startTime: 1 });
    
    // Check if there are at least 3 completed sessions
    if (completedSessions.length < 3) {
      return res.status(400).json({ 
        message: 'You need at least 3 completed sessions with this teacher for this skill to request a certificate',
        sessionsCompleted: completedSessions.length
      });
    }
    
    // Create certificate request with a simple ID
    const certificate = new Certificate({
      user: userId,
      teacher: teacherId,
      skill: skillId,
      sessions: completedSessions.map(session => session._id),
      certificateId: generateCertificateId(),
      status: 'pending'
    });
    
    await certificate.save();
    
    res.status(201).json({
      message: 'Certificate request submitted successfully',
      certificate
    });
  } catch (error) {
    console.error('Error requesting certificate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all certificates for a user
export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.userId;
    
    const certificates = await Certificate.find({ user: userId })
      .populate('skill', 'name')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });
    
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all pending certificate requests
export const getPendingCertificates = async (req, res) => {
  try {
    // Admins only
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const pendingCertificates = await Certificate.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('skill', 'name')
      .populate('teacher', 'name')
      .populate('sessions')
      .sort({ requestedAt: 1 });
    
    res.json(pendingCertificates);
  } catch (error) {
    console.error('Error fetching pending certificates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Approve or reject a certificate
export const processCertificate = async (req, res) => {
  try {
    // Admins only
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    const { certificateId, status, rejectionReason } = req.body;
    
    if (!certificateId || !status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }
    
    // Find the certificate
    const certificate = await Certificate.findById(certificateId)
      .populate('user', 'name email')
      .populate('skill', 'name')
      .populate('teacher', 'name');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate request not found' });
    }
    
    // Update the certificate status
    certificate.status = status;
    
    if (status === 'approved') {
      certificate.approvedAt = new Date();
      
      // Set the certificate URL to the download endpoint
      const certificateUrl = `api/certificates/${certificate._id}/download`;
      certificate.certificateUrl = certificateUrl;
      
      // Add certificate to user's profile
      const profile = await Profile.findOne({ user: certificate.user._id });
      
      if (profile) {
        // Create achievements array if it doesn't exist
        if (!profile.achievements) {
          profile.achievements = [];
        }
        
        // Add achievement
        profile.achievements.push(`Earned ${certificate.skill.name} Certificate`);
        
        await profile.save();
      }
    } else if (status === 'rejected' && rejectionReason) {
      certificate.rejectionReason = rejectionReason;
    }
    
    await certificate.save();
    
    // Send notification to user (implement with socket.io)
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    if (io && certificate.user) {
      const userSocketId = connectedUsers.get(certificate.user._id.toString());
      
      if (userSocketId) {
        io.to(userSocketId).emit('certificate_update', {
          certificateId: certificate._id,
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
          certificateUrl: certificate.certificateUrl
        });
      }
    }
    
    res.json({
      message: `Certificate ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      certificate
    });
  } catch (error) {
    console.error('Error processing certificate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get certificate by ID
export const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.userId;
    
    const certificate = await Certificate.findById(certificateId)
      .populate('skill', 'name')
      .populate('teacher', 'name')
      .populate('user', 'name');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Only allow access to admins or the certificate owner
    if (!req.isAdmin && certificate.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Track certificate download
export const trackCertificateDownload = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findById(certificateId);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Increment download count
    certificate.downloadCount += 1;
    await certificate.save();
    
    res.json({ success: true, downloadCount: certificate.downloadCount });
  } catch (error) {
    console.error('Error tracking certificate download:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download certificate
export const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findById(certificateId)
      .populate('user', 'name')
      .populate('skill', 'name')
      .populate('teacher', 'name');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    if (certificate.status !== 'approved') {
      return res.status(400).json({ message: 'Certificate is not approved yet' });
    }
    
    // Create a buffer to store the PDF
    const chunks = [];
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0, // We'll handle margins manually for better control
      layout: 'landscape',
      info: {
        Title: `SkillXchange Certificate - ${certificate.skill.name}`,
        Author: 'SkillXchange',
        Subject: 'Certificate of Completion'
      }
    });
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      // Send the complete PDF buffer at once
      res.send(pdfBuffer);
    });
    
    // Basic page dimensions
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Set background with gradient
    const gradientFill = doc.linearGradient(0, 0, 0, pageHeight)
      .stop(0, '#ffffff')
      .stop(1, '#f5f9ff');
    
    doc.rect(0, 0, pageWidth, pageHeight)
       .fill(gradientFill);
    
    // Add more visible watermark
    doc.save();
    doc.translate(pageWidth / 2, pageHeight / 2);  // Move to center of page
    doc.rotate(45);  // Rotate 45 degrees
    doc.fontSize(90)  // Larger font
       .fillColor('rgba(0, 102, 204, 0.08)')  // Slightly more opaque
       .font('Helvetica-Bold')
       .text('SKILLXCHANGE', -270, -40, {  // Adjusted position
         width: 540,
         align: 'center'
       });
    doc.restore();
    
    // Create a decorative border with gradient
    const borderWidth = 15;
    const borderColor = '#0066cc';
    
    // Top border
    doc.rect(0, 0, pageWidth, borderWidth).fill(borderColor);
    
    // Bottom border
    doc.rect(0, pageHeight - borderWidth, pageWidth, borderWidth).fill(borderColor);
    
    // Left border
    doc.rect(0, 0, borderWidth, pageHeight).fill(borderColor);
    
    // Right border
    doc.rect(pageWidth - borderWidth, 0, borderWidth, pageHeight).fill(borderColor);
    
    // Inner decorative frame with rounded corners
    doc.roundedRect(
      borderWidth + 10, 
      borderWidth + 10, 
      pageWidth - (borderWidth + 10) * 2, 
      pageHeight - (borderWidth + 10) * 2, 
      10
    )
    .lineWidth(1)
    .stroke('#0066cc');
    
    // Resolve image paths
    const logoPath = path.join(__dirname, '../../backend/Assets/images/logo.png');
    const sealPath = path.join(__dirname, '../../backend/Assets/images/Seal.png');
    
    // Add logo at the top center
    doc.image(logoPath, pageWidth / 2 - 40, borderWidth + 20, { width: 80 });
    
    // Add decorative pattern in corners
    // Top left
    doc.circle(borderWidth + 30, borderWidth + 30, 5).fill('#0066cc');
    doc.circle(borderWidth + 45, borderWidth + 30, 3).fill('#0066cc');
    doc.circle(borderWidth + 30, borderWidth + 45, 3).fill('#0066cc');
    
    // Top right
    doc.circle(pageWidth - borderWidth - 30, borderWidth + 30, 5).fill('#0066cc');
    doc.circle(pageWidth - borderWidth - 45, borderWidth + 30, 3).fill('#0066cc');
    doc.circle(pageWidth - borderWidth - 30, borderWidth + 45, 3).fill('#0066cc');
    
    // Bottom left
    doc.circle(borderWidth + 30, pageHeight - borderWidth - 30, 5).fill('#0066cc');
    doc.circle(borderWidth + 45, pageHeight - borderWidth - 30, 3).fill('#0066cc');
    doc.circle(borderWidth + 30, pageHeight - borderWidth - 45, 3).fill('#0066cc');
    
    // Bottom right
    doc.circle(pageWidth - borderWidth - 30, pageHeight - borderWidth - 30, 5).fill('#0066cc');
    doc.circle(pageWidth - borderWidth - 45, pageHeight - borderWidth - 30, 3).fill('#0066cc');
    doc.circle(pageWidth - borderWidth - 30, pageHeight - borderWidth - 45, 3).fill('#0066cc');
    
    // Add decorative elements at the top
    const ribbonY = borderWidth + 85;
    const ribbonWidth = 60;
    const ribbonHeight = 15;
    
    // Left ribbon
    doc.rect(pageWidth / 2 - 150 - ribbonWidth / 2, ribbonY, ribbonWidth, ribbonHeight)
       .fill('#0066cc');
    
    // Right ribbon
    doc.rect(pageWidth / 2 + 150 - ribbonWidth / 2, ribbonY, ribbonWidth, ribbonHeight)
       .fill('#0066cc');
    
    // Add title
    // First add shadow
    doc.fontSize(28)
       .fillColor('#004d99')
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF COMPLETION', 2, borderWidth + 112, { align: 'center' });
    
    // Then add main text
    doc.fontSize(28)
       .fillColor('#0066cc')
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF COMPLETION', 0, borderWidth + 110, { align: 'center' });
    
    // Add fancy divider with decorative elements
    const dividerY = borderWidth + 145;
    // Middle line
    doc.moveTo(pageWidth / 2 - 120, dividerY)
       .lineTo(pageWidth / 2 + 120, dividerY)
       .lineWidth(1)
       .stroke('#0066cc');
       
    // Add small decorative circles on the divider
    doc.circle(pageWidth / 2 - 120, dividerY, 3).fill('#0066cc');
    doc.circle(pageWidth / 2, dividerY, 3).fill('#0066cc');
    doc.circle(pageWidth / 2 + 120, dividerY, 3).fill('#0066cc');
       
    // Add "This certifies that" text
    const certTextY = dividerY + 15;
    doc.fontSize(14)
       .fillColor('#555555')
       .font('Helvetica')
       .text('This certifies that', 0, certTextY, { align: 'center' });
       
    // Add student name
    const nameY = certTextY + 25;
    doc.fontSize(24)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(certificate.user.name, 0, nameY, { align: 'center' });
       
    // Add completion text
    const completionY = nameY + 35;
    doc.fontSize(14)
       .fillColor('#555555')
       .font('Helvetica')
       .text('has successfully completed training in', 0, completionY, { align: 'center' });
       
    // Add skill name
    const skillY = completionY + 25;
    doc.fontSize(22)
       .fillColor('#0066cc')
       .font('Helvetica-Bold')
       .text(certificate.skill.name, 0, skillY, { align: 'center' });
       
    // Add teacher text
    const teacherTextY = skillY + 35;
    doc.fontSize(14)
       .fillColor('#555555')
       .font('Helvetica')
       .text('under the guidance of', 0, teacherTextY, { align: 'center' });
       
    // Add teacher name
    const teacherNameY = teacherTextY + 25;
    doc.fontSize(18)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text(certificate.teacher.name, 0, teacherNameY, { align: 'center' });
       
    // Add issue date
    const issueDate = new Date(certificate.approvedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const dateY = teacherNameY + 30;
    doc.fontSize(12)
       .fillColor('#555555')
       .font('Helvetica')
       .text(`Issued on: ${issueDate}`, 0, dateY, { align: 'center' });
    
    // Add verified seal on bottom right
    doc.image(sealPath, pageWidth - borderWidth - 100 - 10, pageHeight - borderWidth - 100 - 10, { width: 100 });
    
    // Add signature line
    const signatureY = dateY + 40;
    doc.moveTo(pageWidth / 2 - 90, signatureY)
       .lineTo(pageWidth / 2 + 90, signatureY)
       .lineWidth(0.5)
       .stroke('#333333');
       
    // Add signature text
    doc.fontSize(12)
       .fillColor('#333333')
       .font('Helvetica')
       .text('SkillXchange Official', pageWidth / 2 - 90, signatureY + 5, { width: 180, align: 'center' });
    
    // Add certificate ID at bottom
    doc.fontSize(9)
       .fillColor('#666666')
       .font('Helvetica')
       .text(`Certificate ID: ${certificate.certificateId}`, 0, pageHeight - borderWidth - 30, { align: 'center' });
    
    // Add verification text
    doc.fontSize(8)
       .fillColor('#666666')
       .font('Helvetica-Oblique')
       .text('This certificate is digitally verified and validated by SkillXchange', 
             borderWidth + 30, pageHeight - borderWidth - 45, { width: 300 });
       
    // Finalize the PDF and end the stream
    doc.end();
    
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 