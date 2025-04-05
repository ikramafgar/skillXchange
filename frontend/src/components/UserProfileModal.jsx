import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserCheck, Mail, Phone, MapPin, Lightbulb, Book, 
  Award, Briefcase, Calendar, Clock, MessageSquare,
  X, ExternalLink, Facebook, Twitter, Linkedin, Github, Globe,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useProfileStore } from '../store/ProfileStore';
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
      // Use the correct API endpoint
      customAxios.get(`/api/users/${userData._id}`)
        .then(response => {
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
          aria-label="Close profile"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        {loading ? (
          <div className="flex justify-center items-center p-12 min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
        <>
        {/* Header section with background and profile image */}
        <div className="relative">
          <div className="h-32 md:h-40 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-xl"></div>
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 flex justify-center">
            <img 
              src={displayData.profilePic || '/default-avatar.png'} 
              alt={displayData.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover"
            />
          </div>
        </div>
        
        {/* Profile content with padding to accommodate the profile image */}
        <div className="pt-16 md:pt-20 px-6 pb-6">
          {/* Name and basic info */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{displayData.name}</h1>
            
            {displayData.title && (
              <p className="text-gray-600 mt-1">{displayData.title}</p>
            )}
            
            {connectionDate && (
              <div className="flex items-center justify-center mt-2">
                <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">Connected since {new Date(connectionDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left column (3/5 width on md+) */}
            <div className="md:col-span-3 space-y-6">
              {/* Bio section */}
              {displayData.bio && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{displayData.bio}</p>
                </div>
              )}
              
              {/* Skills sections */}
              <div className="space-y-6">
                {/* Skills teaching */}
                {displayData.skillsToTeach && displayData.skillsToTeach.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center mb-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Skills Teaching</h3>
                    </div>
                    
                    {/* Show hourly rate */}
                    {typeof displayData.hourlyRate !== 'undefined' && (
                      <div className="mb-3 flex items-center px-3 py-1.5 bg-white text-amber-800 rounded-lg border border-amber-200 w-fit">
                        <DollarSign className="w-4 h-4 mr-1 text-amber-600" />
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
                            className="px-3 py-1.5 bg-white text-amber-800 rounded-full text-sm border border-amber-200 flex items-center"
                          >
                            <span>{skillName}</span>
                            {skillLevel && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">
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
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-3">
                      <Book className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Skills Learning</h3>
                    </div>
                    
                    {/* Show learning budget */}
                    {typeof displayData.learningBudget !== 'undefined' && (
                      <div className="mb-3 flex items-center px-3 py-1.5 bg-white text-blue-800 rounded-lg border border-blue-200 w-fit">
                        <DollarSign className="w-4 h-4 mr-1 text-blue-600" />
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
                            className="px-3 py-1.5 bg-white text-blue-800 rounded-full text-sm border border-blue-200"
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Briefcase className="w-5 h-5 text-gray-700 mr-2" />
                    <h3 className="font-medium text-gray-900">Experience</h3>
                  </div>
                  <div className="space-y-3">
                    {displayData.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-3 py-1">
                        <h4 className="font-medium">{exp.role || exp.title}</h4>
                        <p className="text-sm text-gray-600">{exp.company || exp.organization}</p>
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Award className="w-5 h-5 text-gray-700 mr-2" />
                    <h3 className="font-medium text-gray-900">Education</h3>
                  </div>
                  <div className="space-y-3">
                    {displayData.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-3 py-1">
                        <h4 className="font-medium">{edu.degree || edu.course}</h4>
                        <p className="text-sm text-gray-600">{edu.institution || edu.school}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
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
            
            {/* Right column (2/5 width on md+) */}
            <div className="md:col-span-2 space-y-6">
              {/* Contact card */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {displayData.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 break-all">{displayData.email}</span>
                    </div>
                  )}
                  
                  {displayData.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{displayData.phone}</span>
                    </div>
                  )}
                  
                  {displayData.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{displayData.location}</span>
                    </div>
                  )}
                  
                  {displayData.availability && (
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{displayData.availability}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social links if available */}
              {displayData.socialLinks && Object.values(displayData.socialLinks).some(link => link) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Connect Online</h3>
                  <div className="flex flex-wrap gap-3">
                    {displayData.socialLinks.website && (
                      <a 
                        href={displayData.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Globe className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.linkedin && (
                      <a 
                        href={displayData.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.twitter && (
                      <a 
                        href={displayData.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-blue-400" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.facebook && (
                      <a 
                        href={displayData.socialLinks.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                    
                    {displayData.socialLinks.github && (
                      <a 
                        href={displayData.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Github className="w-5 h-5 text-gray-800" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Message button */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-gray-900 mb-3">Direct Message</h3>
                <button
                  onClick={handleNavigateToChat}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with {displayData.name}
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </motion.div>
    </div>
  );
} 