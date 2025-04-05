import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import { useProfileStore } from "../store/ProfileStore";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import AcceptedConnections from "../components/AcceptedConnections";
import DeleteAccountModal from "../components/DeleteAccountModal";
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
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  DollarSign,
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

  const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch profile data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else if (!isCheckingAuth) {
      navigate('/login');
    }
  }, [isAuthenticated, isCheckingAuth, fetchProfile, navigate]);

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
    
    // Special handling for role changes
    if (name === 'role') {
      // Create updated form data with the new role
      const updatedFormData = { ...formData, [name]: value };
      
      // If changing to a role that doesn't need skillLevel, we can keep it but don't need to show it
      // If changing to a role that doesn't need certain skills, we preserve them in case user switches back
      
      setFormData(updatedFormData);
      
      // Log the role change
      console.log(`Role changed to: ${value}`);
    } else {
      // Regular field update
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size exceeds 5MB limit", { position: "top-center" });
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          toast.error("Only image files are allowed", { position: "top-center" });
          return;
        }
        
        // Store the file for upload later when form is submitted
        setProfilePicFile(file);
        
        // Create a preview URL
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Show toast notification
        toast.info("Profile picture selected. Click 'Save Changes' to upload.", { position: "top-center" });
      } catch (error) {
        toast.error(`Error: ${error.message}`, { position: "top-center" });
      }
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set submitting state to show loading indicator
    setIsSubmitting(true);
    
    try {
      // Store current role to ensure it's preserved throughout all uploads
      const currentRole = formData.role;
      console.log('Current role before uploads:', currentRole);
      
      // Create a simplified copy of the form data for submission
      const submissionData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        github: formData.github,
        linkedin: formData.linkedin,
        role: currentRole
      };
      
      // Add hourly rate for teachers
      if (currentRole === 'teacher' || currentRole === 'both') {
        submissionData.hourlyRate = formData.hourlyRate || 0;
        
        // Include bank details if hourly rate is greater than 0
        if (formData.hourlyRate > 0) {
          submissionData.bankAccountName = formData.bankAccountName;
          submissionData.bankName = formData.bankName;
          submissionData.bankAccountNumber = formData.bankAccountNumber;
          submissionData.bankIBAN = formData.bankIBAN;
        }
      }
      
      // Only include skillLevel for learners
      if (currentRole === 'learner') {
        submissionData.skillLevel = formData.skillLevel || 'Beginner';
        submissionData.learningBudget = formData.learningBudget || 0;
      }
      
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
      
      // First, update the basic profile information
      let updatedProfile = await updateProfile(submissionData);
      console.log('Basic profile updated:', updatedProfile);
      
      // Then handle file uploads one by one, preserving the role each time
      
      // 1. Upload profile picture if a new one was selected
      if (profilePicFile) {
        toast.info("Uploading profile picture...", { position: "top-center" });
        
        try {
          const profilePicResponse = await updateProfilePicture(profilePicFile);
          
          // Make sure the role is preserved
          if (profilePicResponse && profilePicResponse.role !== currentRole) {
            console.log(`Role changed from ${currentRole} to ${profilePicResponse.role}. Fixing...`);
            // Update the profile again with the correct role if needed
            await updateProfile({ role: currentRole });
          }
          
          // Update our local state with the new profile picture URL
          updatedProfile = {
            ...updatedProfile,
            profilePic: profilePicResponse.profilePic
          };
          
          toast.success("Profile picture uploaded successfully!", { position: "top-center" });
        } catch (error) {
          toast.error(`Failed to upload profile picture: ${error.message}`, { position: "top-center" });
          // Continue with other updates even if profile picture upload fails
        }
      }
      
      // 2. Upload certificates if any were selected
      if (formData.certificateFiles && formData.certificateFiles.length > 0) {
        toast.info(`Uploading ${formData.certificateFiles.length} certificate(s)...`, { position: "top-center" });
        
        try {
          const certificatesResponse = await uploadCertificates(formData.certificateFiles);
          
          // Make sure the role is preserved
          if (certificatesResponse && certificatesResponse.role !== currentRole) {
            console.log(`Role changed from ${currentRole} to ${certificatesResponse.role}. Fixing...`);
            // Update the profile again with the correct role if needed
            await updateProfile({ role: currentRole });
          }
          
          // Update our local state with the new certificates
          updatedProfile = {
            ...updatedProfile,
            certificates: certificatesResponse.certificates
          };
          
          toast.success("Certificates uploaded successfully!", { position: "top-center" });
        } catch (error) {
          toast.error(`Failed to upload certificates: ${error.message}`, { position: "top-center" });
          // Continue with other updates even if certificate upload fails
        }
      }
      
      // 3. Upload experience certificate if one was selected
      if (formData.experienceCertificateFile) {
        toast.info("Uploading experience certificate...", { position: "top-center" });
        
        try {
          const expCertResponse = await uploadExperienceCertificate(formData.experienceCertificateFile);
          
          // Make sure the role is preserved
          if (expCertResponse && expCertResponse.role !== currentRole) {
            console.log(`Role changed from ${currentRole} to ${expCertResponse.role}. Fixing...`);
            // Update the profile again with the correct role if needed
            await updateProfile({ role: currentRole });
          }
          
          // Update our local state with the new verified skills
          updatedProfile = {
            ...updatedProfile,
            verifiedSkills: expCertResponse.verifiedSkills
          };
          
          toast.success("Experience certificate uploaded successfully!", { position: "top-center" });
        } catch (error) {
          toast.error(`Failed to upload experience certificate: ${error.message}`, { position: "top-center" });
          // Continue with other updates even if experience certificate upload fails
        }
      }
      
      // 4. Finally, fetch the latest profile data to ensure everything is in sync
      try {
        const finalProfile = await fetchProfile();
        updatedProfile = finalProfile;
      } catch (error) {
        console.error("Error fetching updated profile:", error);
        // Continue with what we have if fetch fails
      }
      
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
        
        // Update the form data with the new display data but remove the file references
        // since they've been uploaded
        const { certificateFiles, experienceCertificateFile, ...cleanedData } = newDisplayData;
        setFormData(cleanedData);
      }
      
      // Reset states
      setProfilePicFile(null);
      setIsSubmitting(false);
      setEditMode(false); // Exit edit mode
      
      toast.success("Profile updated successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsSubmitting(false);
      toast.error(`Error updating profile: ${error.message || 'Please try again.'}`, {
        position: "top-center",
      });
    }
  };

  // Handle certificate uploads
  const handleCertificatesChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        // Validate files
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`File ${file.name} exceeds 5MB limit`, { position: "top-center" });
            return;
          }
          
          if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            toast.error(`File ${file.name} is not an image or PDF`, { position: "top-center" });
            return;
          }
        }
        
        // Store the files for upload later when form is submitted
        setFormData({
          ...formData,
          certificateFiles: files
        });
        
        // Show toast notification
        toast.info(`${files.length} certificate(s) selected. Click 'Save Changes' to upload.`, { position: "top-center" });
      } catch (error) {
        toast.error(`Error: ${error.message}`, { position: "top-center" });
      }
    }
  };

  // Handle experience certificate upload
  const handleExperienceCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size exceeds 5MB limit", { position: "top-center" });
          return;
        }
        
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          toast.error("Only image or PDF files are allowed", { position: "top-center" });
          return;
        }
        
        // Store the file for upload later when form is submitted
        setFormData({
          ...formData,
          experienceCertificateFile: file
        });
        
        // Show toast notification
        toast.info("Experience certificate selected. Click 'Save Changes' to upload.", { position: "top-center" });
      } catch (error) {
        toast.error(`Error: ${error.message}`, { position: "top-center" });
      }
    }
  };

  // Loading and error states
  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mt-2">Error Loading Profile</h2>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <div className="text-center">
          <button 
            onClick={() => fetchProfile()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
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
                      <div className="relative w-full h-full">
                        <img 
                          src={previewImage} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                        {profilePicFile && (
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="text-white text-xs font-medium px-2 py-1 bg-blue-500 rounded-full">
                              Pending Upload
                            </span>
                          </div>
                        )}
                      </div>
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
                <p className="text-sm text-gray-500 mt-2">Click the camera icon to select a profile picture</p>
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
                    <div className="relative">
                      <input
                        type="file"
                        name="certificates"
                        className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        multiple
                        onChange={handleCertificatesChange}
                      />
                      {formData.certificateFiles && formData.certificateFiles.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 flex items-center">
                            <Upload size={16} className="mr-2" />
                            {formData.certificateFiles.length} file(s) selected - Will be uploaded when you save
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 font-medium">
                      <Upload size={18} className="text-gray-500" /> Upload Experience Certificate
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="experienceCertificate"
                        className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        onChange={handleExperienceCertificateChange}
                      />
                      {formData.experienceCertificateFile && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 flex items-center">
                            <Upload size={16} className="mr-2" />
                            {formData.experienceCertificateFile.name} - Will be uploaded when you save
                          </p>
                        </div>
                      )}
                    </div>
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
              {(formData.role === 'learner' || formData.role === 'both') && (
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
              
              {/* Learning Budget - Only show for learner/both */}
              {(formData.role === 'learner' || formData.role === 'both') && (
                <div>
                  <label className="flex items-center gap-2 text-gray-600 font-medium">
                    <DollarSign size={18} className="text-gray-500" /> Your Learning Budget (PKR/hr)
                  </label>
                  <input
                    type="number"
                    name="learningBudget"
                    value={formData.learningBudget || 0}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Maximum amount you're willing to pay per hour"
                    className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Enter 0 if you're looking for free sessions only</span>
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
              
              {/* Hourly Rate - Only show for teacher/both */}
              {(formData.role === 'teacher' || formData.role === 'both') && (
                <div>
                  <label className="flex items-center gap-2 text-gray-600 font-medium">
                    <DollarSign size={18} className="text-gray-500" /> Your Teaching Rate (PKR/hr)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate || 0}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Amount you would like to charge per hour"
                    className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Enter 0 if you want to teach for free</span>
                </div>
              )}

              {/* Bank Account Details - Only show for teacher/both with hourlyRate > 0 */}
              {(formData.role === 'teacher' || formData.role === 'both') && formData.hourlyRate > 0 && (
                <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-700 mb-3 flex items-center gap-2">
                    <DollarSign size={18} /> Bank Account Details
                  </h4>
                  <p className="text-sm text-yellow-600 mb-4">Please provide your bank details so we can transfer your earnings</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-600 font-medium text-sm block mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="bankAccountName"
                        value={formData.bankAccountName || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your full name as on bank account"
                        className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-600 font-medium text-sm block mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your bank name"
                        className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-600 font-medium text-sm block mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your bank account number"
                        className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-600 font-medium text-sm block mb-1">
                        IBAN (Optional)
                      </label>
                      <input
                        type="text"
                        name="bankIBAN"
                        value={formData.bankIBAN || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your IBAN number"
                        className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Skill Level - Only show for learner role */}
              {formData.role === 'learner' && (
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
              )}

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
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
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
                    {/* Online status indicator */}
                    <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                    
                    {/* Verification badge for verified teachers */}
                    {(formData.role === 'teacher' || formData.role === 'both') && 
                     formData.verificationStatus === 'approved' && (
                      <div 
                        className="absolute top-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white"
                        title="Verified Teacher"
                      >
                        <CheckCircle size={14} />
                      </div>
                    )}
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
                      {/* Only show skill level for learners */}
                      {formData.role === 'learner' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                          {formData.skillLevel || "Beginner"}
                        </span>
                      )}
                      {/* Show teaching rate for teachers */}
                      {(formData.role === 'teacher' || formData.role === 'both') && (
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium flex items-center">
                          <DollarSign size={12} className="mr-1" />
                          {formData.hourlyRate ? `${formData.hourlyRate} PKR/hr` : "Free Teaching"}
                        </span>
                      )}
                      {/* Show learning budget for learners */}
                      {(formData.role === 'learner' || formData.role === 'both') && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium flex items-center">
                          <DollarSign size={12} className="mr-1" />
                          {formData.learningBudget ? `${formData.learningBudget} PKR/hr budget` : "Looking for free sessions"}
                        </span>
                      )}
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                          formData.verificationStatus === 'approved' 
                            ? "bg-green-100 text-green-600" 
                            : formData.verificationStatus === 'rejected'
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                        }`}
                        title={
                          formData.verificationStatus === 'approved' 
                            ? "This teacher's credentials have been verified by our team" 
                            : formData.verificationStatus === 'rejected'
                              ? formData.verificationRejectionReason || "Verification was rejected"
                              : "Verification is pending review by our team"
                        }
                      >
                        {formData.verificationStatus === 'approved' 
                          ? <><CheckCircle size={12} className="mr-1" /> Verified Teacher</> 
                          : formData.verificationStatus === 'rejected'
                            ? <><XCircle size={12} className="mr-1" /> Verification Rejected</>
                            : <><Clock size={12} className="mr-1" /> Pending Verification</>}
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
                  
                  {/* Skills to Learn Section - Only show for learner or both roles */}
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

                  {/* Skills to Teach Section - Only show for teacher or both roles */}
                  {(formData.role === 'teacher' || formData.role === 'both') && (
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 shadow-sm border border-green-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Lightbulb size={18} className="text-green-500" />
                        Skills I Can Teach
                        {formData.verificationStatus === 'approved' && (
                          <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs flex items-center">
                            <CheckCircle size={10} className="mr-1" /> Verified
                          </span>
                        )}
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

                {/* Payment Information - Only show for teachers charging money */}
                {(formData.role === 'teacher' || formData.role === 'both') && formData.hourlyRate > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                      <DollarSign size={20} className="text-green-500" />
                      Payment Information
                    </h3>
                    
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-4 bg-yellow-50 border-b border-yellow-100">
                        <p className="text-yellow-700 flex items-center gap-2">
                          <DollarSign size={16} />
                          <span className="font-medium">You charge {formData.hourlyRate} PKR per hour</span>
                        </p>
                      </div>
                      
                      {formData.bankDetails?.accountHolderName ? (
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Account Holder</p>
                              <p className="text-gray-800 font-medium">{formData.bankDetails.accountHolderName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Bank Name</p>
                              <p className="text-gray-800 font-medium">{formData.bankDetails.bankName || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Account Number</p>
                              <p className="text-gray-800 font-medium">
                                {formData.bankDetails.accountNumber ? 
                                  "••••" + formData.bankDetails.accountNumber.slice(-4) : 
                                  "Not specified"}
                              </p>
                            </div>
                            {formData.bankDetails.iban && (
                              <div>
                                <p className="text-xs text-gray-500">IBAN</p>
                                <p className="text-gray-800 font-medium">
                                  {formData.bankDetails.iban ? 
                                    "••••" + formData.bankDetails.iban.slice(-4) : 
                                    "Not specified"}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 text-center">
                            <button 
                              onClick={() => setEditMode(true)}
                              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Edit Payment Information
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-gray-500 mb-2">Your bank details are not yet set up</p>
                          <button 
                            onClick={() => setEditMode(true)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            Set up payment information
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                
                {/* Delete Account Section */}
                <div className="mt-12 border-t border-gray-200 pt-8">
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Danger Zone</h3>
                    <p className="text-gray-500 text-sm mb-4 text-center">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Account Modal */}
      <DeleteAccountModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
