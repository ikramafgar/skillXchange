import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import { useProfileStore } from "../store/ProfileStore";
import LoadingSpinner from "../components/LoadingSpinner";
import AcceptedConnections from "../components/AcceptedConnections";
import {
  Camera,
  Mail,
  Book,
  Lightbulb,
  UserCheck,
  Star,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Edit,
  Users,
  Upload,
  User,
} from "lucide-react";

const ProfilePage = () => {
  const {
    profile,
    isLoading,
    error,
    editMode,
    fetchProfile,
    updateProfile,
    updateProfilePicture,
    uploadCertificates,
    uploadExperienceCertificate,
    setEditMode,
  } = useProfileStore();

  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update local form data when profile changes
  useEffect(() => {
    if (profile) {
      const displayData = { ...profile };
      
      // Convert skillsToLearn array to comma-separated string for display in form
      if (Array.isArray(profile.skillsToLearn)) {
        displayData.skillsToLearnString = profile.skillsToLearn
          .map(item => {
            // Handle both populated and non-populated skill objects
            if (item.skill) {
              return typeof item.skill === 'object' ? item.skill.name : '';
            }
            return '';
          })
          .filter(Boolean)
          .join(', ');
      }
      
      // Convert skillsToTeach array to comma-separated string for display in form
      if (Array.isArray(profile.skillsToTeach)) {
        displayData.skillsToTeachString = profile.skillsToTeach
          .map(item => {
            // Handle both populated and non-populated skill objects
            if (item.skill) {
              return typeof item.skill === 'object' ? item.skill.name : '';
            }
            return '';
          })
          .filter(Boolean)
          .join(', ');
      }
      
      setFormData(displayData);
      setPreviewImage(profile.profilePic);
    }
  }, [profile]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a simplified copy of the form data for submission
      // Only include fields that we know the backend can handle
      const submissionData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        github: formData.github,
        linkedin: formData.linkedin,
        role: formData.role,
        skillLevel: formData.skillLevel
      };
      
      // Handle skills to learn
      if (formData.role === 'learner' || formData.role === 'both') {
        // If we have existing skills, use them
        if (Array.isArray(formData.skillsToLearn) && formData.skillsToLearn.length > 0) {
          submissionData.skillsToLearn = formData.skillsToLearn;
        } 
        // Otherwise, if we have a string of skills, convert it
        else if (formData.skillsToLearnString) {
          submissionData.skillsToLearn = formData.skillsToLearnString
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill !== '');
        }
        // If neither, set an empty array
        else {
          submissionData.skillsToLearn = [];
        }
      } else {
        // If not a learner, set empty array
        submissionData.skillsToLearn = [];
      }
      
      // Handle skills to teach
      if (formData.role === 'teacher' || formData.role === 'both') {
        // If we have existing skills, use them
        if (Array.isArray(formData.skillsToTeach) && formData.skillsToTeach.length > 0) {
          submissionData.skillsToTeach = formData.skillsToTeach;
        } 
        // Otherwise, if we have a string of skills, convert it
        else if (formData.skillsToTeachString) {
          submissionData.skillsToTeach = formData.skillsToTeachString
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill !== '');
        }
        // If neither, set an empty array
        else {
          submissionData.skillsToTeach = [];
        }
      } else {
        // If not a teacher, set empty array
        submissionData.skillsToTeach = [];
      }
      
      console.log('Submitting profile data:', submissionData);
      
      // Update the profile and get the updated data
      const updatedProfile = await updateProfile(submissionData);
      
      // The backend should now return the populated skill data
      if (updatedProfile) {
        // Create a new display data object from the updated profile
        const newDisplayData = { ...updatedProfile };
        
        // Update the skillsToLearnString and skillsToTeachString for the form
        if (Array.isArray(updatedProfile.skillsToLearn)) {
          newDisplayData.skillsToLearnString = updatedProfile.skillsToLearn
            .map(item => {
              if (item.skill) {
                return typeof item.skill === 'object' ? item.skill.name : '';
              }
              return '';
            })
            .filter(Boolean)
            .join(', ');
        }
        
        if (Array.isArray(updatedProfile.skillsToTeach)) {
          newDisplayData.skillsToTeachString = updatedProfile.skillsToTeach
            .map(item => {
              if (item.skill) {
                return typeof item.skill === 'object' ? item.skill.name : '';
              }
              return '';
            })
            .filter(Boolean)
            .join(', ');
        }
        
        // Update the form data with the new display data
        setFormData(newDisplayData);
      }
      
      setEditMode(false); // Exit edit mode
      toast.success("Profile updated successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(`Error updating profile: ${error.message || 'Please try again.'}`, {
        position: "top-center",
      });
    }
  };

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file for upload
      setProfilePicFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload the profile picture
      updateProfilePicture(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle certificate uploads
  const handleCertificatesChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadCertificates(files);
    }
  };

  // Handle experience certificate upload
  const handleExperienceCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadExperienceCertificate(file);
    }
  };

  // Loading and error states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-300 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>

      <div className="p-6 w-full max-w-2xl mt-10">
        <ToastContainer />
        
        <div className="flex flex-col items-center">
          {/* Form or Display Mode */}
          {editMode ? (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg mb-3">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                  >
                    <Camera size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePicChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Click the camera icon to upload a profile picture</p>
              </div>

              {/* Role selection at the top */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <UserCheck size={18} className="text-gray-500" /> Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="teacher">Teacher</option>
                  <option value="learner">Learner</option>
                  <option value="both">Both</option>
                </select>
              </div>
              {(formData.role === 'teacher' || formData.role === 'both') && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 font-medium">
                      <Upload size={18} className="text-gray-500" /> Upload Certificates
                    </label>
                    <input
                      type="file"
                      name="certificates"
                      className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      multiple
                      onChange={handleCertificatesChange}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 font-medium">
                      <Upload size={18} className="text-gray-500" /> Upload Experience Certificate
                    </label>
                    <input
                      type="file"
                      name="experienceCertificate"
                      className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      onChange={handleExperienceCertificateChange}
                    />
                  </div>
                </>
              )}
              {/* Editable fields */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <UserCheck size={18} className="text-gray-500" />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                  rows="3"
                ></textarea>
              </div>
              {/* Skills to Learn */}
              {formData.role === 'learner' && (
                <div>
                  <label className="flex items-center gap-2 text-gray-600 font-medium">
                    <Book size={18} className="text-gray-500" /> Skills to Learn
                  </label>
                  <input
                    type="text"
                    name="skillsToLearnString"
                    value={formData.skillsToLearnString || ''}
                    onChange={handleInputChange}
                    placeholder="E.g., React, Tailwind CSS"
                    className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Skills to Teach */}
              {(formData.role === 'teacher' || formData.role === 'both') && (
                <div>
                  <label className="flex items-center gap-2 text-gray-600 font-medium">
                    <Lightbulb size={18} className="text-gray-500" /> Skills to
                    Teach
                  </label>
                  <input
                    type="text"
                    name="skillsToTeachString"
                    value={formData.skillsToTeachString || ''}
                    onChange={handleInputChange}
                    placeholder="E.g., Node.js, Python"
                    className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Skill Level */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Star size={18} className="text-gray-500" /> Skill Level
                </label>
                <select
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Mail size={18} className="text-gray-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Phone size={18} className="text-gray-500" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <MapPin size={18} className="text-gray-500" /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Github size={18} className="text-gray-500" />
                  GitHub Link
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Linkedin size={18} className="text-gray-500" />
                  LinkedIn Link
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header Banner */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                <div className="absolute -bottom-16 left-6 sm:left-8">
                  <div className="relative group">
                    <img
                      src={formData.profilePic || "/default-profile-pic.jpg"}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                      onError={(e) => {
                        e.target.src = "/default-profile-pic.jpg";
                      }}
                    />
                    <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-200 shadow-md flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Main Profile Content */}
              <div className="p-6 pt-20">
                {/* Profile Header */}
                <div className="mb-8">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">{formData.name || "User"}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                        {formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : "N/A"}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                        {formData.skillLevel || "Beginner"}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                        {formData.verificationStatus || "Pending"}
                      </span>
                    </div>
                    <p className="text-gray-500 flex items-center gap-1 mt-3">
                      <MapPin size={16} className="text-gray-400" />
                      {formData.location || "No location specified"}
                    </p>
                  </div>
                </div>

                {/* Bio Section with Card Design */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User size={18} className="text-indigo-500" />
                    About Me
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {formData.bio || "No bio added yet. Click 'Edit Profile' to add information about yourself."}
                  </p>
                </div>

                {/* Skills Section with Modern Cards */}
                <div className="space-y-8 mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Skills & Expertise</h3>
                  
                  {/* Skills to Learn Section */}
                  {(formData.role === 'learner' || formData.role === 'both') && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Book size={18} className="text-blue-500" />
                        Skills I Want to Learn
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(formData.skillsToLearn) && formData.skillsToLearn.length > 0 ? (
                          formData.skillsToLearn.map((skillObj, index) => (
                            <span key={index} className="bg-white px-4 py-2 rounded-lg text-sm text-gray-700 border border-blue-200 shadow-sm flex items-center gap-1">
                              <Book size={14} className="text-blue-500" />
                              {skillObj.skill && typeof skillObj.skill === 'object' 
                                ? skillObj.skill.name 
                                : (skillObj.name || 'Unknown Skill')} 
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">
                                {skillObj.level || 'beginner'}
                              </span>
                            </span>
                          ))
                        ) : formData.skillsToLearnString ? (
                          // If we have skillsToLearnString but no skillsToLearn array, create temporary display items
                          formData.skillsToLearnString.split(',').map((skill, index) => (
                            <span key={index} className="bg-white px-4 py-2 rounded-lg text-sm text-gray-700 border border-blue-200 shadow-sm flex items-center gap-1">
                              <Book size={14} className="text-blue-500" />
                              {skill.trim()} 
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-1">
                                beginner
                              </span>
                            </span>
                          ))
                        ) : (
                          <div className="w-full text-center py-4 bg-white rounded-lg border border-blue-200">
                            <Book size={24} className="text-blue-300 mx-auto mb-2" />
                            <span className="text-gray-500 block">No skills to learn added yet</span>
                            <button 
                              onClick={() => setEditMode(true)}
                              className="mt-2 text-blue-500 text-sm hover:underline"
                            >
                              Add skills you want to learn
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills to Teach Section */}
                  {(formData.role === 'teacher' || formData.role === 'both') && (
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 shadow-sm border border-green-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Lightbulb size={18} className="text-green-500" />
                        Skills I Can Teach
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(formData.skillsToTeach) && formData.skillsToTeach.length > 0 ? (
                          formData.skillsToTeach.map((skillObj, index) => (
                            <span key={index} className="bg-white px-4 py-2 rounded-lg text-sm text-gray-700 border border-green-200 shadow-sm flex items-center gap-1">
                              <Lightbulb size={14} className="text-green-500" />
                              {skillObj.skill && typeof skillObj.skill === 'object' 
                                ? skillObj.skill.name 
                                : (skillObj.name || 'Unknown Skill')} 
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full ml-1">
                                {skillObj.level || 'intermediate'}
                              </span>
                            </span>
                          ))
                        ) : formData.skillsToTeachString ? (
                          // If we have skillsToTeachString but no skillsToTeach array, create temporary display items
                          formData.skillsToTeachString.split(',').map((skill, index) => (
                            <span key={index} className="bg-white px-4 py-2 rounded-lg text-sm text-gray-700 border border-green-200 shadow-sm flex items-center gap-1">
                              <Lightbulb size={14} className="text-green-500" />
                              {skill.trim()} 
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full ml-1">
                                intermediate
                              </span>
                            </span>
                          ))
                        ) : (
                          <div className="w-full text-center py-4 bg-white rounded-lg border border-green-200">
                            <Lightbulb size={24} className="text-green-300 mx-auto mb-2" />
                            <span className="text-gray-500 block">No skills to teach added yet</span>
                            <button 
                              onClick={() => setEditMode(true)}
                              className="mt-2 text-green-500 text-sm hover:underline"
                            >
                              Add skills you can teach
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information with Modern Design */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href={`mailto:${formData.email}`} className="flex items-center gap-3 bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm group">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Mail size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-gray-700 truncate font-medium">{formData.email || "Not specified"}</p>
                      </div>
                    </a>
                    <a href={`tel:${formData.phone}`} className="flex items-center gap-3 bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm group">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Phone size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-gray-700 truncate font-medium">{formData.phone || "Not specified"}</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Social Links with Modern Design */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Social Profiles</h3>
                  <div className="flex flex-wrap gap-4">
                    {formData.github ? (
                      <a
                        href={formData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white border border-gray-200 shadow-sm text-gray-800 px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                          <Github size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">GitHub</p>
                          <p className="text-gray-800 font-medium">View Profile</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex-1 bg-white border border-gray-200 px-4 py-3 rounded-xl flex items-center gap-3 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Github size={18} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">GitHub</p>
                          <p className="text-gray-400">Not linked</p>
                        </div>
                      </div>
                    )}
                    
                    {formData.linkedin ? (
                      <a
                        href={formData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white border border-gray-200 shadow-sm text-gray-800 px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <Linkedin size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">LinkedIn</p>
                          <p className="text-gray-800 font-medium">View Profile</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex-1 bg-white border border-gray-200 px-4 py-3 rounded-xl flex items-center gap-3 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Linkedin size={18} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">LinkedIn</p>
                          <p className="text-gray-400">Not linked</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connections Section with Modern Design */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                    <Users size={20} className="text-indigo-500" />
                    My Network
                  </h3>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <AcceptedConnections />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
