import { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserCheck, Mail, Phone, MapPin, Lightbulb, Book, 
  Award, Briefcase, Calendar, Clock, MessageSquare,
  X,  Facebook, Twitter, Linkedin, Github, Globe,
  DollarSign, Star, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
import customAxios from '../utils/axios';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  userData, 
  connectionDate 
}) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && userData?._id) {
      setLoading(true);
      // Use the correct API endpoint with includeDetails parameter to ensure we get the rating
      customAxios.get(`/api/users/${userData._id}?includeDetails=true`)
        .then(response => {
          console.log('User profile data received:', response.data);
          setProfileData(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          setLoading(false);
          toast.error('Failed to load user profile data');
        });
    }
  }, [isOpen, userData]);

  if (!isOpen || !userData) return null;

  // Use the fetched profile data if available, otherwise fall back to userData
  const displayData = profileData || userData;
  
  const handleNavigateToChat = () => {
    onClose(); // Close the modal first
    // Navigate to chat page with the user ID as a parameter
    navigate(`/messages/${userData._id}`);
    toast.success(`Opening chat with ${userData.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 bg-white/90 rounded-full hover:bg-gray-100  z-10 shadow-md hover:shadow-lg transition-all duration-200"
          aria-label="Close profile"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center p-16 min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
          </div>
        ) : (
        <div className="p-6 sm:p-8 pt-10 sm:pt-6">
          {/* Profile header with image and name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-gray-200">
            <div className="relative">
              <img 
                src={displayData.profilePic || '/default-avatar.png'} 
                alt={displayData.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-100 rounded-full p-1.5 border-2 border-white shadow-sm">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{displayData.name}</h1>
                {/* Verification badge */}
                {displayData.verificationStatus === "approved" && (
                  <span 
                    className="inline-flex ml-1 bg-blue-500 text-white p-1 rounded-full"
                    title="Verified Teacher"
                  >
                    <CheckCircle size={14} />
                  </span>
                )}
              </div>
              
              {displayData.title && (
                <p className="text-gray-600 font-medium">{displayData.title}</p>
              )}
              
              {/* User Rating */}
              <div className="flex items-center justify-center sm:justify-start mt-3 bg-amber-50 px-3 py-1.5 rounded-full w-fit mx-auto sm:mx-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    fill={(displayData.rating || 0) >= star ? "#FBBF24" : "none"}
                    className={`w-4 h-4 ${
                      (displayData.rating || 0) >= star 
                        ? "text-amber-400" 
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-amber-800">
                  {(displayData.rating || 0).toFixed(1)}/5
                </span>
              </div>
              
              {connectionDate && (
                <div className="flex items-center justify-center sm:justify-start mt-2">
                  <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-gray-600">Connected since {new Date(connectionDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {/* Message button for small screens */}
              <div className="mt-4 sm:hidden">
                <button
                  onClick={handleNavigateToChat}
                  className="w-full flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with {displayData.name}
                </button>
              </div>
            </div>

            {/* Message button for medium+ screens */}
            <div className="hidden sm:block sm:ml-auto">
              <button
                onClick={handleNavigateToChat}
                className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 text-sm font-medium whitespace-nowrap shadow-md hover:shadow-lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with {displayData.name.split(' ')[0]}
              </button>
            </div>
          </div>
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column (2/3 width on md+) */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio section */}
              {displayData.bio && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700">{displayData.bio}</p>
                </div>
              )}
              
              {/* Skills sections */}
              <div className="space-y-6">
                {/* Skills teaching */}
                {displayData.skillsToTeach && displayData.skillsToTeach.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl shadow-sm border border-amber-200">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-amber-200 rounded-full mr-3">
                        <Lightbulb className="w-5 h-5 text-amber-700" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Skills Teaching</h3>
                      {/* Teaching verification badge */}
                      {displayData.verificationStatus === "approved" && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full flex items-center ml-2">
                          <CheckCircle size={10} className="mr-1" /> Verified Teacher
                        </span>
                      )}
                    </div>
                    
                    {/* Show hourly rate */}
                    {typeof displayData.hourlyRate !== 'undefined' && (
                      <div className="mb-4 flex items-center px-4 py-2 bg-white text-amber-800 rounded-lg shadow-sm border border-amber-200 w-fit">
                        <DollarSign className="w-4 h-4 mr-2 text-amber-600" />
                        <span className="font-medium">
                          {displayData.hourlyRate > 0 
                            ? `${displayData.hourlyRate} PKR/hour` 
                            : "Teaching for free"}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {displayData.skillsToTeach.map((skillItem, index) => {
                        const skillName = skillItem.skill?.name || skillItem.name || skillItem;
                        const skillLevel = skillItem.level || skillItem.skill?.level;
                        
                        return skillName ? (
                          <div 
                            key={index} 
                            className="px-4 py-1.5 bg-white text-amber-800 rounded-full text-sm border border-amber-200 flex items-center shadow-sm"
                          >
                            <span>{skillName}</span>
                            {skillLevel && (
                              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                {skillLevel}
                              </span>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {/* Skills learning */}
                {displayData.skillsToLearn && displayData.skillsToLearn.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-200 rounded-full mr-3">
                        <Book className="w-5 h-5 text-blue-700" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Skills Learning</h3>
                    </div>
                    
                    {/* Show learning budget */}
                    {typeof displayData.learningBudget !== 'undefined' && (
                      <div className="mb-4 flex items-center px-4 py-2 bg-white text-blue-800 rounded-lg shadow-sm border border-blue-200 w-fit">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">
                          {displayData.learningBudget > 0 
                            ? `Budget: ${displayData.learningBudget} PKR/hour` 
                            : "Looking for free sessions"}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {displayData.skillsToLearn.map((skillItem, index) => {
                        const skillName = skillItem.skill?.name || skillItem.name || skillItem;
                        return skillName ? (
                          <div 
                            key={index} 
                            className="px-4 py-1.5 bg-white text-blue-800 rounded-full text-sm border border-blue-200 shadow-sm"
                          >
                            {skillName}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Experience & Education (if available) */}
              {displayData.experience && displayData.experience.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gray-200 rounded-full mr-3">
                      <Briefcase className="w-5 h-5 text-gray-700" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Experience</h3>
                  </div>
                  <div className="space-y-4">
                    {displayData.experience.map((exp, index) => (
                      <div key={index} className="border-l-3 border-gray-300 pl-4 py-2 hover:border-blue-400 transition-colors">
                        <h4 className="font-semibold">{exp.role || exp.title}</h4>
                        <p className="text-sm text-gray-600">{exp.company || exp.organization}</p>
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            {exp.startDate && exp.endDate 
                              ? `${exp.startDate} - ${exp.endDate}` 
                              : exp.startDate || exp.endDate}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {displayData.education && displayData.education.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gray-200 rounded-full mr-3">
                      <Award className="w-5 h-5 text-gray-700" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Education</h3>
                  </div>
                  <div className="space-y-4">
                    {displayData.education.map((edu, index) => (
                      <div key={index} className="border-l-3 border-gray-300 pl-4 py-2 hover:border-blue-400 transition-colors">
                        <h4 className="font-semibold">{edu.degree || edu.course}</h4>
                        <p className="text-sm text-gray-600">{edu.institution || edu.school}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            {edu.startYear && edu.endYear 
                              ? `${edu.startYear} - ${edu.endYear}` 
                              : edu.startYear || edu.endYear}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column (1/3 width on md+) */}
            <div className="space-y-6">
              {/* Contact card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-gray-700" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {displayData.email && (
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <Mail className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700 break-all">{displayData.email}</span>
                    </div>
                  )}
                  
                  {displayData.phone && (
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <Phone className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{displayData.phone}</span>
                    </div>
                  )}
                  
                  {displayData.location && (
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <MapPin className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{displayData.location}</span>
                    </div>
                  )}
                  
                  {displayData.availability && (
                    <div className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <Clock className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{displayData.availability}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social links if available */}
              {displayData.socialLinks && Object.values(displayData.socialLinks).some(link => link) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-gray-700" />
                    Connect Online
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {displayData.socialLinks.website && (
                      <a 
                        href={displayData.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2.5 bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:bg-gray-100 hover:shadow-md shadow-sm"
                        aria-label="Personal website"
                      >
                        <Globe className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.linkedin && (
                      <a 
                        href={displayData.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2.5 bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:bg-gray-100 hover:shadow-md shadow-sm"
                        aria-label="LinkedIn profile"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.twitter && (
                      <a 
                        href={displayData.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2.5 bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:bg-gray-100 hover:shadow-md shadow-sm"
                        aria-label="Twitter profile"
                      >
                        <Twitter className="w-5 h-5 text-blue-400" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.facebook && (
                      <a 
                        href={displayData.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2.5 bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:bg-gray-100 hover:shadow-md shadow-sm"
                        aria-label="Facebook profile"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.github && (
                      <a 
                        href={displayData.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2.5 bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:bg-gray-100 hover:shadow-md shadow-sm"
                        aria-label="GitHub profile"
                      >
                        <Github className="w-5 h-5 text-gray-800" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </motion.div>
    </div>
  );
}

UserProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userData: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    profilePic: PropTypes.string,
    title: PropTypes.string,
    rating: PropTypes.number,
    bio: PropTypes.string,
    skillsToTeach: PropTypes.array,
    skillsToLearn: PropTypes.array,
    hourlyRate: PropTypes.number,
    learningBudget: PropTypes.number,
    experience: PropTypes.array,
    education: PropTypes.array,
    email: PropTypes.string,
    phone: PropTypes.string,
    location: PropTypes.string,
    availability: PropTypes.string,
    socialLinks: PropTypes.object,
    verificationStatus: PropTypes.string
  }).isRequired,
  connectionDate: PropTypes.string
}; 