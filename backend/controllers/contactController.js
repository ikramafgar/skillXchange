import ContactMessage from '../models/ContactMessage.js';
import nodemailer from 'nodemailer';

// Submit a new contact message
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const newContactMessage = new ContactMessage({
      name,
      email,
      message,
    });

    await newContactMessage.save();

    res.status(201).json({ 
      message: 'Your message has been sent successfully',
      contactMessage: newContactMessage
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all contact messages (for admin)
export const getAllContactMessages = async (req, res) => {
  try {
    // Check if the user is an admin (this should be verified by middleware)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const contactMessages = await ContactMessage.find()
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(contactMessages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark a contact message as read
export const markMessageAsRead = async (req, res) => {
  try {
    // Check if the user is an admin (this should be verified by middleware)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { messageId } = req.params;

    const contactMessage = await ContactMessage.findById(messageId);
    if (!contactMessage) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    contactMessage.status = 'read';
    await contactMessage.save();

    res.json({
      message: 'Message marked as read',
      contactMessage
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a contact message
export const deleteContactMessage = async (req, res) => {
  try {
    // Check if the user is an admin (this should be verified by middleware)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { messageId } = req.params;

    const contactMessage = await ContactMessage.findByIdAndDelete(messageId);
    if (!contactMessage) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reply to a contact message
export const replyToContactMessage = async (req, res) => {
  try {
    // Check if the user is an admin (this should be verified by middleware)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { messageId } = req.params;
    const { replyText } = req.body;

    if (!replyText) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    // Find the message
    const contactMessage = await ContactMessage.findById(messageId);
    if (!contactMessage) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Send the email
    const mailOptions = {
      from: `"SkillXchange Support" <${process.env.GMAIL_USER}>`,
      to: contactMessage.email,
      subject: 'Response to Your Contact Inquiry',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4a5568; margin-bottom: 20px;">Hello ${contactMessage.name},</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">Thank you for contacting SkillXchange. Here is our response to your inquiry:</p>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #4a5568; line-height: 1.6;">${replyText}</p>
          </div>
          <div style="background-color: #f0f4ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #5a67d8; margin-bottom: 10px; font-weight: bold;">Your original message:</p>
            <p style="color: #4a5568; line-height: 1.6;">${contactMessage.message}</p>
          </div>
          <p style="color: #4a5568; line-height: 1.6;">If you have any further questions, please don't hesitate to reach out to us again.</p>
          <p style="color: #4a5568; line-height: 1.6; margin-top: 20px;">Best regards,<br>The SkillXchange Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Update the message status to read
    contactMessage.status = 'read';
    
    // Store the reply in the message object
    if (!contactMessage.replies) {
      contactMessage.replies = [];
    }
    
    contactMessage.replies.push({
      text: replyText,
      date: new Date(),
      adminId: req.user._id // Store the admin ID who replied
    });
    
    await contactMessage.save();

    res.json({
      message: 'Reply sent successfully',
      contactMessage
    });
  } catch (error) {
    console.error('Error replying to contact message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 